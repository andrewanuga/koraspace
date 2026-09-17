import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStrategyContext } from "@/lib/marketer/strategy";
import { StrategyClient } from "./StrategyClient";

export default async function StrategyPage() {
  const session = await auth();
    const user = session?.user;
  const supabase = await createClient();

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
