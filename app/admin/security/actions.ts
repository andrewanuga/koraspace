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

export async function blockIpAddress(ip: string) {
  const user = await verifyAdmin();
  if (!adminDb) throw new Error("Admin client not configured - check SUPABASE_SERVICE_ROLE_KEY");
  
  const { error } = await adminDb.from("blocked_ips").upsert(
    { ip, reason: "Manually blocked by admin", auto: false, blocked_by: user.id },
    { onConflict: "ip" }
  );
  if (error) throw new Error(error.message);
}

export async function unblockIpAddress(ip: string) {
  await verifyAdmin();
  if (!adminDb) throw new Error("Admin client not configured - check SUPABASE_SERVICE_ROLE_KEY");
  
  const { error } = await adminDb.from("blocked_ips").delete().eq("ip", ip);
  if (error) throw new Error(error.message);
}
