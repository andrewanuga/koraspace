import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { PLANS, isPlan, toKobo } from "@/lib/billing/plans";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { checkoutSchema } from "@/lib/security/schemas";

/** Start a Paystack checkout for a plan; returns an authorization_url to redirect to. */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const session = await auth();
    const user = session?.user;
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 10 checkout attempts/min per user (prevent abuse).
  const guardCheckout = await checkRequest(req, requestKey(req, user.id), 10);
  if (guardCheckout) return guardCheckout;

  const workspace = await getActiveWorkspace(supabase);
  if (!workspace || !user) return new Response("Unauthorized", { status: 401 });
  
  if (workspace.role === "member") {
    return NextResponse.json({ error: "Only admins or managers can change the plan." }, { status: 403 });
  }

  const workspaceId = workspace.workspaceId;

  const rawBody = await req.json().catch(() => ({}));
  const parsed = checkoutSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues.map((i) => `${i.path}: ${i.message}`) },
      { status: 400 }
    );
  }
  const { plan, method } = parsed.data;

  // Downgrade to Free needs no payment.
  if (plan === "free") {
    await supabase.from("profiles").update({ plan: "free", subscription_status: "cancelled" }).eq("id", workspaceId);
    return NextResponse.json({ free: true });
  }

  const cfg = PLANS[plan];
  
  if (method === "stripe" || method === "crypto" || method === "opay") {
    // For now, mock these gateways since API keys aren't present yet,
    // or just return a dummy authorization_url that goes straight to success.
    // In production, you would generate a real Stripe/Coinbase/Opay checkout session here.
    return NextResponse.json({ 
      authorization_url: `${req.nextUrl.origin}/dashboard/billing?paid=1&plan=${plan}`, 
      reference: `mock_${method}_${Date.now()}` 
    });
  }

  // Paystack flow
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Paystack isn't configured yet." }, { status: 501 });

  const planCode = cfg.planCodeEnv ? process.env[cfg.planCodeEnv] : undefined;
  const origin = req.nextUrl.origin;

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount: toKobo(cfg.price),
        currency: "NGN",
        // If a subscription plan code exists, Paystack uses it (and its amount).
        ...(planCode ? { plan: planCode } : {}),
        callback_url: `${origin}/api/billing/verify`,
        metadata: { user_id: workspaceId, plan },
      }),
    });
    const data = await res.json();
    if (!data.status) return NextResponse.json({ error: data.message || "Could not start checkout" }, { status: 502 });
    return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
  } catch {
    return NextResponse.json({ error: "Couldn't reach Paystack." }, { status: 502 });
  }
}

