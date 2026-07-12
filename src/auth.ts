import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { DUMMY_PASSWORD_HASH } from "@/lib/dummy-password-hash";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        // Always bcrypt.compare to reduce email-enumeration timing leaks
        const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
        const valid = await bcrypt.compare(parsed.data.password, hash);

        if (!user?.passwordHash || !valid) return null;

        // Unverified accounts cannot obtain a session
        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.name,
          image: user.image,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.sv =
          "sessionVersion" in user && typeof user.sessionVersion === "number"
            ? user.sessionVersion
            : 0;
        token.email = user.email;
        token.name = user.name;
      }

      // Invalidate JWTs after password change (sessionVersion bump)
      if (token.sub) {
        try {
          const [row] = await db
            .select({
              sessionVersion: users.sessionVersion,
              emailVerified: users.emailVerified,
            })
            .from(users)
            .where(eq(users.id, token.sub))
            .limit(1);

          if (!row) {
            return { ...token, sub: undefined };
          }

          const tokenSv = typeof token.sv === "number" ? token.sv : 0;
          if (row.sessionVersion !== tokenSv) {
            return { ...token, sub: undefined, sv: -1 };
          }

          if (!row.emailVerified) {
            return { ...token, sub: undefined };
          }
        } catch {
          // On DB errors keep existing token to avoid mass logouts
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.sub) {
        // Force unauthenticated session shape
        session.user = undefined as unknown as typeof session.user;
        return session;
      }

      if (session.user) {
        session.user.id = token.sub;
        if (typeof token.email === "string") session.user.email = token.email;
        if (typeof token.name === "string") session.user.name = token.name;
      }
      return session;
    },
  },
});
