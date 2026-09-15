"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");

  const { data: profile } = await adminDb
    .from("profiles")
    .select("is_admin, plan")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin && profile?.plan !== "team") {
    throw new Error("Forbidden: Administrator privileges required");
  }
  return user;
}

export async function createBroadcast(
  message: string,
  type: "info" | "warning" | "critical" = "info",
  targetUser?: string,
  targetPlan?: string,
  style: "banner" | "toast" | "modal" = "banner",
  linkUrl?: string
) {
  const admin = await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");

  // If targeted at a single user, create direct notification
  if (targetUser) {
    const { error } = await adminDb.from("user_notifications").insert({
      user_id: targetUser,
      title: `${type.toUpperCase()} Announcement`,
      body: message,
      type: "system",
    });
    if (error) throw new Error(error.message);
    return;
  }

  // Otherwise create global/targeted broadcast
  const { error } = await adminDb.from("system_broadcasts").insert({
    message,
    type,
    is_active: true,
    created_by: admin.id,
    target_plan: targetPlan || null,
    style,
    link_url: linkUrl || null,
  });

  if (error) throw new Error(error.message);
}

export async function toggleBroadcast(id: string, is_active: boolean) {
  await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");

  const { error } = await adminDb
    .from("system_broadcasts")
    .update({ is_active })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteBroadcast(id: string) {
  await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");

  const { error } = await adminDb
    .from("system_broadcasts")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
