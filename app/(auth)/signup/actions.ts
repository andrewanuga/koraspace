"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";
import {
  signupSchema,
  emailOnlySchema,
  otpVerificationSchema,
  sanitizeEmail,
  sanitizeText,
} from "@/lib/validations/auth";

export async function registerUser(email: string, password: string, name: string) {
  try {
    // 1. Validate & sanitize using Zod Schema & Regular Expressions
    const validationResult = signupSchema.safeParse({ name, email, password });
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || "Invalid registration input.";
      return { error: firstError };
    }

    const { name: cleanName, email: cleanEmail, password: cleanPassword } = validationResult.data;

    // 2. Check for pre-existing registered email in DB
    const existingUser = await prisma.profile.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return {
        error:
          "An account with this email address already exists. Please sign in instead or use another email.",
      };
    }

    const password_hash = await bcrypt.hash(cleanPassword, 12);

    // 3. Create new user profile with emailVerified initially null
    await prisma.profile.create({
      data: {
        email: cleanEmail,
        full_name: cleanName,
        password_hash,
        emailVerified: null,
      },
    });

    // 4. Generate 6-digit numeric OTP code
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Delete any stale tokens for this identifier
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: cleanEmail,
        token: `${cleanEmail}:${otpCode}`,
        expires,
      },
    });

    // 5. Build 1-click verification URL
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://koraspace.site").replace(/\/$/, "");
    const verifyUrl = `${appUrl}/verify-email?email=${encodeURIComponent(cleanEmail)}&otp=${otpCode}`;

    // 6. Send verification email with 6-digit PIN
    sendVerificationEmail(cleanEmail, cleanName, otpCode, verifyUrl).catch((err) => {
      console.warn("[Signup] Non-blocking verification email error:", err);
    });

    return { success: true, email: cleanEmail };
  } catch (error: any) {
    console.error("Signup error:", error);
    if (error?.code === "P2002") {
      return {
        error:
          "An account with this email address already exists. Please sign in instead or use another email.",
      };
    }
    return { error: "An unexpected error occurred during signup. Please try again." };
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const validationResult = emailOnlySchema.safeParse({ email });
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0]?.message || "Please enter a valid email address." };
    }

    const cleanEmail = validationResult.data.email;

    const user = await prisma.profile.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return { error: "No account found with this email address. Please sign up." };
    }

    if (user.emailVerified) {
      return {
        error: "This email address is already verified. You can sign in directly.",
        alreadyVerified: true,
      };
    }

    // Generate fresh 6-digit numeric OTP code
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: cleanEmail,
        token: `${cleanEmail}:${otpCode}`,
        expires,
      },
    });

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://koraspace.site").replace(/\/$/, "");
    const verifyUrl = `${appUrl}/verify-email?email=${encodeURIComponent(cleanEmail)}&otp=${otpCode}`;

    await sendVerificationEmail(cleanEmail, user.full_name || "Creator", otpCode, verifyUrl);

    return { success: true, message: "A new 6-digit verification code was sent to your inbox." };
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return { error: "Failed to resend verification email. Please try again." };
  }
}

export async function verifyEmailOtp(email: string, otp: string) {
  try {
    const validation = otpVerificationSchema.safeParse({ email, otp });
    if (!validation.success) {
      return { error: validation.error.errors[0]?.message || "Invalid verification code." };
    }

    const { email: cleanEmail, otp: cleanOtp } = validation.data;

    // Look for matching token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: cleanEmail,
        token: {
          in: [`${cleanEmail}:${cleanOtp}`, cleanOtp],
        },
      },
    });

    if (!tokenRecord) {
      return {
        error: "Invalid verification code. Please check the code in your email and try again.",
      };
    }

    if (new Date() > tokenRecord.expires) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: cleanEmail },
      }).catch(() => {});
      return {
        error: "This verification code has expired. Please request a new code.",
        expired: true,
      };
    }

    // Mark email as verified
    await prisma.profile.update({
      where: { email: cleanEmail },
      data: {
        emailVerified: new Date(),
      },
    });

    // Purge verification tokens
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    return { success: true, email: cleanEmail };
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return { error: "An error occurred while verifying the code. Please try again." };
  }
}

export async function verifyEmailToken(token: string) {
  try {
    if (!token || typeof token !== "string") {
      return { error: "Invalid or missing verification token." };
    }

    const cleanToken = token.trim();

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        OR: [
          { token: cleanToken },
          { token: { endsWith: `:${cleanToken}` } }
        ]
      },
    });

    if (!tokenRecord) {
      return {
        error:
          "This verification link is invalid or has already been used. Please request a new verification code.",
      };
    }

    if (new Date() > tokenRecord.expires) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: tokenRecord.identifier },
      }).catch(() => {});
      return {
        error:
          "This verification link has expired. Please enter your email below to receive a new one.",
        expired: true,
        email: tokenRecord.identifier,
      };
    }

    const cleanEmail = sanitizeEmail(tokenRecord.identifier);

    // Mark email verified
    await prisma.profile.update({
      where: { email: cleanEmail },
      data: {
        emailVerified: new Date(),
      },
    });

    // Clean up verification tokens
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    return { success: true, email: cleanEmail };
  } catch (error: any) {
    console.error("Verify email error:", error);
    return { error: "An error occurred while verifying your email. Please try again." };
  }
}

export async function checkUserVerificationStatus(email: string) {
  try {
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) return { exists: false, verified: false };
    const user = await prisma.profile.findUnique({
      where: { email: cleanEmail },
      select: { id: true, emailVerified: true },
    });
    if (!user) return { exists: false, verified: false };
    return { exists: true, verified: !!user.emailVerified };
  } catch {
    return { exists: false, verified: false };
  }
}
