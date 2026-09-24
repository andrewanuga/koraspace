import { createClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { InboxClient } from "./InboxClient";
import type {
  SocialAccount,
  SocialInboxMessage,
} from "@/lib/social/types";

export default async function InboxPage() {
  const session = await auth();
  const user = session?.user;
  const supabase = await createClient();

  if (!user) redirect("/login");

  const [{ data: accounts }, { data: messages }] =
    await Promise.all([
      supabase
        .from("social_accounts")
        .select("id, user_id, platform, account_type, external_id, handle, display_name, avatar_url, scopes, status, followers, following, runs_ads, connected_at, last_synced_at, meta")
        .eq("user_id", user.id),

      supabase
        .from("social_inbox")
        .select("*")
        .eq("user_id", user.id)
        .order("received_at", { ascending: false })
        .limit(200),
    ]);

  const socialAccounts = (accounts ?? []) as SocialAccount[];

  const formattedMessages: SocialInboxMessage[] = (messages ?? []).map((m: any) => ({
    id: m.id,
    user_id: m.user_id,
    account_id: m.account_id || m.platform,
    platform: m.platform,
    thread_id: m.thread_id || m.platform_message_id || null,
    kind: (m.kind as any) || (m.category === "mention" ? "mention" : "dm"),
    author_name: m.author_name || null,
    author_handle: m.author_handle || null,
    author_avatar: m.author_avatar || null,
    body: m.body || m.message || "",
    category: (m.category as any) || "lead",
    importance: (m.importance as any) || "normal",
    is_read: Boolean(m.is_read),
    replied: Boolean(m.replied),
    reply_body: m.reply_body || m.reply_content || null,
    received_at: m.received_at || new Date().toISOString(),
  }));

  return (
    <InboxClient
      accounts={socialAccounts}
      messages={formattedMessages}
    />
  );
}