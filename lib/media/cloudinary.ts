import { v2 as cloudinary, type UploadApiResponse, type UploadApiOptions } from "cloudinary";

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadMediaResult {
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: "image" | "video" | "raw";
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
}

export type MediaFolder =
  | "posts/images"
  | "posts/videos"
  | "repurpose"
  | "avatars"
  | "brand"
  | "prompts";

/**
 * Checks if Cloudinary is configured with valid credentials.
 */
export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(cloudName && apiKey && apiSecret) || Boolean(process.env.CLOUDINARY_URL);
}

/**
 * Uploads a file buffer or base64 string to Cloudinary.
 */
export async function uploadMediaBuffer(
  buffer: Buffer,
  options: {
    folder?: MediaFolder | string;
    resourceType?: "image" | "video" | "auto" | "raw";
    filename?: string;
    tags?: string[];
  } = {}
): Promise<UploadMediaResult> {
  const folder = options.folder ? `koraspace/${options.folder}` : "koraspace/uploads";
  const resourceType = options.resourceType || "auto";

  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: resourceType,
      use_filename: Boolean(options.filename),
      unique_filename: true,
      overwrite: false,
      tags: options.tags || ["koraspace"],
    };

    // Apply auto-format and auto-quality transformations
    if (resourceType === "image") {
      uploadOptions.transformation = [
        { quality: "auto", fetch_format: "auto" },
      ];
    } else if (resourceType === "video") {
      uploadOptions.transformation = [
        { quality: "auto", fetch_format: "auto" },
      ];
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed with empty result."));
        }

        const isVideo = result.resource_type === "video";
        
        // Generate poster thumbnail for video
        let thumbnailUrl: string | undefined = undefined;
        if (isVideo) {
          thumbnailUrl = cloudinary.url(result.public_id, {
            resource_type: "video",
            format: "jpg",
            transformation: [{ start_offset: "auto" }, { quality: "auto" }],
          });
        }

        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: (result.resource_type as "image" | "video" | "raw") || "image",
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          duration: result.duration,
          thumbnail_url: thumbnailUrl || result.secure_url,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Uploads an image with automatic WebP/AVIF formatting and compression.
 */
export async function uploadImage(
  buffer: Buffer,
  folder: MediaFolder = "posts/images",
  tags: string[] = []
): Promise<UploadMediaResult> {
  return uploadMediaBuffer(buffer, {
    folder,
    resourceType: "image",
    tags,
  });
}

/**
 * Uploads a video with automatic transcoding and poster thumbnail generation.
 */
export async function uploadVideo(
  buffer: Buffer,
  folder: MediaFolder = "posts/videos",
  tags: string[] = []
): Promise<UploadMediaResult> {
  return uploadMediaBuffer(buffer, {
    folder,
    resourceType: "video",
    tags,
  });
}

/**
 * Deletes an asset from Cloudinary by public ID.
 */
export async function deleteMedia(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<{ result: string }> {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

/**
 * Generates platform-specific social media transformation URLs on-the-fly.
 */
export function getSocialOptimizedUrl(
  publicIdOrUrl: string,
  platform: "instagram" | "tiktok" | "x" | "linkedin" | "youtube" | "facebook" | "threads",
  type: "image" | "video" = "image"
): string {
  if (!publicIdOrUrl) return "";

  // If already a full URL and not Cloudinary, return as-is
  if (publicIdOrUrl.startsWith("http") && !publicIdOrUrl.includes("cloudinary.com")) {
    return publicIdOrUrl;
  }

  // Extract public ID if full Cloudinary URL is passed
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes("/upload/")) {
    const parts = publicIdOrUrl.split("/upload/");
    if (parts[1]) {
      // Strip existing transformations if any (e.g. v1234/folder/id.jpg)
      const afterUpload = parts[1].replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
      publicId = afterUpload;
    }
  }

  let transformation: any = { quality: "auto", fetch_format: "auto" };

  switch (platform) {
    case "instagram":
      // Square 1:1 for feed or 9:16 for Reels/Stories
      transformation = {
        aspect_ratio: type === "video" ? "9:16" : "1:1",
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        fetch_format: "auto",
      };
      break;

    case "tiktok":
    case "youtube":
      // 9:16 Vertical for Short-form video
      transformation = {
        aspect_ratio: "9:16",
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        fetch_format: "auto",
      };
      break;

    case "x":
    case "linkedin":
    case "facebook":
      // 16:9 Landscape for timeline link cards & updates
      transformation = {
        aspect_ratio: "16:9",
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        fetch_format: "auto",
      };
      break;

    default:
      transformation = { quality: "auto", fetch_format: "auto" };
      break;
  }

  return cloudinary.url(publicId, {
    resource_type: type,
    transformation: [transformation],
    secure: true,
  });
}
