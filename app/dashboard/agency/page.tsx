import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMarketerOverview } from "@/lib/marketer/overview";
import { AgencyClient } from "./AgencyClient";

export default async function AgencyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the user's plan and persona
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona")
    .eq("id", user.id)
    .single();

  // Access check: only advanced/team plans or marketer persona (or default gracefully)
  if (profile && (profile.plan !== "advanced" && profile.plan !== "team") && profile.persona !== "marketer") {
    // If they aren't authorized, redirect to main dashboard
    redirect("/dashboard");
  }

  // Fetch initial 30d overview aggregation directly on the server
  const initialOverview = await getMarketerOverview({
    userId: user.id,
    range: "30d",
  });

  return <AgencyClient initialOverview={initialOverview} />;
}
