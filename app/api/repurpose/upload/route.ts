import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    // Handle URL extraction (Phase 2)
    if (url) {
      try {
        const fetchRes = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; KoraBot/1.0)" },
        });
        const html = await fetchRes.text();
        
        // Strip HTML tags for clean text
        const cleanText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 15000);

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

    const allowedTypes = ["video/", "audio/", "image/", "application/pdf", "text/"];
    const isAllowed = allowedTypes.some((t) => file.type.startsWith(t) || file.name.endsWith(".txt") || file.name.endsWith(".md"));

    if (!isAllowed) {
      return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() || "bin";
    const filePath = `${user.id}/${randomUUID()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage if bucket exists (non-blocking if not configured)
    let uploadUrl: string | null = null;
    try {
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("repurpose-assets")
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        uploadUrl = filePath;
      }
    } catch {
      // Storage bucket not yet created in Supabase dashboard, graceful fallback
    }

    // Phase 2: Text extraction & simulated media transcription
    let extractedText = "";
    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      extractedText = buffer.toString("utf-8");
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
