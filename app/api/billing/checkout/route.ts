import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { PLANS, isPlan, toKobo } from "@/lib/billing/plans";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { checkoutSchema } from "@/lib/security/schemas";

/** Start a checkout for a plan; returns an authorization_url to redirect to. */
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
  const origin = req.nextUrl.origin;

  // --- 1. STRIPE (International) ---
  if (method === "stripe") {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: "Stripe isn't configured yet." }, { status: 501 });

    const stripeParams = new URLSearchParams();
    stripeParams.append("payment_method_types[0]", "card");
    stripeParams.append("line_items[0][price_data][currency]", "usd");
    stripeParams.append("line_items[0][price_data][product_data][name]", `${cfg.name} Plan`);
    stripeParams.append("line_items[0][price_data][unit_amount]", String(Math.round(cfg.priceUsd * 100)));
    stripeParams.append("line_items[0][quantity]", "1");
    stripeParams.append("mode", "payment");
    stripeParams.append("success_url", `${origin}/dashboard/billing?paid=1&plan=${plan}`);
    stripeParams.append("cancel_url", `${origin}/dashboard/billing?paid=0`);
    stripeParams.append("client_reference_id", workspaceId);
    stripeParams.append("metadata[user_id]", workspaceId);
    stripeParams.append("metadata[plan]", plan);

    try {
      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: stripeParams.toString()
      });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error.message }, { status: 502 });
      return NextResponse.json({ authorization_url: data.url, reference: data.id });
    } catch {
      return NextResponse.json({ error: "Couldn't reach Stripe." }, { status: 502 });
    }
  }

  // --- 2. OPAY (Nigeria) ---
  if (method === "opay") {
    const secret = process.env.OPAY_SECRET_KEY;
    const merchantId = process.env.OPAY_MERCHANT_ID;
    if (!secret || !merchantId) return NextResponse.json({ error: "OPay isn't configured yet." }, { status: 501 });

    const reference = `opay_${Date.now()}_${workspaceId.slice(0,8)}`;
    try {
      const res = await fetch("https://api.opaycheckout.com/api/v1/international/cashier/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secret}`,
          "MerchantId": merchantId,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reference,
          mchShortName: "Koraspace",
          productName: `${cfg.name} Plan`,
          productDesc: `Subscription to Koraspace ${cfg.name} Plan`,
          userPhone: "+2340000000000",
          userRequestIp: req.ip || "127.0.0.1",
          amount: { total: toKobo(cfg.price), currency: "NGN" },
          returnUrl: `${origin}/dashboard/billing?paid=1&plan=${plan}`,
          callbackUrl: `${origin}/api/billing/webhook/opay`,
          payTypes: ["BalancePayment", "BonusPayment", "OWealth", "BankCard"]
        })
      });
      const data = await res.json();
      if (data.code !== "00000") return NextResponse.json({ error: data.message }, { status: 502 });
      return NextResponse.json({ authorization_url: data.data.cashierUrl, reference });
    } catch {
      return NextResponse.json({ error: "Couldn't reach OPay." }, { status: 502 });
    }
  }

  // --- 3. CRYPTO (NOWPayments - BTC, ETH, SOL) ---
  if (method === "crypto") {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "NOWPayments crypto gateway isn't configured yet." }, { status: 501 });

    const orderId = `kora_${workspaceId.slice(0, 8)}_${plan}_${Date.now()}`;

    try {
      const res = await fetch("https://api.nowpayments.io/v1/invoice", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_amount: cfg.priceUsd,
          price_currency: "usd",
          order_id: orderId,
          order_description: `Koraspace ${cfg.name} Subscription (${workspaceId})`,
          ipn_callback_url: `${origin}/api/billing/webhook/nowpayments`,
          success_url: `${origin}/dashboard/billing?paid=1&plan=${plan}`,
          cancel_url: `${origin}/dashboard/billing?paid=0`,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.statusCode >= 400 || !data.invoice_url) {
        return NextResponse.json(
          { error: data.message || "Failed to create NOWPayments crypto invoice." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        authorization_url: data.invoice_url,
        reference: data.id || orderId,
      });
    } catch {
      return NextResponse.json({ error: "Couldn't reach NOWPayments gateway." }, { status: 502 });
    }
  }

  // --- 4. PAYSTACK (Nigeria) ---
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Paystack isn't configured yet." }, { status: 501 });

  const planCode = cfg.planCodeEnv ? process.env[cfg.planCodeEnv] : undefined;
  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount: toKobo(cfg.price),
        currency: "NGN",
        ...(planCode ? { plan: planCode } : {}),
        callback_url: `${origin}/api/billing/verify`,
        metadata: { user_id: workspaceId, plan, method: "paystack" },
      }),
    });
    const data = await res.json();
    if (!data.status) return NextResponse.json({ error: data.message || "Could not start checkout" }, { status: 502 });
    return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
  } catch {
    return NextResponse.json({ error: "Couldn't reach Paystack." }, { status: 502 });
  }
}


