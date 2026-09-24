import type { Metadata } from "next";
import { PageHero } from "@/components/landing/sections/PageHero";
import { Pricing } from "@/components/landing/sections/Pricing";
import { FAQ } from "@/components/landing/sections/FAQ";
import { FinalCTA } from "@/components/landing/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Pricing — KoraSpace",
  description:
    "Plans in naira, billed locally via Paystack, Flutterwave or any Nigerian debit card. Every paid plan includes a 14-day free trial.",
};

/**
 * The homepage sells the value; this page answers "which plan is right for
 * me?". The FAQ moves here with it — objection handling belongs next to the
 * price, not three sections above it.
 */
export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Priced for the market you actually sell in"
        sub="Pay in naira, not converted dollars. Every paid plan starts with a 14-day free trial, and you can move between plans as your business changes."
      />

      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  );
}
