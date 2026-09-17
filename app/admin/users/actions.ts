"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { type PlanId } from "@/lib/billing/plans";
import { cookies } from "next/headers";

async function verifyAdmin() {
  const session = await auth();
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { is_admin: true, plan: true }
  });

  if (!profile?.is_admin && profile?.plan !== "team") {
    throw new Error("Forbidden: Administrator access required");
  }
  return user;
}

export async function updateUserPlan(userId: string, plan: PlanId) {
  const admin = await verifyAdmin();

  await prisma.profile.update({
    where: { id: userId },
    data: { plan }
  });

  await prisma.securityEvent.create({
    data: {
      type: "admin_plan_override",
      user_id: userId,
      severity: "info",
      detail: `Admin ${admin.email || admin.id} changed user plan to ${plan}`,
    }
  }).catch(() => {});
}

export async function toggleUserSuspension(
  userId: string,
  suspend: boolean,
  fullName: string | null,
  reason?: string
) {
  const admin = await verifyAdmin();

  await prisma.profile.update({
    where: { id: userId },
    data: {
      suspended: suspend,
      suspended_at: suspend ? new Date() : null,
    }
  });

  await prisma.securityEvent.create({
    data: {
      type: suspend ? "user_suspended" : "user_reinstated",
      user_id: userId,
      severity: suspend ? "warning" : "info",
      detail: `${suspend ? "Suspended" : "Reinstated"} ${fullName || userId}${
        reason ? ` - Reason: ${reason}` : ""
      } by Admin`,
    }
  }).catch(() => {});
}

export async function grantUserCredits(userId: string, extraGenerations: number) {
  const admin = await verifyAdmin();

  const current = await prisma.profile.findUnique({
    where: { id: userId },
    select: { generations_used: true }
  });

  const currentUsed = Number(current?.generations_used || 0);
  const newUsed = Math.max(0, currentUsed - extraGenerations);

  await prisma.profile.update({
    where: { id: userId },
    data: { generations_used: newUsed }
  });

  await prisma.securityEvent.create({
    data: {
      type: "admin_credit_grant",
      user_id: userId,
      severity: "info",
      detail: `Admin granted ${extraGenerations} AI compute credits to user`,
    }
  }).catch(() => {});
}

export async function setUserAdminRole(userId: string, isAdmin: boolean) {
  const admin = await verifyAdmin();

  if (admin.id === userId && !isAdmin) {
    throw new Error("Cannot revoke your own administrator privileges");
  }

  await prisma.profile.update({
    where: { id: userId },
    data: { is_admin: isAdmin }
  });

  await prisma.securityEvent.create({
    data: {
      type: "admin_role_change",
      user_id: userId,
      severity: "critical",
      detail: `Admin ${admin.id} ${isAdmin ? "granted" : "revoked"} admin privileges for ${userId}`,
    }
  }).catch(() => {});
}

export async function impersonateUser(targetUserId: string) {
  const admin = await verifyAdmin();
  if (admin.id === targetUserId) throw new Error("Cannot impersonate yourself");

  const targetProfile = await prisma.profile.findUnique({
    where: { id: targetUserId },
    select: { is_admin: true }
  });

  if (!targetProfile) throw new Error("Target user not found");
  if (targetProfile.is_admin) throw new Error("Cannot impersonate another administrator");

  const cookieStore = await cookies();
  cookieStore.set("sai-admin-impersonate", targetUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  await prisma.securityEvent.create({
    data: {
      type: "admin_impersonation_started",
      user_id: targetUserId,
      severity: "warning",
      detail: `Admin ${admin.id} started impersonating account ${targetUserId}`,
    }
  }).catch(() => {});
}

export async function stopImpersonation() {
  const cookieStore = await cookies();
  cookieStore.delete("sai-admin-impersonate");
}
export async function getUsers() {
  const admin = await verifyAdmin();
  
  const users = await prisma.profile.findMany({
    select: {
      id: true,
      full_name: true,
      username: true,
      persona: true,
      plan: true,
      subscription_status: true,
      suspended: true,
      is_admin: true,
      created_at: true,
      generations_used: true
    },
    orderBy: { created_at: 'desc' },
    take: 500
  });

  return users;
}
