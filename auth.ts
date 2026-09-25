import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

import { loginSchema } from "@/lib/validations/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email: cleanEmail, password: cleanPassword } = parsed.data;

        const user = await prisma.profile.findUnique({
          where: { email: cleanEmail }
        });

        if (!user || !user.password_hash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          cleanPassword,
          user.password_hash
        );

        if (!isValid) {
          return null;
        }

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          image: user.avatar_url,
          plan: user.plan,
          is_admin: user.is_admin
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.plan = (user as any).plan
        token.is_admin = (user as any).is_admin
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).plan = token.plan
        ;(session.user as any).is_admin = token.is_admin
      }
      return session
    }
  }
})
