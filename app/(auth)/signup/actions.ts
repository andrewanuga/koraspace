"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

export async function registerUser(email: string, password: string, name: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // 1. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { error: "Please enter a valid email address." };
    }

    // 2. Password validation
    if (!password || password.length < 8) {
      return { error: "Password must be at least 8 characters long." };
    }

    // 3. Check for existing registered email in DB
    const existingUser = await prisma.profile.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return {
        error:
          "An account with this email address already exists. Please sign in instead or use another email.",
      };
    }

    const password_hash = await bcrypt.hash(password, 12);

    // 4. Create new user profile with emailVerified initially null
    await prisma.profile.create({
      data: {
        email: cleanEmail,
        full_name: cleanName,
        password_hash,
        emailVerified: null,
      },
    });

    // 5. Generate secure verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    // Delete any stale tokens for this identifier
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: cleanEmail,
        token: verificationToken,
        expires,
      },
    });

    // 6. Build verification URL
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://koraspace.site").replace(/\/$/, "");
    const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(cleanEmail)}`;

    // 7. Send verification email
    sendVerificationEmail(cleanEmail, cleanName, verifyUrl).catch((err) => {
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
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail) {
      return { error: "Please provide your email address." };
    }

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

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: cleanEmail,
        token: verificationToken,
        expires,
      },
    });

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://koraspace.site").replace(/\/$/, "");
    const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(cleanEmail)}`;

    await sendVerificationEmail(cleanEmail, user.full_name || "Creator", verifyUrl);

    return { success: true, message: "A fresh verification link has been sent to your inbox." };
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return { error: "Failed to resend verification email. Please try again." };
  }
}

export async function verifyEmailToken(token: string) {
  try {
    if (!token || typeof token !== "string") {
      return { error: "Invalid or missing verification token." };
    }

    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return {
        error:
          "This verification link is invalid or has already been used. Please request a new verification email.",
      };
    }

    if (new Date() > tokenRecord.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      }).catch(() => {});
      return {
        error:
          "This verification link has expired. Please enter your email below to receive a new one.",
        expired: true,
        email: tokenRecord.identifier,
      };
    }

    const cleanEmail = tokenRecord.identifier.toLowerCase().trim();

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
    const cleanEmail = email.toLowerCase().trim();
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

