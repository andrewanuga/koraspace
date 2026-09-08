import { createClient } from "@/lib/supabase/server";
import { IdeasClient } from "./IdeasClient";

export default async function IdeasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: trends }, { data: accounts }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("niche, persona")
        .eq("id", user.id)
        .single(),

      supabase
        .from("social_trends")
        .select("*")
        .eq("user_id", user.id)
        .order("score", { ascending: false }),

      supabase
        .from("social_accounts")
        .select("id, platform, handle, display_name")
        .eq("user_id", user.id),
    ]);

  return (
    <IdeasClient
      trends={trends ?? []}
      accounts={accounts ?? []}
      userNiche={profile?.niche ?? null}
      persona={profile?.persona ?? "creator"}
    />
  );
}
