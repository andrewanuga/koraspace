import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { isPlan, PLANS } from "@/lib/billing/plans";

import { checkRequest, requestKey } from "@/lib/security/ratelimit";

/** Paystack callback: verify the transaction, then apply the plan + record the payment. */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const reference = req.nextUrl.searchParams.get("reference") || req.nextUrl.searchParams.get("trxref");
  const done = (params: Record<string, string>) => {
    const url = new URL("/dashboard/billing", origin);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return NextResponse.redirect(url);
  };

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!reference || !secret) return done({ paid: "0" });
  const supabase = await createClient();
  const session = await auth();
    const user = session?.user;
  if (!user) return NextResponse.redirect(new URL("/login", origin));

  // Rate limit payment verification attempts (10 req/min per user)
  const guard = await checkRequest(req, requestKey(req, user.id), 10);
  if (guard) return done({ paid: "0", error: "rate_limited" });

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const { data } = await res.json();
    if (!data || data.status !== "success") return done({ paid: "0" });

    // Zero-Trust Payment Identity Binding:
    // Ensure that the verified Paystack transaction belongs to the authenticated user.
    const payerEmail = data.customer?.email?.toLowerCase()?.trim();
    const payerUserId = data.metadata?.user_id;
    const emailMatches = Boolean(payerEmail && user.email && payerEmail === user.email.toLowerCase().trim());
    const userIdMatches = Boolean(payerUserId && payerUserId === user.id);

    if (!emailMatches && !userIdMatches) {
      console.warn(`[Security] Payment identity mismatch: user ${user.id} (${user.email}) claimed tx for ${payerEmail} / ${payerUserId}`);
      return done({ paid: "0", error: "identity_mismatch" });
    }

    const plan = (isPlan(data.metadata?.plan) ? data.metadata.plan : "pro") as keyof typeof PLANS;
    
    // Security: Verify amount matches the minimum expected for the plan
    // Paystack amounts are returned in kobo.
    const expectedAmountKobo = Math.round(data.amount); 
    const minRequiredKobo = (PLANS[plan].price * 100);
    if (expectedAmountKobo < minRequiredKobo) {
      console.warn(`[Security] Payment amount mismatch: user ${user.id} paid ${expectedAmountKobo} but ${minRequiredKobo} was required.`);
      return done({ paid: "0", error: "invalid_amount" });
    }
    // Update the subscription on the profile.
    await supabase.from("profiles").update({
      plan,
      paystack_customer_code: data.customer?.customer_code ?? null,
      subscription_status: "active",
      plan_renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    // Record the payment (service role so it isn't blocked by RLS).
    await (admin ?? supabase).from("payments").upsert({
      user_id: user.id,
      reference: data.reference,
      plan,
      amount: (data.amount ?? 0) / 100,
      currency: data.currency ?? "NGN",
      status: "success",
      channel: data.channel ?? null,
      paid_at: data.paid_at ?? new Date().toISOString(),
      raw: data,
    }, { onConflict: "reference" });

    return done({ paid: "1", plan });
  } catch {
    return done({ paid: "0" });
  }
}
