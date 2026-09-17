import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import {
  uploadMediaBuffer,
  isCloudinaryConfigured,
  type MediaFolder,
} from "@/lib/media/cloudinary";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime", // .mov
  "video/webm",
  "video/x-matroska", // .mkv
  "video/avi",
]);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // Rate limit media uploads: 20 per minute per user
    const guard = await checkRequest(req, requestKey(req, user.id), 20);
    if (guard) return guard;

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error:
            "Cloudinary media storage is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables.",
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestedFolder = (formData.get("folder") as MediaFolder) || "posts/images";
    const customTags = (formData.get("tags") as string)?.split(",").map((t) => t.trim()) || [];

    if (!file) {
      return NextResponse.json({ error: "No media file provided." }, { status: 400 });
    }

    const mimeType = file.type.toLowerCase();
    const isImage = ALLOWED_IMAGE_TYPES.has(mimeType) || mimeType.startsWith("image/");
    const isVideo = ALLOWED_VIDEO_TYPES.has(mimeType) || mimeType.startsWith("video/");

    // Security check: Block SVGs to prevent Stored XSS vectors
    if (mimeType === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
      return NextResponse.json(
        { error: "SVG format is disallowed for security reasons." },
        { status: 400 }
      );
    }

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error: `Unsupported media format (${file.type || "unknown"}). Supported formats include JPEG, PNG, WebP, GIF, MP4, MOV, and WebM.`,
        },
        { status: 400 }
      );
    }

    // Size limit verification
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `Image file size exceeds maximum limit of ${(MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0)}MB.` },
        { status: 400 }
      );
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: `Video file size exceeds maximum limit of ${(MAX_VIDEO_SIZE / (1024 * 1024)).toFixed(0)}MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadMediaBuffer(buffer, {
      folder: requestedFolder,
      resourceType: isVideo ? "video" : "image",
      filename: file.name,
      tags: ["user:" + user.id, ...customTags],
    });

    return NextResponse.json({
      success: true,
      media: {
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
        thumbnail_url: result.thumbnail_url,
      },
    });
  } catch (err: any) {
    console.error("[/api/media/upload] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload media asset to Cloudinary." },
      { status: 500 }
    );
  }
}
