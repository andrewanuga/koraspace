"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Bot,
  Sparkles,
  Webhook,
  Loader2,
  Play,
  ShieldAlert,
} from "lucide-react";
import { GlassCard, PageHeader, Pill, StatTile } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { impersonateUser, grantUserCredits } from "../actions";

export default function UserDetail() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const { success, error: toastError } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(false);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const supabase = createClient();
        const [prof, bots, ints, posts, securityEvents] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", id).single(),
          supabase.from("social_bots").select("*").eq("user_id", id),
          supabase.from("social_accounts").select("*").eq("user_id", id),
          supabase.from("social_posts").select("id, content, platform, posted_at, impressions").eq("user_id", id).limit(10),
          supabase.from("security_events").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
        ]);

        if (prof.error) throw prof.error;

        setData({
          profile: prof.data,
          bots: bots.data || [],
          integrations: ints.data || [],
          posts: posts.data || [],
          securityEvents: securityEvents.data || [],
        });
      } catch (e) {
        toastError("Couldn't load user details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      await impersonateUser(id);
      success("Impersonation started");
      window.location.href = "/dashboard";
    } catch (e) {
      toastError("Failed to impersonate");
      setImpersonating(false);
    }
  };

  const handleGrant = async (amount: number) => {
    setGranting(true);
    try {
      await grantUserCredits(id, amount);
      success("Granted +" + amount + " credits");
      setData((prev: any) => ({
        ...prev,
        profile: {
          ...prev.profile,
          generations_used: Math.max(0, (prev.profile.generations_used || 0) - amount),
        },
      }));
    } catch (e) {
      toastError("Failed to grant credits");
    } finally {
      setGranting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="py-12 text-center text-white/50">
        Account not found or inaccessible.
      </div>
    );
  }

  const { profile, bots, integrations, securityEvents } = data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-base font-bold text-white shadow-xl">
              {(profile.full_name || profile.username || "U").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                  {profile.full_name || "Untitled Account"}
                </h1>
                {profile.is_admin && <Pill tone="red">Admin</Pill>}
                {profile.suspended ? (
                  <Pill tone="red">Suspended</Pill>
                ) : (
                  <Pill tone="green">Active</Pill>
                )}
              </div>
              <p className="font-data text-xs text-white/40">{profile.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleGrant(100)}
              disabled={granting}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>+100 Credits</span>
            </button>

            <button
              onClick={handleImpersonate}
              disabled={impersonating || profile.is_admin}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 disabled:opacity-50"
            >
              {impersonating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-white" />
              )}
              <span>Impersonate User</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Active Plan"
          value={String(profile.plan || "free").toUpperCase()}
          icon={User}
          tone="violet"
        />
        <StatTile
          label="Generations Count"
          value={String(profile.generations_used || 0)}
          icon={Sparkles}
          tone="indigo"
        />
        <StatTile
          label="Social Accounts"
          value={String(integrations.length)}
          icon={Webhook}
          tone="gold"
        />
        <StatTile
          label="Configured Bots"
          value={String(bots.length)}
          icon={Bot}
          tone="green"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="mb-4 font-display text-[15px] font-semibold text-white flex items-center gap-2">
            <User className="h-4 w-4 text-blue-400" />
            Account Information
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-white/40">Username Handle</span>
              <span className="font-data font-semibold text-white">
                {profile.username ? "@" + profile.username : "—"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-white/40">Registered Persona</span>
              <span className="font-semibold text-white capitalize">
                {profile.persona || "—"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-white/40">Subscription Status</span>
              <span className="text-white font-medium capitalize">
                {profile.subscription_status || "Active (Default)"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-white/40">Onboarding State</span>
              <span className="text-white font-medium">
                {profile.onboarded ? "Completed" : "Pending"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-white/40">Registration Timestamp</span>
              <span className="text-white/70 font-data">
                {new Date(profile.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="mb-4 font-display text-[15px] font-semibold text-white flex items-center gap-2">
            <Webhook className="h-4 w-4 text-emerald-400" />
            Connected Social Accounts
          </h2>

          {integrations.length === 0 ? (
            <p className="text-xs text-white/40 py-4 text-center">No social accounts connected.</p>
          ) : (
            <div className="space-y-2">
              {integrations.map((i: any) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-white capitalize">{i.platform}</p>
                    <p className="text-[11px] text-white/40 font-data">{i.handle || i.display_name || "Connected"}</p>
                  </div>
                  <Pill tone={i.status === "connected" ? "green" : "red"}>{i.status}</Pill>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="mb-4 font-display text-[15px] font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-400" />
          Zero-Trust Security Events & Audit Logs
        </h2>

        {securityEvents.length === 0 ? (
          <p className="text-xs text-white/40 py-4 text-center">No security incidents recorded for this user.</p>
        ) : (
          <div className="space-y-2">
            {securityEvents.map((e: any) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={"h-2 w-2 rounded-full " + (e.severity === "critical" ? "bg-rose-500" : "bg-blue-400")}
                  />
                  <Pill tone={e.severity === "critical" ? "red" : "indigo"}>{e.type}</Pill>
                  <span className="text-white/80">{e.detail || "No details"}</span>
                </div>
                <span className="text-[11px] text-white/40 font-data">
                  {new Date(e.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
