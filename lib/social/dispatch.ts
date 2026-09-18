/**
 * Koraspace Social Dispatch Engine
 *
 * Dispatches automated AI replies, human-agent responses (using Meta HUMAN_AGENT tag),
 * comment moderation, engagement, and direct messages across Instagram, Facebook, and Telegram.
 */

export interface DispatchReplyParams {
  platform: string;
  recipientId: string;
  token: string;
  message?: string;
  isComment?: boolean;
  commentId?: string;
  isHumanAgent?: boolean;
  likeComment?: boolean;
  productTags?: Array<{ product_id: string; position?: [number, number] }>;
}

export async function dispatchReply(params: DispatchReplyParams): Promise<boolean> {
  const {
    platform,
    recipientId,
    token,
    message,
    isComment,
    commentId,
    isHumanAgent,
    likeComment,
  } = params;

  try {
    // ── 1. Telegram Dispatch ────────────────────────────────────────────────
    if (platform === "telegram") {
      if (!message) return false;
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: recipientId,
          text: message,
        }),
      });
      if (!res.ok) throw new Error(`Telegram Error: ${await res.text()}`);
      return true;
    }

    // ── 2. WhatsApp Cloud API Dispatch ─────────────────────────────────────
    if (platform === "whatsapp") {
      if (!message) return false;
      const phoneId = process.env.WHATSAPP_PHONE_ID || "me";
      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientId,
          type: "text",
          text: { preview_url: false, body: message },
        }),
      });
      if (!res.ok) throw new Error(`WhatsApp Error: ${await res.text()}`);
      return true;
    }

    // ── 2. Instagram & Facebook Meta Graph API Dispatch ────────────────────
    if (platform === "instagram" || platform === "facebook") {
      const apiVersion = "v21.0";

      // A. Comment Engagement: Like / Favorite comment
      if (isComment && commentId && likeComment) {
        const res = await fetch(`https://graph.facebook.com/${apiVersion}/${commentId}/likes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Meta Comment Like Error: ${await res.text()}`);
        return true;
      }

      // B. Comment Reply
      if (isComment && commentId && message) {
        const res = await fetch(`https://graph.facebook.com/${apiVersion}/${commentId}/replies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        });
        if (!res.ok) throw new Error(`Meta Comment Reply Error: ${await res.text()}`);
        return true;
      }

      // C. Direct Message (DM) with Human Agent Tag Support
      if (recipientId && message) {
        const payload: Record<string, unknown> = {
          recipient: { id: recipientId },
          message: { text: message },
          messaging_type: isHumanAgent ? "MESSAGE_TAG" : "RESPONSE",
        };

        // If human agent responded within 7 days, attach HUMAN_AGENT tag
        if (isHumanAgent) {
          payload.tag = "HUMAN_AGENT";
        }

        const res = await fetch(`https://graph.facebook.com/${apiVersion}/me/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`Meta DM Error: ${await res.text()}`);
        return true;
      }
    }

    console.warn(`[Dispatch] Unsupported platform: ${platform}`);
    return false;
  } catch (err) {
    console.error(`[Dispatch] Failed to send reply to ${platform}:`, err);
    return false;
  }
}

/**
 * Searches public hashtag content on Instagram Graph API (Instagram Public Content Access).
 */
export async function searchInstagramHashtag(params: {
  igUserId: string;
  hashtag: string;
  token: string;
}) {
  const { igUserId, hashtag, token } = params;
  try {
    const cleanTag = hashtag.replace(/^#/, "");
    // Step 1: Query hashtag ID
    const searchRes = await fetch(
      `https://graph.facebook.com/v21.0/ig_hashtag_search?user_id=${igUserId}&q=${encodeURIComponent(cleanTag)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!searchRes.ok) throw new Error(`Hashtag search failed: ${await searchRes.text()}`);
    const searchData = await searchRes.json();
    const tagId = searchData.data?.[0]?.id;
    if (!tagId) return [];

    // Step 2: Fetch top/recent media for this hashtag
    const mediaRes = await fetch(
      `https://graph.facebook.com/v21.0/${tagId}/top_media?user_id=${igUserId}&fields=id,caption,media_type,media_url,permalink,like_count,comments_count`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!mediaRes.ok) throw new Error(`Hashtag media fetch failed: ${await mediaRes.text()}`);
    const mediaData = await mediaRes.json();
    return mediaData.data || [];
  } catch (err) {
    console.error(`[Meta API] Hashtag search error:`, err);
    return [];
  }
}
