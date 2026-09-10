import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMarketerOverview } from "@/lib/marketer/overview";
import { AgencyClient } from "./AgencyClient";

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

  const initialOverview = await getMarketerOverview({
    userId: user.id,
    range: "30d",
  });

  return (
    <AgencyClient initialOverview={initialOverview} />
  );
}
