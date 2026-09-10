import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AutomationsClient } from "./AutomationsClient";

export default async function AutomationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const { data: automations } = await (supabase as any)
    .from("marketing_automations")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", {
      ascending: false,
    });

  return (
    <AutomationsClient
      initialAutomations={automations ?? []}
      userName={profile?.full_name ?? "Marketer"}
    />
  );
}
