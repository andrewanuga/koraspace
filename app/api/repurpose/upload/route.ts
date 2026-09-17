import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { sanitizeRetrievedContext } from "@/lib/security/enforcement";
import { uploadMediaBuffer, isCloudinaryConfigured } from "@/lib/media/cloudinary";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB ceiling

const ALLOWED_EXTS = new Set([
  "mp4", "mov", "avi", "mkv", "webm",
  "mp3", "wav", "m4a", "ogg", "flac", "aac",
  "png", "jpg", "jpeg", "webp", "gif",
  "pdf", "txt", "md", "csv",
]);

function isSafeHttpUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      (hostname.startsWith("172.") && /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) ||
      hostname === "169.254.169.254"
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
  const session = await auth();
      const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit uploads: 15 per minute per user
    const guard = await checkRequest(request, requestKey(request, user.id), 15);
    if (guard) return guard;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    // Handle URL extraction (Phase 2)
    if (url) {
      if (!isSafeHttpUrl(url)) {
        return NextResponse.json(
          { error: "Invalid or disallowed URL. Only public HTTP/HTTPS URLs are permitted." },
          { status: 400 }
        );
      }

      try {
        const fetchRes = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; KoraBot/1.0)" },
          signal: AbortSignal.timeout(10000),
        });
        const html = await fetchRes.text();
        
        // Strip HTML tags for clean text
        const rawText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 15000);

        // Sanitize retrieved external context against prompt injection attacks
        const cleanText = sanitizeRetrievedContext(rawText, 15000);

        return NextResponse.json({
          success: true,
          sourceType: "url",
          sourceName: url,
          sourceContent: cleanText,
          transcript: cleanText,
        });
      } catch (err: any) {
        return NextResponse.json(
          { error: `Could not fetch URL: ${err.message}` },
          { status: 400 }
        );
      }
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Enforce 50MB ceiling
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    const fileExt = (file.name.split(".").pop() || "").toLowerCase();

    // Prevent Stored XSS via SVG or unsupported executable formats
    if (file.type === "image/svg+xml" || fileExt === "svg") {
      return NextResponse.json(
        { error: "SVG files are not supported for security reasons." },
        { status: 400 }
      );
    }

    if (!ALLOWED_EXTS.has(fileExt)) {
      return NextResponse.json(
        { error: `File type .${fileExt} is not permitted.` },
        { status: 400 }
      );
    }

    const allowedTypes = ["video/", "audio/", "image/", "application/pdf", "text/"];
    const isAllowed = allowedTypes.some((t) => file.type.startsWith(t) || fileExt === "txt" || fileExt === "md" || fileExt === "csv");

    if (!isAllowed) {
      return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
    }

    const filePath = `${user.id}/${randomUUID()}.${fileExt || "bin"}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary if configured, fallback to local reference
    let uploadUrl: string | null = null;
    let publicId: string | null = null;
    let thumbnailUrl: string | null = null;

    try {
      const isVideo = file.type.startsWith("video/") || ["mp4", "mov", "webm", "mkv", "avi"].includes(fileExt);
      const isImage = file.type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(fileExt);

      if (isCloudinaryConfigured() && (isVideo || isImage)) {
        const cloudResult = await uploadMediaBuffer(buffer, {
          folder: "repurpose",
          resourceType: isVideo ? "video" : "image",
          filename: file.name,
          tags: ["user:" + user.id, "repurpose"],
        });

        uploadUrl = cloudResult.secure_url;
        publicId = cloudResult.public_id;
        thumbnailUrl = cloudResult.thumbnail_url || null;
      }
    } catch (cloudErr) {
      console.warn("Cloudinary upload fallback in repurpose:", cloudErr);
    }

    // Phase 2: Text extraction & simulated media transcription
    let extractedText = "";
    if (file.type.startsWith("text/") || fileExt === "txt" || fileExt === "md" || fileExt === "csv") {
      const raw = buffer.toString("utf-8");
      extractedText = sanitizeRetrievedContext(raw, 20000);
    } else {
      // For audio/video/image, generate transcript descriptor
      extractedText = `Uploaded media asset (${file.name}, ${(file.size / (1024 * 1024)).toFixed(1)}MB). Primary context from media file.`;
    }

    return NextResponse.json({
      success: true,
      filePath: uploadUrl || filePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      publicId: publicId || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      transcript: extractedText,
      sourceContent: extractedText,
    });
  } catch (error: any) {
    console.error("Repurpose upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
