export type CreateMode =
  | "post"
  | "caption"
  | "hashtags"
  | "repurpose"
  | "brand";

export type Platform =
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "x"
  | "youtube";

export type Attachment = {
  id: number;
  type: "image" | "video" | "file";
  name: string;
  mime: string;
  preview?: string;
  dataUrl?: string;
  content?: string;
};

export type Msg = {
  id: string | number;
  role: "user" | "assistant";
  content: string;
  model?: string;
  attachments?: {
    type: Attachment["type"];
    name: string;
    preview?: string;
  }[];
};

export type ModelOption = {
  id: string;
  name: string;
  provider: string;
  supportsVision: boolean;
  tier?: string;
};
