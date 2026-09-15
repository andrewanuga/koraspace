import type { Metadata } from "next";
import { LegalShell, Section, Bullets, type LegalSectionItem } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — KoraSpace",
  description: "The Terms of Service governing access to and use of KoraSpace.",
};

const SECTIONS: LegalSectionItem[] = [
  { id: "eligibility", title: "1. Eligibility & Authority" },
  { id: "description", title: "2. Description of KoraSpace Services" },
  { id: "third-party", title: "3. Third-Party Social Platforms" },
  { id: "authorization", title: "4. Social Account Authorization" },
  { id: "ownership", title: "5. User Content & IP Ownership" },
  { id: "responsibility", title: "6. Responsibility for Published Content" },
  { id: "ai-terms", title: "7. AI Generation & Disclaimers" },
  { id: "prohibited", title: "8. Prohibited Conduct & Fair Use" },
  { id: "automation-policy", title: "9. Automation & Rate Limits" },
  { id: "security-responsibilities", title: "10. User Security Responsibilities" },
  { id: "subscriptions", title: "11. Subscriptions & Plan Tiers" },
  { id: "payments", title: "12. Payments & Invoicing" },
  { id: "cancellation", title: "13. Cancellation & Refunds" },
  { id: "sla", title: "14. Service Availability & SLA" },
  { id: "koraspace-ip", title: "15. Koraspace Intellectual Property" },
  { id: "feedback", title: "16. User Feedback" },
  { id: "privacy-link", title: "17. Privacy & Data Protection" },
  { id: "suspension", title: "18. Account Suspension & Termination" },
  { id: "disclaimer", title: "19. Warranty Disclaimers" },
  { id: "liability", title: "20. Limitation of Liability" },
  { id: "indemnity", title: "21. Indemnification" },
  { id: "modifications", title: "22. Changes to Terms & Services" },
  { id: "governing-law", title: "23. Governing Law & Dispute Resolution" },
  { id: "contact", title: "24. Contact & Legal Notices" },
];

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated="September 14, 2026"
      badge="Terms of Agreement"
      intro='These Terms of Service ("Terms", "Agreement") govern your access to and use of KoraSpace, including our web applications, mobile interfaces, APIs, AI creative suite, social management tools, analytics engines, workflow automations, and related services (collectively, the "Services"). KoraSpace is owned and operated by Koraspace Technologies ("KoraSpace", "we", "us", or "our"). By registering an account, connecting a social media profile, or accessing our platform, you agree to be bound by these Terms.'
      sections={SECTIONS}
      summaryPills={[
        { icon: "check", text: "You Own Your Content" },
        { icon: "shield", text: "Zero Hidden Fees" },
        { icon: "sparkles", text: "Ethical AI Standards" },
      ]}
      other={{ href: "/privacy", label: "Privacy Policy" }}
    >
      <Section id="eligibility" title="1. Eligibility & Authority" takeaway="You must be legally authorized and of legal age to enter into binding agreements.">
        <p>To use KoraSpace, you represent and warrant that:</p>
        <Bullets items={[
          "You are of legal age of majority in your jurisdiction and legally capable of entering into this binding contract;",
          "If using the Services on behalf of an agency, company, client, or organization, you possess full legal authority to bind that entity to these Terms; and",
          "Your use of KoraSpace does not violate any applicable local, national, or international laws or regulations.",
        ]} />
      </Section>

      <Section id="description" title="2. Description of KoraSpace Services" takeaway="KoraSpace provides AI-assisted social management, smart scheduling, automation workflows, and analytics.">
        <p>KoraSpace is an intelligent social media operating system and marketing workspace designed to empower creators, marketers, agencies, and businesses. Depending on your active subscription plan, the Services provide:</p>
        <Bullets items={[
          "Multi-platform content authoring, drafting, and AI-assisted copywriting;",
          "Cross-platform publishing and intelligent queue scheduling across connected networks;",
          "Content repurposing engines (transforming single ideas into carousels, threads, and clips);",
          "Automated lead triaging, intent scoring, and CRM pipeline tracking;",
          "Audience analytics, engagement velocity tracking, and weighted ROAS calculations; and",
          "Custom visual automation workflow builder with third-party provider adapters.",
        ]} />
      </Section>

      <Section id="third-party" title="3. Third-Party Social Platforms" takeaway="Third-party social platforms (X, Meta, TikTok, LinkedIn, etc.) operate under their own independent terms.">
        <p>KoraSpace interfaces with independent third-party platforms (including X/Twitter, Instagram, Facebook, LinkedIn, TikTok, YouTube, WhatsApp, and Telegram). You acknowledge that:</p>
        <Bullets items={[
          "These platforms are third-party entities not owned or controlled by KoraSpace;",
          "Your accounts on those networks remain governed by each platform's independent developer guidelines and community standards; and",
          "Third-party platforms may update, restrict, or modify their API capabilities at their sole discretion without prior notice.",
        ]} />
      </Section>

      <Section id="authorization" title="4. Social Account Authorization">
        <p>When you authorize KoraSpace to connect to a social network via OAuth, you grant us permission to perform only the specific publishing, analytics reading, and media uploading actions you configure. We never request or store your platform passwords.</p>
      </Section>

      <Section id="ownership" title="5. User Content & IP Ownership" takeaway="You retain 100% full intellectual property ownership of all content, media, and copy you create or upload.">
        <p>All text, images, video assets, brand logos, audio clips, and materials uploaded or created by you (&quot;User Content&quot;) remain your exclusive intellectual property. KoraSpace acquires zero ownership rights over your creative assets.</p>
        <p className="mt-2">You grant KoraSpace solely a worldwide, non-exclusive, royalty-free license to host, format, and transmit your User Content as strictly necessary to deliver the publishing, scheduling, and analytics services you request.</p>
      </Section>

      <Section id="responsibility" title="6. Responsibility for Published Content" takeaway="You are responsible for the legal compliance and accuracy of all posts published through your account.">
        <p>You retain sole editorial control and responsibility for all content scheduled or published through KoraSpace. You agree not to distribute content that infringes third-party copyrights, violates privacy laws, contains unlawful deceptive claims, or promotes hate speech or harassment.</p>
      </Section>

      <Section id="ai-terms" title="7. AI Generation & Disclaimers" takeaway="AI suggestions are assistive creative tools. Review and approve copy prior to publication.">
        <p>KoraSpace incorporates state-of-the-art generative language models to assist in drafting copy, predicting performance scores, and optimizing hashtags. Because AI models generate probabilistic suggestions:</p>
        <Bullets items={[
          "Outputs should be reviewed for accuracy, brand alignment, and factual correctness before publishing;",
          "KoraSpace does not guarantee that AI-generated copy will achieve specific viral reach, follower targets, or conversion figures; and",
          "You are responsible for reviewing AI-suggested content to ensure compliance with destination platform advertising rules.",
        ]} />
      </Section>

      <Section id="prohibited" title="8. Prohibited Conduct & Fair Use" takeaway="Abusive automation, spamming, prompt injection, and platform circumvention are strictly prohibited.">
        <p>You agree not to use KoraSpace to:</p>
        <Bullets items={[
          "Distribute unsolicited bulk spam, deceptive engagement, or phishing links;",
          "Attempt prompt injection attacks or bypass security guardrails;",
          "Scrape private personal data without explicit legal consent;",
          "Circumvent rate limits or tamper with API authentication headers; or",
          "Engage in unauthorized reverse-engineering of the platform infrastructure.",
        ]} />
      </Section>

      <Section id="automation-policy" title="9. Automation & Rate Limits">
        <p>All automated workflows (e.g. auto-replies, scheduled drips, triage bots) must comply with the rate limits and terms of the underlying provider network. KoraSpace enforces protective token-bucket rate limiters to prevent account degradation.</p>
      </Section>

      <Section id="security-responsibilities" title="10. User Security Responsibilities">
        <p>You are responsible for maintaining the confidentiality of your login credentials and enabling available two-factor authentication. You must immediately notify KoraSpace at <a href="mailto:security@koraspace.com" className="text-blue-400 hover:underline">security@koraspace.com</a> of any suspected unauthorized account activity.</p>
      </Section>

      <Section id="subscriptions" title="11. Subscriptions & Plan Tiers">
        <p>KoraSpace offers Free, Creator, Marketer, Advanced, and Team subscription tiers with distinct feature allowances, AI generation credits, and connected account limits. Subscriptions automatically renew at the end of each billing cycle unless cancelled prior to the renewal date.</p>
      </Section>

      <Section id="payments" title="12. Payments & Invoicing">
        <p>Payments are securely handled by certified third-party payment processors. All prices are listed transparently without hidden processing surcharges. Invoices are generated automatically and available in your billing settings.</p>
      </Section>

      <Section id="cancellation" title="13. Cancellation & Refunds" takeaway="Cancel anytime with one click in your billing dashboard. Access continues through the paid period.">
        <p>You can cancel your subscription at any time directly through <strong>Dashboard &gt; Billing &gt; Manage Subscription</strong>. Upon cancellation, your subscription will remain active until the conclusion of your current prepaid billing term. Refund inquiries are handled in accordance with our transparent Refund Policy.</p>
      </Section>

      <Section id="sla" title="14. Service Availability & SLA">
        <p>We strive to maintain 99.9% platform uptime across our cloud infrastructure. Scheduled maintenance windows are communicated in advance via in-app broadcasts. Third-party social API downtime is outside of KoraSpace&apos;s direct operational control.</p>
      </Section>

      <Section id="koraspace-ip" title="15. Koraspace Intellectual Property">
        <p>The KoraSpace platform, brand assets, proprietary algorithms, user interfaces, visual builder engines, and documentation are the exclusive intellectual property of Koraspace Technologies and protected under international copyright and trademark laws.</p>
      </Section>

      <Section id="feedback" title="16. User Feedback">
        <p>Any feature suggestions, feedback, or ideas you submit may be used by KoraSpace to improve the Services without confidentiality obligations or financial compensation to the submitter.</p>
      </Section>

      <Section id="privacy-link" title="17. Privacy & Data Protection">
        <p>Our complete collection, storage, and processing practices are detailed in our <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>, which is incorporated into and forms an integral part of these Terms.</p>
      </Section>

      <Section id="suspension" title="18. Account Suspension & Termination">
        <p>KoraSpace reserves the right to suspend or terminate accounts that engage in egregious terms violations, fraudulent billing, security evasion, or abusive platform conduct.</p>
      </Section>

      <Section id="disclaimer" title="19. Warranty Disclaimers">
        <p>KoraSpace is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by applicable law, we disclaim all warranties of any kind, whether express, implied, or statutory.</p>
      </Section>

      <Section id="liability" title="20. Limitation of Liability">
        <p>In no event shall KoraSpace or its officers, directors, or employees be liable for indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use the platform.</p>
      </Section>

      <Section id="indemnity" title="21. Indemnification">
        <p>You agree to defend and hold harmless KoraSpace against any third-party claims arising from your unlawful use of the platform, violation of these Terms, or your User Content.</p>
      </Section>

      <Section id="modifications" title="22. Changes to Terms & Services">
        <p>We reserve the right to modify these Terms. Continued use of KoraSpace after revised Terms are posted constitutes your acceptance of the updated terms.</p>
      </Section>

      <Section id="governing-law" title="23. Governing Law & Dispute Resolution">
        <p>These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under these Terms shall first be addressed through good-faith negotiation before submission to competent jurisdiction courts.</p>
      </Section>

      <Section id="contact" title="24. Contact & Legal Notices">
        <p>For questions regarding these Terms of Service or formal legal inquiries, please contact:</p>
        <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-[13.5px] text-white/80 space-y-1">
          <p><strong className="text-white">Koraspace Technologies — Legal Operations</strong></p>
          <p>Email: <a href="mailto:legal@koraspace.com" className="text-blue-400 hover:underline">legal@koraspace.com</a></p>
          <p>General Support: <a href="mailto:support@koraspace.com" className="text-blue-400 hover:underline">support@koraspace.com</a></p>
        </div>
      </Section>
    </LegalShell>
  );
}
