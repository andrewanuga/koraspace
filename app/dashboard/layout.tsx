import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "./DashboardShell";

/*
 * Server-side layout — no "use client" directive.
 *
 * This runs on every request to /dashboard/** and enforces two guards:
 *
 * 1. Session guard  – if the JWT session is missing, redirect to /login.
 * 2. Profile guard  – if the session user has no row in `profiles`, redirect
 *    to /login. This handles the case where a user's account has been deleted
 *    or was never fully persisted.
 *
 * NOTE: Prisma runs on Node.js runtime (not Edge). Layouts are always
 *       Node.js runtime by default, so Prisma is safe here.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  /* ---- 1. Session guard ---- */
  if (!user?.id) {
    redirect("/login");
  }

  /* ---- 2. Profile existence guard ---- */
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, onboarded: true },
  });

  if (!profile) {
    /*
     * The JWT token exists but there is no matching profile row.
     * This can happen when:
     *   - The user's account was deleted from the DB.
     *   - A stale cookie / token exists from a previous account.
     * Redirect to login so the session is cleared.
     */
    redirect("/login");
  }

  if (!profile.onboarded) {
    /*
     * User authenticated but hasn't completed onboarding yet.
     * Send them to the onboarding flow.
     */
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}