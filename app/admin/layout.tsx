import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { Shield, Clock, ArrowLeft, Radio } from "lucide-react";
import Link from "next/link";

<<<<<<< HEAD
export const metadata = { title: "Admin - Koraspace AI" };
=======
export const metadata = {
  title: "Admin SOC - Koraspace",
  description: "Security Operations Center, User Administration, and Health Matrix",
};
>>>>>>> main

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { is_admin: true, full_name: true, plan: true }
  });

  const isAdmin = Boolean(profile?.is_admin || profile?.plan === "team");
  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f3f4f6]">
      <AdminNav />

      {/* Main Content wrapper */}
      <div className="min-h-screen pl-[250px]">
        {/* Top SOC Status Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#0b0c10]/80 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SOC Engine: Active
            </span>

            <span className="hidden text-xs text-white/40 md:inline-block">
              Zero-Trust Sentinel Online
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-white/60 sm:flex">
              <Clock className="h-3.5 w-3.5 text-white/40" />
              <span className="font-data">UTC {new Date().toISOString().slice(11, 16)}</span>
            </div>

            <div className="flex items-center gap-2.5 border-l border-white/10 pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-xs font-bold text-blue-400 border border-blue-500/30">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">
                  {profile?.full_name || "Admin Officer"}
                </p>
                <p className="text-[10px] text-white/40">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
