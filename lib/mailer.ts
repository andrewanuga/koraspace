import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

/**
 * SMTP transporter built from env vars. Returns null when not configured,
 * so callers can degrade gracefully (e.g. still store the ticket).
 *
 * Gmail example:
 *   SMTP_HOST=smtp.gmail.com  SMTP_PORT=465  SMTP_SECURE=true
 *   SMTP_USER=socially.ai.io@gmail.com  SMTP_PASS=<16-char app password>
 */
export function getTransporter(): Transporter | null {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  cached = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return cached;
}

export const MAIL_FROM =
  process.env.SMTP_FROM ||
  (process.env.SMTP_USER ? `"Koraspace" <${process.env.SMTP_USER}>` : '"Koraspace" <support@koraspace.site>');

export async function sendWelcomeVerificationEmail(email: string, name: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://koraspace.site";
  const loginUrl = `${appUrl}/login`;
  const subject = "Welcome to Koraspace — Your Workspace is Ready";

  const text = `Welcome aboard, ${name || "Creator"}!\n\nYour Koraspace workspace has been successfully created. You're now equipped with multi-platform publishing, autonomous AI bot engines, and brand memory across 11 social networks.\n\nSign in to your workspace:\n${loginUrl}\n\nNeed help? Contact us at support@koraspace.site`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #1f2937; border-radius: 16px; background-color: #111827; color: #f3f4f6;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">Kora<span style="color: #ff0a8a;">Space</span></h1>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 4px;">Your AI Social Media Operating System</p>
      </div>
      
      <div style="background-color: #1f2937; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0;">Welcome aboard, ${name || "Creator"}! 🎉</h2>
        <p style="color: #d1d5db; line-height: 1.6; font-size: 14px; margin: 0 0 16px 0;">
          Your Koraspace workspace has been successfully created. You're now equipped with multi-platform publishing, autonomous AI bot engines, and brand memory across 11 social networks.
        </p>
        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="${loginUrl}" style="background-color: #ff0a8a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block;">
            Sign In & Launch Workspace →
          </a>
        </div>
      </div>

      <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
        Need help? Reply directly to this email or reach us at <a href="mailto:support@koraspace.site" style="color: #ff0a8a; text-decoration: none;">support@koraspace.site</a>.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject,
      text,
      html,
      headers: {
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "Auto-Submitted": "auto-generated",
      },
    });
  } catch (err) {
    console.error("[Mailer] Failed to send welcome verification email:", err);
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  const subject = "Reset your Koraspace password";
  const text = `Password Reset Request\n\nWe received a request to reset your password for your Koraspace account. Click the link below to choose a new password:\n\n${resetUrl}\n\nIf you did not request a password reset, you can safely ignore this email.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #1f2937; border-radius: 16px; background-color: #111827; color: #f3f4f6;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">Kora<span style="color: #ff0a8a;">Space</span></h1>
      </div>
      
      <div style="background-color: #1f2937; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0;">Password Reset Request</h2>
        <p style="color: #d1d5db; line-height: 1.6; font-size: 14px; margin: 0 0 16px 0;">
          We received a request to reset the password for your Koraspace account. Click the button below to choose a new password:
        </p>
        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="${resetUrl}" style="background-color: #ff0a8a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block;">
            Reset Password →
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject,
      text,
      html,
      headers: {
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "Auto-Submitted": "auto-generated",
      },
    });
  } catch (err) {
    console.error("[Mailer] Failed to send password reset email:", err);
  }
}

export async function sendVerificationEmail(email: string, name: string, verifyUrl: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  const firstName = name ? name.split(" ")[0] : "there";
  const subject = "Verify your email address for Koraspace";
  
  const text = `Hi ${firstName},\n\nWelcome to Koraspace! Please verify your email address to activate your account and start managing your social channels with AI.\n\nClick here to verify:\n${verifyUrl}\n\nThis verification link will expire in 24 hours. If you did not create a Koraspace account, you can safely ignore this message.\n\nNeed assistance? Reach out to support@koraspace.site`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="padding: 32px 32px 20px 32px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                    Kora<span style="color: #ff0a8a;">Space</span>
                  </h1>
                  <p style="color: #9ca3af; font-size: 13px; margin: 4px 0 0 0;">AI Social Media Operating System</p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <div style="background-color: #1f2937; border-radius: 14px; padding: 28px 24px; border: 1px solid rgba(255, 255, 255, 0.06);">
                    <h2 style="color: #ffffff; font-size: 19px; font-weight: 700; margin: 0 0 12px 0;">Verify your email address</h2>
                    <p style="color: #d1d5db; line-height: 1.6; font-size: 14px; margin: 0 0 20px 0;">
                      Hi ${firstName}, welcome to Koraspace! Please verify your email address to activate your account and start managing your social channels with AI.
                    </p>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding: 10px 0 20px 0;">
                          <a href="${verifyUrl}" style="background-color: #ff0a8a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 8px 25px rgba(255, 10, 138, 0.25);">
                            Verify Email Address →
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0; line-height: 1.5;">
                      This verification link will expire in 24 hours. If you did not create a Koraspace account, you can safely ignore this message.
                    </p>
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                      <p style="color: #6b7280; font-size: 11px; word-break: break-all; margin: 0;">
                        Button not working? Copy and paste this URL into your browser:<br/>
                        <a href="${verifyUrl}" style="color: #ff7fba; text-decoration: underline;">${verifyUrl}</a>
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 0 32px 32px 32px; text-align: center;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    Questions or need assistance? Contact us at <a href="mailto:support@koraspace.site" style="color: #ff0a8a; text-decoration: none;">support@koraspace.site</a>.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject,
      text,
      html,
      headers: {
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "Auto-Submitted": "auto-generated",
      },
    });
  } catch (err) {
    console.error("[Mailer] Failed to send email verification:", err);
  }
}

export const MAIL_HELLO_FROM =
  process.env.SMTP_HELLO_FROM ||
  (process.env.SMTP_USER ? `"Koraspace" <${process.env.SMTP_USER}>` : '"Koraspace" <hello@koraspace.site>');

export interface OnboardingWelcomeParams {
  email: string;
  name: string;
  username?: string;
  persona?: string;
  platforms?: string[];
  goals?: string[];
  niche?: string;
}

export async function sendOnboardingWelcomeEmail(params: OnboardingWelcomeParams) {
  const transporter = getTransporter();
  if (!transporter) return;

  const { email, name, username, persona, platforms = [], niche } = params;
  const firstName = name ? name.split(" ")[0] : "Creator";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://koraspace.site").replace(/\/$/, "");
  const dashboardUrl = `${appUrl}/dashboard`;
  const composeUrl = `${appUrl}/dashboard/compose`;
  const calendarUrl = `${appUrl}/dashboard/calendar`;
  const integrationsUrl = `${appUrl}/dashboard/integrations`;
  const botsUrl = `${appUrl}/dashboard/bots`;

  const personaLabel =
    persona === "marketer"
      ? "Agency & Marketing Lead"
      : persona === "client"
      ? "Brand & Business"
      : "Content Creator";

  const platformsFormatted =
    platforms.length > 0
      ? platforms
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(" • ")
      : "Multi-Platform Suite";

  const subject = `Welcome to your new HQ, ${firstName}! 🚀 Your Koraspace is live`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f3f4f6;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; padding: 40px 16px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
              
              <!-- Top Gradient Brand Accent -->
              <tr>
                <td height="4" style="background: linear-gradient(90deg, #ff0a8a 0%, #3b82f6 50%, #ff0a8a 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
              </tr>

              <!-- Header -->
              <tr>
                <td style="padding: 32px 32px 20px 32px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.8px;">
                    Kora<span style="color: #ff0a8a;">Space</span>
                  </h1>
                  <p style="color: #9ca3af; font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">
                    Your AI Social Media Operating System
                  </p>
                </td>
              </tr>

              <!-- Hero Card -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <div style="background: linear-gradient(180deg, rgba(255, 10, 138, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%); border: 1px solid rgba(255, 10, 138, 0.20); border-radius: 16px; padding: 28px 24px; text-align: center;">
                    <div style="display: inline-block; padding: 4px 14px; background-color: rgba(255, 10, 138, 0.15); border: 1px solid rgba(255, 10, 138, 0.30); border-radius: 9999px; color: #ff7fba; font-size: 12px; font-weight: 600; margin-bottom: 14px;">
                      🎉 Setup Complete · Workspace Ready
                    </div>
                    
                    <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.3;">
                      Welcome aboard, ${firstName}! ✨
                    </h2>

                    <p style="color: #d1d5db; font-size: 14.5px; line-height: 1.6; margin: 0 0 20px 0;">
                      Your Koraspace command center ${username ? `(<strong style="color: #ffffff;">@${username}</strong>)` : ""} is ready. We've customized your tools for <strong style="color: #ff7fba;">${personaLabel}</strong>${niche ? ` in the <strong style="color: #ffffff;">${niche}</strong> niche` : ""}.
                    </p>

                    <!-- Main CTA -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${dashboardUrl}" style="background-color: #ff0a8a; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 15px 36px; border-radius: 12px; display: inline-block; box-shadow: 0 10px 25px rgba(255, 10, 138, 0.35);">
                            Launch Your Dashboard →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Workspace Quick-Start Launchpad -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <h3 style="color: #ffffff; font-size: 16px; font-weight: 700; margin: 0 0 16px 0; letter-spacing: -0.2px;">
                    ⚡ Explore Your Workspace Features
                  </h3>

                  <!-- Feature 1: AI Composer -->
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f2937; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; margin-bottom: 12px;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="36" valign="top" style="font-size: 22px; line-height: 1;">✍️</td>
                            <td style="padding-left: 12px;">
                              <a href="${composeUrl}" style="color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; display: block;">
                                Multi-Platform AI Composer & Ghost Writer
                              </a>
                              <p style="color: #9ca3af; font-size: 12.5px; line-height: 1.5; margin: 4px 0 0 0;">
                                Draft once and let Gemini tailor copy, hooks, and hashtags for Instagram, X, LinkedIn, and TikTok.
                              </p>
                            </td>
                            <td width="24" align="right" valign="middle">
                              <a href="${composeUrl}" style="color: #ff0a8a; font-size: 18px; text-decoration: none; font-weight: bold;">›</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Feature 2: Smart Calendar -->
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f2937; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; margin-bottom: 12px;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="36" valign="top" style="font-size: 22px; line-height: 1;">📅</td>
                            <td style="padding-left: 12px;">
                              <a href="${calendarUrl}" style="color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; display: block;">
                                Content Calendar & Audience Surge Windows
                              </a>
                              <p style="color: #9ca3af; font-size: 12.5px; line-height: 1.5; margin: 4px 0 0 0;">
                                Schedule during audience peak hours and plan weekly campaigns with visual media preview.
                              </p>
                            </td>
                            <td width="24" align="right" valign="middle">
                              <a href="${calendarUrl}" style="color: #ff0a8a; font-size: 18px; text-decoration: none; font-weight: bold;">›</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Feature 3: Social Integrations -->
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f2937; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; margin-bottom: 12px;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="36" valign="top" style="font-size: 22px; line-height: 1;">🔗</td>
                            <td style="padding-left: 12px;">
                              <a href="${integrationsUrl}" style="color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; display: block;">
                                Connect Your Social Accounts
                              </a>
                              <p style="color: #9ca3af; font-size: 12.5px; line-height: 1.5; margin: 4px 0 0 0;">
                                Target platforms: <span style="color: #d1d5db;">${platformsFormatted}</span>. Connect in 1 click for direct publishing.
                              </p>
                            </td>
                            <td width="24" align="right" valign="middle">
                              <a href="${integrationsUrl}" style="color: #ff0a8a; font-size: 18px; text-decoration: none; font-weight: bold;">›</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Feature 4: Autonomous Bots -->
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f2937; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="36" valign="top" style="font-size: 22px; line-height: 1;">🤖</td>
                            <td style="padding-left: 12px;">
                              <a href="${botsUrl}" style="color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; display: block;">
                                Autonomous AI Engines & Memory
                              </a>
                              <p style="color: #9ca3af; font-size: 12.5px; line-height: 1.5; margin: 4px 0 0 0;">
                                Train your brand voice memory and activate background bots to research viral trends and generate draft queues.
                              </p>
                            </td>
                            <td width="24" align="right" valign="middle">
                              <a href="${botsUrl}" style="color: #ff0a8a; font-size: 18px; text-decoration: none; font-weight: bold;">›</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Personal Support & Founder Note -->
              <tr>
                <td style="padding: 0 32px 32px 32px;">
                  <div style="background-color: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.06);">
                    <p style="color: #d1d5db; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">
                      💡 <strong>Need help or want onboarding assistance?</strong> Simply reply directly to this email (<a href="mailto:hello@koraspace.site" style="color: #ff0a8a; text-decoration: none;">hello@koraspace.site</a>) and our team will assist you immediately.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      Happy creating,<br/>
                      <span style="color: #ffffff; font-weight: 600;">The Koraspace Team</span>
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0d121f; padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                    © ${new Date().getFullYear()} Koraspace Inc. · All rights reserved.
                  </p>
                  <p style="color: #4b5563; font-size: 11px; margin: 0;">
                    You are receiving this email because you created and completed setup on <a href="https://koraspace.site" style="color: #9ca3af; text-decoration: underline;">koraspace.site</a>.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `Welcome aboard, ${firstName}!\n\nYour Koraspace command center ${username ? `(@${username})` : ""} is ready. We've customized your tools for ${personaLabel}${niche ? ` in the ${niche} niche` : ""}.\n\nLaunch your dashboard:\n${dashboardUrl}\n\nQuick features:\n- Multi-Platform AI Composer: ${composeUrl}\n- Smart Content Calendar: ${calendarUrl}\n- Connect Social Accounts: ${integrationsUrl}\n- Autonomous AI Bots: ${botsUrl}\n\nNeed help? Reply directly to this email or reach us at hello@koraspace.site.\n\nHappy creating,\nThe Koraspace Team`;

  try {
    await transporter.sendMail({
      from: MAIL_HELLO_FROM,
      to: email,
      replyTo: "hello@koraspace.site",
      subject,
      text,
      html,
      headers: {
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "Auto-Submitted": "auto-generated",
      },
    });
  } catch (err) {
    console.error("[Mailer] Failed to send onboarding welcome email:", err);
  }
}


