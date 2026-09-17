import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isPlan, type PlanId } from "@/lib/billing/plans";

/**
 * Sort object keys recursively for NOWPayments signature verification.
 */
function sortObject(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key: string) => {
      result[key] =
        obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])
          ? sortObject(obj[key])
          : obj[key];
      return result;
    }, {});
}

/**
 * NOWPayments IPN Webhook Handler
 * Reconciles crypto payments (USDT, BTC, ETH, SOL, BNB, etc.) for subscription plans.
 */
export async function POST(req: NextRequest) {
  try {
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    const rawBody = await req.text();
    const signature = req.headers.get("x-nowpayments-sig") || "";

    if (!ipnSecret) {
      console.warn("[NOWPayments Webhook] NOWPAYMENTS_IPN_SECRET is not configured.");
      return NextResponse.json({ ok: true });
    }

    if (!rawBody || !signature) {
      return NextResponse.json({ error: "Missing signature or payload" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const sortedPayload = sortObject(payload);
    const sortedJson = JSON.stringify(sortedPayload);

    // Verify HMAC-SHA512 signature
    const expectedSig = createHmac("sha512", ipnSecret)
      .update(sortedJson)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSig, "utf8");
    const receivedBuf = Buffer.from(signature, "utf8");

    if (
      expectedBuf.length !== receivedBuf.length ||
      !timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      console.error("[NOWPayments Webhook] Invalid HMAC signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const {
      payment_id,
      payment_status,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency,
      order_id,
    } = payload;

    // We process successful completions ("finished" or "confirmed")
    if (payment_status === "finished" || payment_status === "confirmed") {
      let userId: string | null = null;
      let plan: PlanId | null = null;

      // Extract userId and plan from order_id format: kora_${userId}_${plan}_${timestamp}
      if (order_id && typeof order_id === "string" && order_id.startsWith("kora_")) {
        const parts = order_id.split("_");
        if (parts.length >= 4) {
          const extractedUserId = parts[1];
          const extractedPlan = parts[2];

          if (isPlan(extractedPlan)) {
            plan = extractedPlan;
          }

          // Verify if user exists in database
          const profile = await prisma.profile.findFirst({
            where: {
              OR: [{ id: extractedUserId }, { id: { startsWith: extractedUserId } }],
            },
            select: { id: true },
          });

          if (profile) {
            userId = profile.id;
          }
        }
      }

      if (userId && plan) {
        // Activate subscription for 30 days
        const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await prisma.profile.update({
          where: { id: userId },
          data: {
            plan: plan,
            subscription_status: "active",
            plan_renews_at: renewsAt,
          },
        });

        // Record payment in database
        await prisma.payment.upsert({
          where: { reference: String(payment_id) },
          create: {
            user_id: userId,
            reference: String(payment_id),
            plan: plan,
            amount: Number(price_amount) || 0,
            currency: String(price_currency || "USD").toUpperCase(),
            provider: "nowpayments",
            status: "success",
            channel: String(pay_currency || "crypto"),
            paid_at: new Date(),
            raw: payload,
          },
          update: {
            status: "success",
            paid_at: new Date(),
            raw: payload,
          },
        });

        console.log(`[NOWPayments] Successfully processed crypto subscription for user ${userId} to plan ${plan}`);
      }
    }

    return NextResponse.json({ ok: true, status: payment_status });
  } catch (err: any) {
    console.error("[NOWPayments Webhook Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
