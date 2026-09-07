import type { Metadata } from "next";
import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — KoraSpace",
  description: "The Terms of Service governing access to and use of KoraSpace.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated="September 7, 2026"
      intro='These Terms of Service ("Terms", "Agreement") govern your access to and use of KoraSpace, including our website, web application, mobile applications, APIs, AI services, social-media management tools, analytics, automation features, content creation tools, integrations, and related services (collectively, the "Services"). KoraSpace is owned and operated by Techla ("Techla", "KoraSpace", "we", "us", or "our"). By creating an account, connecting a social-media account, purchasing a subscription, accessing our Services, or otherwise using KoraSpace, you agree to these Terms. If you do not agree to these Terms, you must not use KoraSpace.'
      other={{ href: "/privacy", label: "Privacy Policy" }}
    >
      <Section title="1. Eligibility">
        <p>You must be legally capable of entering into a binding agreement in your jurisdiction to use KoraSpace.</p>
        <p>If you use KoraSpace on behalf of a company, organization, agency, client, or other legal entity, you represent that you have authority to bind that entity to these Terms.</p>
        <p>You are responsible for ensuring that your use of KoraSpace complies with the laws applicable to you.</p>
      </Section>

      <Section title="2. Description of KoraSpace">
        <p>KoraSpace is an AI-powered social-media management and marketing platform designed to help users create, plan, publish, monitor, analyze, and optimize social-media content and marketing activities.</p>
        <p>Depending on your subscription and available integrations, KoraSpace may provide:</p>
        <Bullets items={[
          "AI-assisted content creation;",
          "post drafting and editing;",
          "content scheduling;",
          "social-media publishing;",
          "content calendars;",
          "analytics and reporting;",
          "trend discovery;",
          "brand-voice management;",
          "content recommendations;",
          "social listening;",
          "audience and engagement insights;",
          "competitor analysis;",
          "advertising and campaign tools;",
          "A/B testing;",
          "customer messaging and inbox management;",
          "AI-powered automation;",
          "collaboration tools;",
          "link-in-bio and commerce features;",
          "API and developer functionality;",
          "AI-assisted image, video, text, and other content generation; and",
          "integrations with third-party social-media platforms and services.",
        ]} />
        <p>Features may vary by plan, country, platform, API availability, technical limitations, and third-party requirements.</p>
      </Section>

      <Section title="3. Third-Party Social Platforms">
        <p>KoraSpace may connect to third-party platforms including, where supported:</p>
        <Bullets items={[
          "Facebook;",
          "Instagram;",
          "TikTok;",
          "LinkedIn;",
          "YouTube;",
          "X;",
          "and other supported platforms.",
        ]} />
        <p>These platforms are independent third parties and are not owned or controlled by KoraSpace.</p>
        <p>Your use of each connected platform remains subject to that platform's own terms, privacy policy, developer policies, community standards, advertising policies, and other applicable rules.</p>
        <p>KoraSpace does not guarantee that any third-party platform will continue to provide API access or support a particular feature.</p>
        <p>Third-party platforms may change, restrict, suspend, or discontinue APIs, permissions, publishing capabilities, data access, or other functionality without notice.</p>
      </Section>

      <Section title="4. Social Account Authorization">
        <p>When you connect a social-media account to KoraSpace, you authorize KoraSpace to access only the information and functionality permitted through the permissions and authorization granted by you and the applicable platform.</p>
        <p>KoraSpace does not request your social-media password where the applicable platform provides an authorized OAuth or equivalent authorization mechanism.</p>
        <p>You remain responsible for maintaining the security of your third-party accounts.</p>
        <p>You may disconnect an account through KoraSpace where available or revoke KoraSpace's authorization through the relevant third-party platform.</p>
      </Section>

      <Section title="5. User Content">
        <p>&quot;You&quot; or &quot;User Content&quot; means content, materials, information, media, text, images, videos, audio, trademarks, logos, documents, social posts, comments, messages, campaign materials, and other information that you upload, submit, connect, transmit, generate, or otherwise make available through KoraSpace.</p>
        <p>You retain ownership of your User Content, subject to the rights necessary for KoraSpace to provide the Services.</p>
        <p>You grant KoraSpace a limited, non-exclusive, worldwide, royalty-free license to host, reproduce, process, transmit, transform, display, and otherwise use your User Content solely as reasonably necessary to:</p>
        <Bullets items={[
          "provide the Services;",
          "operate your account;",
          "publish content at your direction;",
          "generate analytics;",
          "provide AI-assisted functionality;",
          "maintain and secure the platform;",
          "prevent abuse and fraud;",
          "troubleshoot technical problems; and",
          "comply with applicable law.",
        ]} />
        <p>KoraSpace does not acquire ownership of your User Content merely because you use the Services.</p>
      </Section>

      <Section title="6. Responsibility for Published Content">
        <p>You are solely responsible for content you instruct KoraSpace to create, modify, schedule, publish, distribute, or otherwise transmit.</p>
        <p>You are responsible for ensuring that your content:</p>
        <Bullets items={[
          "is accurate where accuracy is required;",
          "does not infringe third-party rights;",
          "does not violate applicable law;",
          "complies with the rules of the destination platform;",
          "complies with advertising requirements where applicable;",
          "does not contain unlawful or deceptive claims;",
          "does not violate privacy rights;",
          "does not constitute spam or abusive conduct; and",
          "does not contain malicious software or harmful code.",
        ]} />
        <p>KoraSpace is an automation and management tool. It does not guarantee that content generated or suggested by its AI will be accurate, original, legally compliant, or suitable for a particular purpose.</p>
        <p>You must review AI-generated content before publishing where appropriate.</p>
      </Section>

      <Section title="7. AI Services">
        <p>KoraSpace uses artificial-intelligence technologies to provide certain features.</p>
        <p>AI-generated results may contain:</p>
        <Bullets items={[
          "factual errors;",
          "incomplete information;",
          "inappropriate suggestions;",
          "inaccurate claims;",
          "biased or unsuitable recommendations; or",
          "content that resembles existing material.",
        ]} />
        <p>AI outputs should not automatically be treated as authoritative.</p>
        <p>You remain responsible for reviewing content before publication and for determining whether an AI-generated output is appropriate for your intended use.</p>
        <p>KoraSpace does not guarantee that AI-generated content will produce a particular engagement rate, audience growth, conversion rate, revenue level, ranking, or other business result.</p>
      </Section>

      <Section title="8. Prohibited Use">
        <p>You must not use KoraSpace to:</p>
        <Bullets items={[
          "violate applicable law;",
          "violate a third-party platform's terms or developer policies;",
          "bypass platform restrictions;",
          "circumvent API limitations;",
          "scrape data where scraping is prohibited;",
          "collect personal data without a lawful basis;",
          "impersonate another person or organization;",
          "distribute malware;",
          "conduct phishing or fraud;",
          "facilitate spam;",
          "create deceptive engagement;",
          "artificially manipulate metrics;",
          "operate fake accounts for deceptive purposes;",
          "harass, threaten, or abuse individuals;",
          "distribute illegal or harmful content;",
          "infringe intellectual-property rights;",
          "upload content you do not have the right to use;",
          "attempt to gain unauthorized access to systems;",
          "interfere with KoraSpace's infrastructure;",
          "reverse engineer the Services except where legally permitted;",
          "circumvent security controls;",
          "use automated systems to abuse KoraSpace or connected platforms; or",
          "use KoraSpace to evade enforcement mechanisms of a third-party platform.",
        ]} />
        <p>KoraSpace may suspend or terminate accounts involved in prohibited activity.</p>
      </Section>

      <Section title="9. Automation">
        <p>KoraSpace may provide automated publishing, messaging, analytics, monitoring, and other functions.</p>
        <p>Automation does not override the rules of connected platforms.</p>
        <p>KoraSpace will not intentionally design or operate functionality for the purpose of circumventing platform enforcement, rate limits, anti-spam systems, authentication requirements, or other security mechanisms.</p>
        <p>Users must use automation responsibly and in compliance with the applicable platform's rules.</p>
      </Section>

      <Section title="10. Account Security">
        <p>You are responsible for:</p>
        <Bullets items={[
          "maintaining the confidentiality of your KoraSpace credentials;",
          "using strong authentication credentials;",
          "enabling available security controls;",
          "reviewing connected accounts;",
          "promptly reporting unauthorized access; and",
          "maintaining the security of devices used to access KoraSpace.",
        ]} />
        <p>You must notify us promptly if you believe your account has been compromised.</p>
      </Section>

      <Section title="11. Subscription Plans">
        <p>KoraSpace may offer free and paid subscription plans.</p>
        <p>Available plans, limits, pricing, features, usage allowances, and billing intervals may change.</p>
        <p>Current pricing displayed at the time of purchase forms part of your subscription agreement.</p>
        <p>Unless otherwise stated, paid subscriptions automatically renew at the applicable billing interval until cancelled.</p>
      </Section>

      <Section title="12. Payments">
        <p>Payments may be processed by third-party payment processors.</p>
        <p>KoraSpace does not necessarily store complete payment-card information.</p>
        <p>You authorize the applicable payment provider to charge the payment method associated with your subscription.</p>
        <p>You are responsible for keeping billing information accurate and current.</p>
      </Section>

      <Section title="13. Cancellation">
        <p>You may cancel a subscription in accordance with the cancellation mechanism provided within KoraSpace or through the applicable payment provider.</p>
        <p>Cancellation normally prevents future renewal but does not automatically reverse charges already incurred.</p>
        <p>Any refund will be governed by our Refund and Cancellation Policy.</p>
      </Section>

      <Section title="14. Service Availability">
        <p>We aim to provide reliable Services but do not guarantee uninterrupted availability.</p>
        <p>KoraSpace may experience:</p>
        <Bullets items={[
          "maintenance;",
          "outages;",
          "API failures;",
          "platform restrictions;",
          "infrastructure failures;",
          "security incidents;",
          "network interruptions;",
          "third-party service failures; or",
          "other circumstances outside our reasonable control.",
        ]} />
        <p>Third-party API availability is outside KoraSpace's control.</p>
      </Section>

      <Section title="15. Intellectual Property">
        <p>KoraSpace, including its software, interfaces, designs, trademarks, branding, databases, systems, documentation, proprietary workflows, algorithms, architecture, and other platform materials, is owned by or licensed to Techla and is protected by applicable intellectual-property laws.</p>
        <p>Except as expressly permitted by these Terms, you may not copy, modify, distribute, sell, sublicense, reverse engineer, reproduce, or commercially exploit KoraSpace.</p>
        <p>&quot;KoraSpace&quot; and related logos and branding are proprietary marks of Techla unless otherwise stated.</p>
      </Section>

      <Section title="16. Feedback">
        <p>If you provide suggestions, recommendations, feature requests, or other feedback regarding KoraSpace, you grant us the right to use that feedback without compensation or attribution, provided that such use does not disclose your confidential information.</p>
      </Section>

      <Section title="17. Privacy">
        <p>Our processing of personal information is described in the KoraSpace Privacy Policy.</p>
        <p>The Privacy Policy forms part of these Terms.</p>
      </Section>

      <Section title="18. Data Protection">
        <p>KoraSpace will implement reasonable technical and organizational measures designed to protect personal data and platform data against unauthorized access, disclosure, alteration, loss, or destruction.</p>
        <p>Where applicable, KoraSpace processes personal data in accordance with the Nigeria Data Protection Act 2023 and other applicable privacy laws.</p>
        <p>Users remain responsible for ensuring that information they upload or process through KoraSpace is collected and used lawfully.</p>
      </Section>

      <Section title="19. Data Deletion">
        <p>You may request deletion of your KoraSpace account and associated personal data through the mechanisms described in our Data Deletion Policy.</p>
        <p>Certain information may be retained where required by law, necessary to establish or defend legal claims, required for security, fraud prevention, accounting, or other lawful purposes.</p>
        <p>Third-party platform data may also be subject to the retention and deletion requirements of the relevant platform.</p>
      </Section>

      <Section title="20. Suspension and Termination">
        <p>We may suspend or terminate access where reasonably necessary to:</p>
        <Bullets items={[
          "enforce these Terms;",
          "prevent abuse;",
          "protect users;",
          "protect KoraSpace;",
          "comply with law;",
          "respond to security incidents;",
          "respond to third-party platform requirements; or",
          "address fraudulent, harmful, or prohibited activity.",
        ]} />
        <p>Where reasonably practicable, we will provide notice and an opportunity to resolve the issue.</p>
      </Section>

      <Section title="21. Disclaimer">
        <p>KoraSpace is provided on an &quot;as available&quot; and &quot;as is&quot; basis to the extent permitted by law.</p>
        <p>We do not guarantee:</p>
        <Bullets items={[
          "specific audience growth;",
          "engagement;",
          "followers;",
          "sales;",
          "advertising performance;",
          "search rankings;",
          "revenue;",
          "viral performance;",
          "uninterrupted access to third-party platforms;",
          "continued availability of specific APIs; or",
          "that AI-generated content will be error-free.",
        ]} />
      </Section>

      <Section title="22. Limitation of Liability">
        <p>To the maximum extent permitted by applicable law, KoraSpace and Techla will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from your use of the Services.</p>
        <p>Nothing in these Terms excludes liability that cannot lawfully be excluded.</p>
      </Section>

      <Section title="23. Indemnification">
        <p>To the extent permitted by applicable law, you agree to defend, indemnify, and hold harmless Techla and KoraSpace from claims, damages, liabilities, losses, and expenses arising from:</p>
        <Bullets items={[
          "your unlawful use of KoraSpace;",
          "your User Content;",
          "your violation of these Terms;",
          "your violation of third-party platform policies;",
          "your infringement of third-party rights; or",
          "your misuse of connected social accounts.",
        ]} />
      </Section>

      <Section title="24. Changes to the Services">
        <p>We may modify, add, remove, suspend, or discontinue features.</p>
        <p>Where changes materially affect your rights, we may provide reasonable notice where required.</p>
      </Section>

      <Section title="25. Changes to These Terms">
        <p>We may update these Terms from time to time.</p>
        <p>The updated version will be published on our website with a revised &quot;Last Updated&quot; date.</p>
        <p>Where legally required, we will provide additional notice.</p>
      </Section>

      <Section title="26. Governing Law">
        <p>These Terms are governed by the laws of the Federal Republic of Nigeria, except to the extent mandatory law requires otherwise.</p>
      </Section>

      <Section title="27. Dispute Resolution">
        <p>The parties will first attempt to resolve disputes through good-faith discussions.</p>
        <p>If a dispute cannot be resolved informally, it may be referred to the appropriate courts or alternative dispute-resolution mechanism permitted under applicable Nigerian law.</p>
      </Section>

      <Section title="28. Severability">
        <p>If any provision of these Terms is determined to be invalid or unenforceable, the remaining provisions will remain in effect.</p>
      </Section>

      <Section title="29. Entire Agreement">
        <p>These Terms, together with our Privacy Policy and other policies expressly incorporated into them, constitute the agreement between you and KoraSpace concerning the Services.</p>
      </Section>

      <div className="mt-8 border-t border-white/10 pt-6 text-[14.5px] font-medium text-white/80">
        <p>By using KoraSpace, you acknowledge that you have read and agree to these Terms of Service.</p>
      </div>
    </LegalShell>
  );
}

