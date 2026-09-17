import type { Metadata } from "next";
import { LegalShell, Section, Bullets, type LegalSectionItem } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Privacy Policy — Koraspace AI",
  description: "How Koraspace AI collects, uses, and protects your data.",
=======
  title: "Privacy Policy — KoraSpace",
  description: "How KoraSpace collects, uses, protects, and handles your personal data.",
>>>>>>> main
};

const SECTIONS: LegalSectionItem[] = [
  { id: "info-collect", title: "1. Information We Collect" },
  { id: "info-use", title: "2. How We Use Information" },
  { id: "ai-processing", title: "3. AI Processing & Safeguards" },
  { id: "legal-basis", title: "4. Legal Bases for Processing" },
  { id: "social-integrations", title: "5. Social-Media Integrations" },
  { id: "publishing", title: "6. Publishing on Your Behalf" },
  { id: "sharing", title: "7. Information Sharing & Transfers" },
  { id: "service-providers", title: "8. Subprocessors & Service Providers" },
  { id: "international", title: "9. International Data Transfers" },
  { id: "security", title: "10. Data Security & Storage" },
  { id: "access-tokens", title: "11. OAuth Token Management" },
  { id: "retention", title: "12. Data Retention Policy" },
  { id: "deletion", title: "13. Account Deletion & Purging" },
  { id: "rights", title: "14. Your Data Protection Rights" },
  { id: "children", title: "15. Children's Privacy" },
  { id: "marketing", title: "16. Marketing Communications" },
  { id: "cookies", title: "17. Cookies & Tracking" },
  { id: "third-party", title: "18. Third-Party Websites" },
  { id: "changes", title: "19. Changes to Privacy Policy" },
  { id: "complaints", title: "20. Regulatory Inquiries & Contact" },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
<<<<<<< HEAD
      updated="July 30, 2026"
      intro="Koraspace AI helps you manage your social media accounts. This policy explains, in plain language, what we collect, why, and the control you have. We only ever access what you explicitly connect, and we never sell your data."
      other={{ href: "/terms", label: "Terms of Service" }}
    >
      <Section title="Who we are">
        <p>Koraspace AI (“Koraspace”, “we”, “us”) provides an AI-powered workspace for scheduling, publishing, engaging, and analyzing social media across connected platforms. This policy covers our website, app, and services.</p>
=======
      updated="September 14, 2026"
      badge="Data Protection & Privacy"
      intro="KoraSpace (operated by Koraspace Technologies) is committed to protecting your privacy and handling personal data with absolute transparency, strict least-privilege scoping, and enterprise-grade security. This policy outlines our collection, processing, AI analysis, retention, and deletion practices in full compliance with the Nigeria Data Protection Act 2023 (NDPA) and global data protection standards."
      sections={SECTIONS}
      other={{ href: "/terms", label: "Terms of Service" }}
    >
      <Section id="info-collect" title="1. Information We Collect" takeaway="We collect only the minimum necessary information to provide AI social management, publishing, and analytics.">
        <p>Depending on how you use KoraSpace, we may collect and process the following categories of information:</p>
        
        <div className="mt-4 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[15px]">1.1 Account & Identity Information</h3>
            <p className="mt-1 text-slate-600 dark:text-white/70">When you register or maintain a KoraSpace account:</p>
            <Bullets items={[
              "Full name and display username;",
              "Email address and verified contact details;",
              "Encrypted password credentials (we never store plain-text passwords);",
              "Profile preferences and avatar image;",
              "Workspace, team, and organization metadata; and",
              "Subscription tier and billing history.",
            ]} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[15px]">1.2 Connected Social Platform Information</h3>
            <p className="mt-1 text-slate-600 dark:text-white/70">When you connect your social media accounts (e.g. X, Instagram, LinkedIn, TikTok, YouTube, Facebook, WhatsApp, Telegram):</p>
            <Bullets items={[
              "Platform user handles and unique account IDs;",
              "OAuth access tokens and refresh tokens (stored encrypted at rest);",
              "Authorized public metrics (impressions, reach, likes, comments, engagement rate);",
              "Authorized publishing permissions for scheduling content; and",
              "Public comments and incoming direct inquiries where you explicitly enable automated triage.",
            ]} />
            <p className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-300">Note: We enforce a strict least-privilege scoping model and never request access to private inbox messaging or administrative account management unless explicitly configured for customer support automation.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[15px]">1.3 User Content & Creative Material</h3>
            <Bullets items={[
              "Draft posts, scheduled posts, captions, hashtags, and threads;",
              "Uploaded images, video clips, documents, and media assets;",
              "Brand voice guidelines, persona parameters, and niche definitions; and",
              "Marketing campaign goals, audience demographics, and outbound templates.",
            ]} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[15px]">1.4 Technical & Usage Data</h3>
            <Bullets items={[
              "IP address and approximate geolocation (used for account security, rate limiting, and fraud prevention);",
              "Browser user agent, operating system, and screen resolution;",
              "Feature utilization logs, performance metrics, and error traces; and",
              "Session timestamps and security event audits.",
            ]} />
          </div>
        </div>
>>>>>>> main
      </Section>

      <Section id="info-use" title="2. How We Use Information" takeaway="Your data is used strictly to power social publishing, AI intelligence, and platform security. We never sell your personal data.">
        <p>KoraSpace uses your data to:</p>
        <Bullets items={[
          "Authenticate your identity and maintain workspace security;",
          "Publish and schedule social media content at your explicit direction;",
          "Compute engagement analytics, ROAS, and audience growth charts;",
          "Deliver AI-powered copy drafting, repurposing, and brand voice recommendations;",
          "Execute automated workflows and customer lead triaging as configured by you;",
          "Prevent fraud, prompt injection, unauthorized API access, and spam;",
          "Process subscription renewals and invoices; and",
          "Provide customer support and technical diagnostics.",
        ]} />
      </Section>

      <Section id="ai-processing" title="3. AI Processing & Safeguards" takeaway="We never use your private data or copyrighted brand content to train public foundational AI models.">
        <p>KoraSpace employs artificial intelligence to provide content generation, sentiment classification, and campaign optimization. When utilizing our AI features:</p>
        <Bullets items={[
          "Content prompts and brand context are processed transiently through enterprise API endpoints;",
          "Your proprietary data is never used to train public third-party foundational models;",
          "All outgoing prompts pass through automated Zero-Trust Prompt Injection and Safety filters; and",
          "AI recommendations are assistive tools; you retain final editorial discretion over all published assets.",
        ]} />
      </Section>

      <Section id="legal-basis" title="4. Legal Bases for Processing" takeaway="We process data in strict accordance with NDPA 2023 and global privacy frameworks.">
        <p>We process personal data based on the following recognized legal grounds:</p>
        <Bullets items={[
          "Contractual Necessity: To deliver the services requested when you create an account;",
          "Consent: Where you explicitly authorize a specific social media integration or feature;",
          "Legitimate Interests: To detect security threats, improve platform reliability, and prevent abuse; and",
          "Legal Obligations: To comply with applicable statutory, accounting, and tax reporting mandates.",
        ]} />
      </Section>

      <Section id="social-integrations" title="5. Social-Media Integrations" takeaway="You retain 100% ownership of your social channels. We access APIs only within your authorized bounds.">
        <p>KoraSpace interfaces with social platforms through their official developer APIs. When connecting channels:</p>
        <Bullets items={[
          "Authentication is handled strictly via official OAuth protocols (we never see or store your social platform passwords);",
          "You can revoke API permissions at any moment through KoraSpace or directly within the third-party platform settings; and",
          "Your use of connected platforms remains subject to each provider's independent Terms and Policies.",
        ]} />
      </Section>

      <Section id="publishing" title="6. Publishing on Your Behalf">
        <p>When you schedule or publish content through KoraSpace, we transmit the media and text payload directly to the chosen network on your behalf. You remain responsible for ensuring your posts comply with the destination platform's community standards and advertising guidelines.</p>
      </Section>

      <Section id="sharing" title="7. Information Sharing & Transfers" takeaway="We never sell personal data as a standalone product. Data is shared only with verified cloud infrastructure subprocessors.">
        <p>We do not sell, rent, or trade your personal data. We disclose data solely to:</p>
        <Bullets items={[
          "Trusted cloud infrastructure and database hosts (e.g. Supabase, Vercel, AWS);",
          "Payment gateways for secure PCI-compliant transaction processing;",
          "Enterprise AI model endpoints for real-time generative capabilities; and",
          "Regulatory or law enforcement agencies when strictly mandated by a valid court order or statutory requirement.",
        ]} />
      </Section>

      <Section id="service-providers" title="8. Subprocessors & Service Providers">
        <p>All third-party vendors handling data on our behalf are bound by strict Data Processing Agreements (DPAs) requiring equal or greater technical confidentiality, access controls, and encryption standards.</p>
      </Section>

<<<<<<< HEAD
      <Section title="Children">
        <p>Koraspace AI is not intended for anyone under 16. We do not knowingly collect data from children.</p>
=======
      <Section id="international" title="9. International Data Transfers">
        <p>Where personal data is transferred across international borders, KoraSpace ensures appropriate transfer mechanisms (such as standard contractual clauses and robust encryption) to uphold data protection standards equivalent to those required under the Nigeria Data Protection Act 2023.</p>
>>>>>>> main
      </Section>

      <Section id="security" title="10. Data Security & Storage" takeaway="Zero-Trust architecture with AES-256 at rest, TLS 1.3 in transit, and continuous threat monitoring.">
        <p>We maintain comprehensive technical and organizational safeguards:</p>
        <Bullets items={[
          "End-to-end encryption in transit (TLS 1.3) and AES-256 encryption at rest;",
          "Strict Row-Level Security (RLS) enforcing multi-tenant isolation across all databases;",
          "Automated rate limiting and SOC threat event auditing; and",
          "Role-based least-privilege administrative access with mandatory two-factor authentication.",
        ]} />
      </Section>

      <Section id="access-tokens" title="11. OAuth Token Management">
        <p>Social media access tokens are stored in secure vault storage and utilized solely for scheduled actions requested by the user. Expired or revoked tokens are immediately purged upon disconnection.</p>
      </Section>

      <Section id="retention" title="12. Data Retention Policy">
        <p>We retain your personal data for as long as your account remains active. If you deactivate or delete your account, associated operational data is purged from active databases within 30 days, except where retention is legally required for financial audits or fraud investigation.</p>
      </Section>

      <Section id="deletion" title="13. Account Deletion & Purging" takeaway="You can request complete deletion of your account and data at any time directly from Settings.">
        <p>You may permanently delete your KoraSpace account at any time via <strong>Settings &gt; Account &gt; Delete Account</strong> or by contacting <a href="mailto:privacy@koraspace.com" className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">privacy@koraspace.com</a>. Upon confirmation, all personal profiles, stored social tokens, media assets, and historical analytics are irrevocably erased.</p>
      </Section>

      <Section id="rights" title="14. Your Data Protection Rights" takeaway="Access, rectify, export, restrict, or erase your data at any time.">
        <p>Under the NDPA 2023 and applicable privacy regulations, you have the right to:</p>
        <Bullets items={[
          "Access and receive a copy of your personal data;",
          "Rectify inaccurate or outdated account information;",
          "Request complete erasure of your personal data;",
          "Object to or restrict specific automated processing;",
          "Export your content and analytics in standard machine-readable formats; and",
          "Withdraw previously granted consent at any time without penalty.",
        ]} />
      </Section>

      <Section id="children" title="15. Children's Privacy">
        <p>KoraSpace is strictly intended for professional creators, businesses, and individuals who have attained the legal age of majority in their jurisdiction. We do not knowingly collect personal information from individuals under 18 years of age.</p>
      </Section>

      <Section id="marketing" title="16. Marketing Communications">
        <p>You may opt out of non-essential product announcement emails at any time using the &quot;Unsubscribe&quot; link in our emails. Critical transactional emails (e.g. password resets, security alerts, billing receipts) will still be delivered.</p>
      </Section>

      <Section id="cookies" title="17. Cookies & Tracking">
        <p>We use essential cookies strictly required for authentication, security validation, and session integrity. We do not use third-party cross-site behavioral tracking cookies.</p>
      </Section>

      <Section id="third-party" title="18. Third-Party Websites">
        <p>KoraSpace may provide links to external partner tools. We are not responsible for the privacy practices of external platforms, and we encourage you to review their independent privacy statements.</p>
      </Section>

      <Section id="changes" title="19. Changes to Privacy Policy">
        <p>We may update this Privacy Policy periodically to reflect technological advances or legal updates. Material updates will be communicated via in-app broadcast or email prior to taking effect.</p>
      </Section>

      <Section id="complaints" title="20. Regulatory Inquiries & Contact">
        <p>For any privacy inquiries, data subject access requests, or regulatory questions, please contact our Data Protection Officer:</p>
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-[13.5px] text-slate-700 shadow-sm space-y-1 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-white/80">
          <p><strong className="text-slate-900 dark:text-white">Koraspace Technologies — Privacy &amp; Data Protection Office</strong></p>
          <p>Email: <a href="mailto:privacy@koraspace.com" className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">privacy@koraspace.com</a></p>
          <p>Support Desk: <a href="mailto:support@koraspace.com" className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">support@koraspace.com</a></p>
        </div>
      </Section>
    </LegalShell>
  );
}
