"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendWelcomeVerificationEmail } from "@/lib/mailer";

export async function registerUser(email: string, password: string, name: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    const existingUser = await prisma.profile.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const password_hash = await bcrypt.hash(password, 12);

    await prisma.profile.create({
      data: {
        email: cleanEmail,
        full_name: cleanName,
        password_hash,
      }
    });

    // Send welcome / activation email asynchronously via verified SMTP mailer
    sendWelcomeVerificationEmail(cleanEmail, cleanName).catch((err) => {
      console.warn("[Signup] Non-blocking welcome email error:", err);
    });

    return { success: true };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: "An unexpected error occurred during signup." };
  }
}

