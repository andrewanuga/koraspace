import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkflowBuilder } from "../WorkflowBuilder";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function AutomationDetailPage({ params }: Props) {
  const { id } = await params;
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

  if (
    profile &&
    profile.persona !== "marketer" &&
    profile.plan !== "advanced" &&
    profile.plan !== "team"
  ) {
    redirect("/dashboard");
  }

  // 1. Fetch from automations
  let { data: automation } = await (supabase as any)
    .from("automations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  // 2. Fallback to marketing_automations
  if (!automation) {
    const { data: legacy } = await (supabase as any)
      .from("marketing_automations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (legacy) {
      automation = {
        id: legacy.id,
        name: legacy.name,
        description: legacy.description,
        status: legacy.status,
        nodes: legacy.nodes || legacy.steps || [],
        edges: legacy.edges || [],
        settings: legacy.settings || {
          timezone: "UTC",
          maxRunsPerHour: 100,
          failurePolicy: "continue",
        },
      };
    }
  }

  if (!automation) {
    redirect("/dashboard/automations");
  }

  return (
    <WorkflowBuilder
      automation={{
        id: automation.id,
        name: automation.name || "Untitled Automation",
        description: automation.description,
        status: automation.status || "draft",
        nodes: Array.isArray(automation.nodes) ? automation.nodes : [],
        edges: Array.isArray(automation.edges) ? automation.edges : [],
        settings: automation.settings || {
          timezone: "UTC",
          maxRunsPerHour: 100,
          failurePolicy: "continue",
        },
      }}
    />
  );
}
