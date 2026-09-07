import type { Metadata } from "next";
import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — KoraSpace",
  description: "How KoraSpace collects, uses, protects, and handles your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="September 7, 2026"
      intro="KoraSpace is operated by Koraspace Team. This Privacy Policy explains how we collect, use, disclose, store, protect, and delete personal information when you use KoraSpace, including our website, applications, APIs, social-media integrations, AI services, and related products. We are committed to processing personal data fairly, lawfully, transparently, and securely. This Privacy Policy is intended to support compliance with applicable privacy laws, including the Nigeria Data Protection Act 2023, and other applicable data-protection requirements."
      other={{ href: "/terms", label: "Terms of Service" }}
    >
      <Section title="1. Information We Collect">
        <p>Depending on how you use KoraSpace, we may collect the following categories of information.</p>
        
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-semibold text-white text-[15px]">1.1 Account Information</h3>
            <p className="mt-1">This may include:</p>
            <Bullets items={[
              "name;",
              "email address;",
              "phone number;",
              "password credentials in protected form;",
              "profile information;",
              "company or organization information;",
              "billing information;",
              "subscription information; and",
              "account preferences.",
            ]} />
          </div>

          <div>
            <h3 className="font-semibold text-white text-[15px]">1.2 Social-Media Account Information</h3>
            <p className="mt-1">When you connect a social-media platform, we may receive information authorized by that platform and by you.</p>
            <p className="mt-1">Depending on the integration, this may include:</p>
            <Bullets items={[
              "platform account identifier;",
              "username or handle;",
              "profile information;",
              "pages or accounts you authorize;",
              "posts;",
              "media;",
              "comments;",
              "messages where permitted;",
              "engagement information;",
              "analytics;",
              "audience information;",
              "publishing permissions;",
              "access tokens or authorization credentials;",
              "account status; and",
              "other information made available through the authorized API.",
            ]} />
            <p className="mt-2">We only request permissions reasonably necessary for the functionality you choose to use.</p>
          </div>

          <div>
            <h3 className="font-semibold text-white text-[15px]">1.3 Content</h3>
            <p className="mt-1">We may process:</p>
            <Bullets items={[
              "text;",
              "images;",
              "videos;",
              "audio;",
              "documents;",
              "captions;",
              "drafts;",
              "hashtags;",
              "brand information;",
              "campaign information;",
              "content calendars;",
              "comments;",
              "messages;",
              "advertising information; and",
              "other material you provide.",
            ]} />
          </div>

          <div>
            <h3 className="font-semibold text-white text-[15px]">1.4 Usage Information</h3>
            <p className="mt-1">We may collect technical information such as:</p>
            <Bullets items={[
              "IP address;",
              "browser type;",
              "operating system;",
              "device information;",
              "log data;",
              "timestamps;",
              "approximate location derived from technical information;",
              "pages visited;",
              "features used;",
              "error information; and",
              "interaction information.",
            ]} />
          </div>

          <div>
            <h3 className="font-semibold text-white text-[15px]">1.5 Cookies and Similar Technologies</h3>
            <p className="mt-1">We may use cookies and similar technologies to:</p>
            <Bullets items={[
              "authenticate users;",
              "maintain sessions;",
              "remember preferences;",
              "secure accounts;",
              "understand product usage;",
              "improve performance; and",
              "measure website activity.",
            ]} />
            <p className="mt-2">Where required, we provide users with appropriate cookie choices.</p>
          </div>
        </div>
      </Section>

      <Section title="2. How We Use Information">
        <p>We may use information to:</p>
        <Bullets items={[
          "create and maintain your account;",
          "provide KoraSpace functionality;",
          "connect your social-media accounts;",
          "publish content at your direction;",
          "schedule posts;",
          "provide analytics;",
          "generate AI-assisted content;",
          "personalize recommendations;",
          "detect trends;",
          "provide customer support;",
          "process payments;",
          "prevent fraud and abuse;",
          "secure our infrastructure;",
          "investigate security incidents;",
          "improve the Services;",
          "communicate with users;",
          "comply with legal obligations; and",
          "enforce our Terms.",
        ]} />
      </Section>

      <Section title="3. AI Processing">
        <p>KoraSpace may process information through artificial-intelligence systems to provide features such as:</p>
        <Bullets items={[
          "content generation;",
          "content recommendations;",
          "brand-voice assistance;",
          "trend analysis;",
          "post analysis;",
          "campaign recommendations;",
          "audience insights;",
          "content scoring;",
          "marketing recommendations; and",
          "automation.",
        ]} />
        <p>We aim to limit AI processing to information necessary to provide the relevant feature.</p>
        <p>We do not represent that AI-generated outputs are always accurate.</p>
      </Section>

      <Section title="4. Legal Bases for Processing">
        <p>Depending on the circumstances and applicable law, we may process personal data based on:</p>
        <Bullets items={[
          "performance of a contract;",
          "consent;",
          "compliance with legal obligations;",
          "legitimate interests;",
          "protection of rights and security;",
          "public interest where legally applicable; or",
          "another lawful basis permitted by applicable law.",
        ]} />
        <p>We do not rely on consent where another lawful basis is more appropriate or where applicable law permits another basis.</p>
      </Section>

      <Section title="5. Social-Media Integrations">
        <p>When you connect a social-media account, KoraSpace receives information from that platform based on:</p>
        <Bullets items={[
          "1. the permissions you authorize;",
          "2. the APIs and data made available by the platform; and",
          "3. the functionality you choose to use.",
        ]} />
        <p>We do not request social-media passwords where the relevant platform provides an authorized authentication mechanism.</p>
        <p>KoraSpace does not claim ownership of your social-media accounts or content.</p>
        <p>Your relationship with the third-party platform remains governed by that platform's own terms and policies.</p>
      </Section>

      <Section title="6. Publishing on Your Behalf">
        <p>If you authorize KoraSpace to publish content, KoraSpace may transmit the relevant content and associated instructions to the connected platform.</p>
        <p>You remain responsible for reviewing content and ensuring that your use complies with applicable platform rules.</p>
        <p>Where technically required, KoraSpace will seek appropriate authorization before performing actions on your behalf.</p>
      </Section>

      <Section title="7. Information Sharing">
        <p>We may share information with:</p>
        <Bullets items={[
          "infrastructure providers;",
          "cloud hosting providers;",
          "authentication providers;",
          "payment processors;",
          "AI service providers;",
          "analytics providers;",
          "customer-support providers;",
          "email and communication providers;",
          "security providers;",
          "professional advisers;",
          "regulators or law-enforcement authorities where legally required; and",
          "third-party platforms you explicitly connect to KoraSpace.",
        ]} />
        <p>We do not sell your personal information as a standalone data product.</p>
      </Section>

      <Section title="8. Service Providers">
        <p>Third-party providers may process information on our behalf. Examples may include:</p>
        <Bullets items={[
          "cloud hosting;",
          "databases;",
          "authentication;",
          "AI processing;",
          "payment processing;",
          "analytics;",
          "monitoring;",
          "email delivery;",
          "customer support;",
          "security services; and",
          "social-media APIs.",
        ]} />
        <p>We expect service providers handling personal information for KoraSpace to apply appropriate confidentiality and security protections.</p>
      </Section>

      <Section title="9. International Data Transfers">
        <p>Some service providers may process information outside Nigeria or outside your country of residence.</p>
        <p>Where applicable law requires safeguards for international transfers, we will implement appropriate measures.</p>
      </Section>

      <Section title="10. Data Security">
        <p>We use reasonable technical and organizational measures designed to protect information.</p>
        <p>Depending on the system and risk, these may include:</p>
        <Bullets items={[
          "encryption in transit;",
          "access controls;",
          "authentication;",
          "rate limiting;",
          "logging;",
          "monitoring;",
          "secure credential handling;",
          "vulnerability management;",
          "security testing;",
          "backup controls;",
          "incident response procedures; and",
          "least-privilege access.",
        ]} />
        <p>No internet-based service can guarantee absolute security.</p>
      </Section>

      <Section title="11. Access Tokens">
        <p>Where social platforms provide OAuth tokens or similar credentials, KoraSpace aims to store them using appropriate security controls and only use them for authorized functionality.</p>
        <p>Users should revoke authorization when they no longer wish KoraSpace to access a connected account.</p>
      </Section>

      <Section title="12. Data Retention">
        <p>We retain information only for as long as reasonably necessary for the purposes described in this Privacy Policy, unless a longer period is required or permitted by law.</p>
        <p>Retention periods may depend on:</p>
        <Bullets items={[
          "the type of information;",
          "the purpose of processing;",
          "your account status;",
          "contractual requirements;",
          "legal requirements;",
          "security requirements; and",
          "third-party platform requirements.",
        ]} />
      </Section>

      <Section title="13. Deletion">
        <p>You may request deletion of your KoraSpace account and personal information through the account controls or by contacting us.</p>
        <p>When deletion is completed, we will delete or anonymize information that we are not required or permitted to retain.</p>
        <p>Some information may remain where required for:</p>
        <Bullets items={[
          "legal compliance;",
          "fraud prevention;",
          "security;",
          "dispute resolution;",
          "accounting;",
          "tax requirements; or",
          "establishment, exercise, or defense of legal claims.",
        ]} />
        <p>Third-party platform data may also need to be deleted or disconnected through the relevant platform.</p>
      </Section>

      <Section title="14. Your Data Protection Rights">
        <p>Depending on applicable law, you may have rights relating to your personal data, including rights to:</p>
        <Bullets items={[
          "access your personal data;",
          "request correction;",
          "request deletion;",
          "object to certain processing;",
          "withdraw consent where processing is based on consent;",
          "request restriction of processing;",
          "request portability where applicable;",
          "lodge a complaint with the relevant supervisory authority; and",
          "exercise other rights provided by applicable law.",
        ]} />
        <p>Requests should be submitted using our privacy contact details.</p>
      </Section>

      <Section title="15. Children's Privacy">
        <p>KoraSpace is not intended for children who are below the minimum age required to use the Services under applicable law.</p>
        <p>We do not knowingly collect children's personal information where prohibited by law.</p>
        <p>If you believe a child has provided personal information improperly, contact us so we can investigate.</p>
      </Section>

      <Section title="16. Marketing Communications">
        <p>We may send transactional communications necessary to operate your account.</p>
        <p>Marketing communications will be handled in accordance with applicable law.</p>
        <p>Where required, you may opt out of marketing communications while continuing to receive important service-related messages.</p>
      </Section>

      <Section title="17. Cookies">
        <p>KoraSpace may use essential cookies required for authentication and security.</p>
        <p>Where non-essential cookies are used, we will provide appropriate notice and choices where required.</p>
        <p>A separate Cookie Policy may provide additional information.</p>
      </Section>

      <Section title="18. Third-Party Websites">
        <p>KoraSpace may contain links or integrations to third-party websites and platforms.</p>
        <p>We are not responsible for the privacy practices of third parties.</p>
        <p>You should review their privacy policies before providing information to them.</p>
      </Section>

      <Section title="19. Changes to This Privacy Policy">
        <p>We may update this Privacy Policy when our Services, technology, legal obligations, or processing practices change.</p>
        <p>The updated version will be published with a new &quot;Last Updated&quot; date.</p>
        <p>Where required, we will provide additional notice or obtain consent.</p>
      </Section>

      <Section title="20. Regulatory Complaints">
        <p>If you believe your privacy rights have been violated, you should first contact KoraSpace so that we can investigate and attempt to resolve the matter.</p>
        <p>You may also have the right to contact the relevant data-protection authority, including the Nigeria Data Protection Commission where applicable.</p>
      </Section>

      <div className="mt-8 border-t border-white/10 pt-6 text-[14.5px] font-medium text-white/80">
        <p>By using KoraSpace, you acknowledge that you have reviewed this Privacy Policy.</p>
      </div>
    </LegalShell>
  );
}

