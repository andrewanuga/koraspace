"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { type PlanId } from "@/lib/billing/plans";
import { cookies } from "next/headers";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin service client missing");

  const { data: profile } = await adminDb
    .from("profiles")
    .select("is_admin, plan")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin && profile?.plan !== "team") {
    throw new Error("Forbidden: Administrator access required");
  }
  return user;
}

export async function updateUserPlan(userId: string, plan: PlanId) {
  const admin = await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");

  const { error } = await adminDb
    .from("profiles")
    .update({ plan })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  await adminDb.from("security_events").insert({
    type: "admin_plan_override",
    user_id: userId,
    severity: "info",
    detail: `Admin ${admin.email || admin.id} changed user plan to ${plan}`,
  }).then(() => {}, () => {});
}

export async function toggleUserSuspension(
  userId: string,
  suspend: boolean,
  fullName: string | null,
  reason?: string
) {
  const admin = await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");

  const { error } = await adminDb
    .from("profiles")
    .update({
      suspended: suspend,
      suspended_at: suspend ? new Date().toISOString() : null,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  await adminDb.from("security_events").insert({
    type: suspend ? "user_suspended" : "user_reinstated",
    user_id: userId,
    severity: suspend ? "warning" : "info",
    detail: `${suspend ? "Suspended" : "Reinstated"} ${fullName || userId}${
      reason ? ` — Reason: ${reason}` : ""
    } by Admin`,
  }).then(() => {}, () => {});
}

export async function grantUserCredits(userId: string, extraGenerations: number) {
  const admin = await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");

  const { data: current } = await adminDb
    .from("profiles")
    .select("generations_used")
    .eq("id", userId)
    .single();

  const currentUsed = Number(current?.generations_used || 0);
  const newUsed = Math.max(0, currentUsed - extraGenerations);

  const { error } = await adminDb
    .from("profiles")
    .update({ generations_used: newUsed })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  await adminDb.from("security_events").insert({
    type: "admin_credit_grant",
    user_id: userId,
    severity: "info",
    detail: `Admin granted ${extraGenerations} AI compute credits to user`,
  }).then(() => {}, () => {});
}

export async function setUserAdminRole(userId: string, isAdmin: boolean) {
  const admin = await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");

  if (admin.id === userId && !isAdmin) {
    throw new Error("Cannot revoke your own administrator privileges");
  }

  const { error } = await adminDb
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  await adminDb.from("security_events").insert({
    type: "admin_role_change",
    user_id: userId,
    severity: "critical",
    detail: `Admin ${admin.id} ${isAdmin ? "granted" : "revoked"} admin privileges for ${userId}`,
  }).then(() => {}, () => {});
}

export async function impersonateUser(targetUserId: string) {
  const admin = await verifyAdmin();
  if (admin.id === targetUserId) throw new Error("Cannot impersonate yourself");

  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");

  const { data: targetProfile, error } = await adminDb
    .from("profiles")
    .select("is_admin")
    .eq("id", targetUserId)
    .single();

  if (error || !targetProfile) throw new Error("Target user not found");
  if (targetProfile.is_admin) throw new Error("Cannot impersonate another administrator");

  const cookieStore = await cookies();
  cookieStore.set("sai-admin-impersonate", targetUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  await adminDb.from("security_events").insert({
    type: "admin_impersonation_started",
    user_id: targetUserId,
    severity: "warning",
    detail: `Admin ${admin.id} started impersonating account ${targetUserId}`,
  }).then(() => {}, () => {});
}

export async function stopImpersonation() {
  const cookieStore = await cookies();
  cookieStore.delete("sai-admin-impersonate");
}
