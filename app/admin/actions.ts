"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function getAdminOverviewStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { is_admin: true, plan: true }
  });

  if (!profile?.is_admin && profile?.plan !== "team") {
    throw new Error("Forbidden");
  }

  const since7 = new Date(Date.now() - 7 * 864e5);
  const since24 = new Date(Date.now() - 864e5);

  const [
    users,
    new7,
    suspended,
    blocked,
    events24,
    profiles,
    pays,
    evs
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { created_at: { gte: since7 } } }),
    prisma.profile.count({ where: { suspended: true } }),
    prisma.blockedIp.count(),
    prisma.securityEvent.count({ where: { created_at: { gte: since24 } } }),
    prisma.profile.findMany({ select: { plan: true, created_at: true, subscription_status: true } }),
    prisma.payment.findMany({ select: { amount: true, status: true } }),
    prisma.securityEvent.findMany({
      select: { id: true, type: true, ip: true, email: true, severity: true, created_at: true, detail: true },
      orderBy: { created_at: 'desc' },
      take: 16
    })
  ]);

  return {
    users,
    new7,
    suspended,
    blocked,
    events24,
    profiles,
    pays,
    evs
  };
}
