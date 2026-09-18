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

export async function sendBroadcastEmail(emails: string[], message: string, type: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  const subject =
    type === "critical"
      ? "Critical Update from Koraspace"
      : type === "warning"
      ? "Action Required: Koraspace Warning"
      : "Koraspace Announcement";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
      <div style="margin-bottom: 20px;">
        <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">${subject}</h2>
      </div>
      <p style="color: #374151; line-height: 1.6; font-size: 15px; margin: 0 0 24px 0;">
        ${message}
      </p>
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
        You're receiving this because you have an active workspace on <a href="https://koraspace.site" style="color: #3b82f6; text-decoration: none;">Koraspace</a>.
      </p>
    </div>
  `;

  // Send individually using Promise.allSettled to prevent one failure from blocking others
  await Promise.allSettled(
    emails.map((email) =>
      transporter.sendMail({
        from: MAIL_FROM,
        to: email,
        subject,
        html,
      })
    )
  );
}
