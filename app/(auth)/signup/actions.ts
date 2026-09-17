"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function registerUser(email: string, password: string, name: string) {
  try {
    const existingUser = await prisma.profile.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const password_hash = await bcrypt.hash(password, 12);

    await prisma.profile.create({
      data: {
        email: email.toLowerCase().trim(),
        full_name: name.trim(),
        password_hash,
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: "An unexpected error occurred during signup." };
  }
}
