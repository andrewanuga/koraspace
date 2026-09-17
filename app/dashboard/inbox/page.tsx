import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
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

  const [{ data: accounts }, { data: messages }, { data: notifs }] =
    await Promise.all([
      supabase
        .from("social_accounts")
        .select("*")
        .order("connected_at", { ascending: false }),

      supabase
        .from("social_inbox")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(200),

      supabase
        .from("user_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  const allAccounts = [
    {
      id: "system",
      platform: "system" as any,
      handle: "Koraspace",
      display_name: "System Notifications",
    },
    ...(accounts ?? []),
  ] as SocialAccount[];

  const systemMessages = (notifs ?? []).map((n) => ({
    id: n.id,
    account_id: "system",
    platform: "system" as any,
    author_name: n.title || "KoraSpace",
    author_handle: "system",
    body: n.body,
    category: n.type || "info",
    importance: "normal",
    is_read: n.is_read,
    received_at: n.created_at,
    reply_body: null,
    replied: false,
    kind: "notification",
  }));

  const allMessages = [
    ...(messages ?? []),
    ...systemMessages,
  ].sort(
    (a, b) =>
      new Date(b.received_at).getTime() -
      new Date(a.received_at).getTime()
  );

  return (
    <InboxClient
      accounts={allAccounts}
      messages={allMessages as SocialInboxMessage[]}
    />
  );
}