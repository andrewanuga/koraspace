"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";



async function verifyAdmin() {
  const session = await auth();
    const user = session?.user;
  if (!user) throw new Error("Unauthorized");
  if (!adminDb) throw new Error("Admin client not configured");

  const { data: profile } = await adminDb
    .from("profiles")
    .select("is_admin, plan")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin && profile?.plan !== "team") {
    throw new Error("Forbidden: Administrator privileges required");
  }
  return user;
}

export async function resolveTicket(id: string) {
  await verifyAdmin();
  if (!adminDb) throw new Error("Admin client not configured");

  const { error } = await adminDb
    .from("support_tickets")
    .update({ status: "resolved", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function replyToTicket(id: string, replyMessage: string) {
  const admin = await verifyAdmin();
  if (!adminDb) throw new Error("Admin client not configured");

  const { error } = await adminDb
    .from("support_tickets")
    .update({
      admin_reply: replyMessage,
      admin_id: admin.id,
      status: "resolved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Send in-app notification to user
  const { data: ticket } = await adminDb
    .from("support_tickets")
    .select("user_id, category")
    .eq("id", id)
    .maybeSingle();

  if (ticket?.user_id) {
    await adminDb.from("user_notifications").insert({
      user_id: ticket.user_id,
      title: "Support Ticket Response",
      body: `Support has replied to your inquiry: "${replyMessage.slice(0, 100)}..."`,
      type: "support",
    }).then(() => {}, () => {});
  }
}
