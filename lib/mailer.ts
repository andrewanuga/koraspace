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
  const subject = "Welcome to Koraspace — Your Workspace is Ready!";

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
      html,
    });
  } catch (err) {
    console.error("[Mailer] Failed to send welcome verification email:", err);
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  const subject = "Reset your Koraspace password";
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
      html,
    });
  } catch (err) {
    console.error("[Mailer] Failed to send password reset email:", err);
  }
}

