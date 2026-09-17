import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AutomationsClient } from "./AutomationsClient";

export default async function AutomationsPage() {
  const session = await auth();
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona, full_name")
    .eq("id", user.id)
    .single();

  if (
    profile &&
    profile.persona !== "marketer" &&
    profile.plan !== "advanced" &&
    profile.plan !== "team"
  ) {
    redirect("/dashboard");
  }

  // 1. Fetch from enterprise automations table
  let { data: automations } = await (supabase as any)
    .from("automations")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  // 2. Fallback to legacy marketing_automations if automations is empty
  if (!automations || automations.length === 0) {
    const { data: legacy } = await (supabase as any)
      .from("marketing_automations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (legacy && legacy.length > 0) {
      automations = legacy.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        status: row.status,
        trigger_type: row.trigger_type,
        nodes: row.nodes || row.steps || [],
        edges: row.edges || [],
        total_runs: row.contacts_count || 0,
        successful_runs: row.conversions || 0,
        failed_runs: 0,
        last_run_at: row.last_run_at,
        updated_at: row.updated_at,
      }));
    }
  }

  return (
    <AutomationsClient
      initialAutomations={automations ?? []}
      userName={profile?.full_name ?? "Marketer"}
    />
  );
}
