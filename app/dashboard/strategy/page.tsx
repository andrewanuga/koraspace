import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStrategyContext } from "@/lib/marketer/strategy";
import { StrategyClient } from "./StrategyClient";

export default async function StrategyPage() {
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

  // Allow access for marketers or advanced/team tiers (graceful fallback)
  if (
    profile &&
    profile.persona !== "marketer" &&
    profile.plan !== "advanced" &&
    profile.plan !== "team"
  ) {
    redirect("/dashboard");
  }

  const context = await getStrategyContext(user.id);

  return <StrategyClient initialContext={context} />;
}
