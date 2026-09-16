"use server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";



async function verifyAdmin() {
  const supabase = await createClient();
    const session = await auth();
    const user = session?.user;
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) throw new Error("Forbidden: Not an admin");
  return user;
}

export async function suspendUser(userId: string, reason?: string) {
  await verifyAdmin();
  if (!admin) throw new Error("Admin client not configured");

  const { error } = await admin
    .from("profiles")
    .update({ suspended: true })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  // Log the action.
  await admin.from("security_events").insert({
    type: "user_suspended",
    user_id: userId,
    severity: "warning",
    detail: reason ?? "Suspended by admin",
  });
}

export async function unsuspendUser(userId: string) {
  await verifyAdmin();
  if (!admin) throw new Error("Admin client not configured");

  const { error } = await admin
    .from("profiles")
    .update({ suspended: false })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  await admin.from("security_events").insert({
    type: "user_unsuspended",
    user_id: userId,
    severity: "info",
    detail: "Unsuspended by admin",
  });
}

export async function flagUserForReview(userId: string, note?: string) {
  await verifyAdmin();
  if (!admin) throw new Error("Admin client not configured");

  await admin.from("security_events").insert({
    type: "user_flagged",
    user_id: userId,
    severity: "warning",
    detail: note ?? "Flagged for manual review",
  });
}
