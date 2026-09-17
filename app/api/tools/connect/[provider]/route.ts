import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { TOOLS, isToolConfigured, type ToolId } from "@/lib/social/tools";
import { validateOAuthScopes } from "@/lib/security/enforcement";
import { encryptToken } from "@/lib/security/tokenCrypto";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";

function back(origin: string, params: Record<string, string>) {
  const url = new URL("/dashboard/integrations", origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return NextResponse.redirect(url);
}

/** OAuth start for a tool (Google Calendar/Analytics/Sheets, Slack, Notion, Discord). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = req.nextUrl.origin;
  const t = TOOLS[provider as ToolId];
  if (!t || t.connectType !== "oauth" || !t.oauth) return back(origin, { error: "unsupported", tool: provider });
  const supabase = await createClient();
  const session = await auth();
    const user = session?.user;
  if (!user) return NextResponse.redirect(new URL("/login", origin));
  if (!isToolConfigured(provider as ToolId)) return back(origin, { error: "not_configured", tool: provider });

  // Enforce Zero-Trust Least-Privilege OAuth Scoping
  const { sanitizedScopes } = validateOAuthScopes(t.oauth.scopes);

  const state = randomBytes(16).toString("hex");
  (await cookies()).set(`sai_tool_${provider}`, state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });

  const url = new URL(t.oauth.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env[t.oauth.clientIdEnv]!);
  url.searchParams.set("redirect_uri", `${origin}/api/tools/callback/${provider}`);
  if (sanitizedScopes.length) url.searchParams.set("scope", sanitizedScopes.join(" "));
  url.searchParams.set("state", state);
  Object.entries(t.oauth.extra ?? {}).forEach(([k, v]) => url.searchParams.set(k, v));

  return NextResponse.redirect(url);
}

/** Key/webhook connect (Mailchimp, Zapier, Webhooks). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const t = TOOLS[provider as ToolId];
  if (!t || t.connectType === "oauth") return NextResponse.json({ error: "This tool uses OAuth." }, { status: 400 });
  const supabase = await createClient();
  const session = await auth();
    const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 20 attempts/min per user
  const guard = await checkRequest(req, requestKey(req, user.id), 20);
  if (guard) return guard;

  const { value } = await req.json();
  if (!value) return NextResponse.json({ error: `${t.keySetup?.label ?? "Value"} is required.` }, { status: 400 });

  // Store webhook URL as-is, encrypt sensitive API key via AES-256-GCM
  const safeConfig = t.connectType === "webhook"
    ? { url: String(value).trim() }
    : { api_key: encryptToken(String(value).trim()) };

  const { error } = await supabase.from("integrations").upsert(
    {
      user_id: user.id, provider, status: "connected",
      account_label: t.connectType === "webhook" ? "Webhook" : "API key",
      config: safeConfig,
    },
    { onConflict: "user_id,provider" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Disconnect. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const supabase = await createClient();
  const session = await auth();
    const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await supabase.from("integrations").delete().eq("user_id", user.id).eq("provider", provider);
  return NextResponse.json({ ok: true });
}
