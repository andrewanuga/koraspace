import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMarketerOverview } from "@/lib/marketer/overview";
import { AgencyClient } from "./AgencyClient";
import type { ApprovalItem } from "./AgencyClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketing Agent & Command Center | KoraSpace",
  description: "Autonomous marketing operator monitoring campaigns, performance, and approval pipelines.",
};

export default async function AgencyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona")
    .eq("id", user.id)
    .single();

  const hasMarketerAccess =
    profile?.persona === "marketer" &&
    (profile.plan === "advanced" || profile.plan === "team");

  if (!hasMarketerAccess) {
    redirect("/dashboard");
  }

  const [initialOverview, { data: pendingAutomations }] = await Promise.all([
    getMarketerOverview({ userId: user.id, range: "30d" }),

    // Fetch automations whose most recent run is in "waiting_approval" state
    supabase
      .from("automations")
      .select(`
        id,
        name,
        description,
        trigger_type,
        status,
        automation_runs!inner (
          id,
          status,
          started_at
        )
      `)
      .eq("user_id", user.id)
      .eq("automation_runs.status", "waiting")
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // Map automations to ApprovalItem shape expected by AgencyClient
  const initialApprovals: ApprovalItem[] = (pendingAutomations || []).map(
    (automation: any) => ({
      id: automation.id as string,
      type: mapTriggerToApprovalType(automation.trigger_type as string),
      title: (automation.name as string) || "Automation approval required",
      description:
        (automation.description as string) ||
        "This automation workflow is paused and awaiting your approval before continuing.",
      client: (automation.name as string) || "Workflow",
      priority: "high" as const,
      action: "Review workflow",
    })
  );

  return (
    <AgencyClient
      initialOverview={initialOverview}
      initialApprovals={initialApprovals}
    />
  );
}

function mapTriggerToApprovalType(
  triggerType: string
): ApprovalItem["type"] {
  if (triggerType === "campaign_event") return "campaign";
  if (triggerType === "message_received" || triggerType === "dm_received")
    return "message";
  if (triggerType === "content_published") return "content";
  return "optimization";
}

