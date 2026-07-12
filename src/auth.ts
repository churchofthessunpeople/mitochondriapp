import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { DUMMY_PASSWORD_HASH } from "@/lib/dummy-password-hash";
import { isEmailVerificationEnabled } from "@/lib/email-verification";
import { normalizeUsername } from "@/lib/username";

const credentialsSchema = z.object({
  username: z.string().min(1).max(24),
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
    maxAge: 60 * 60 * 24 * 14,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const username = normalizeUsername(parsed.data.username);
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
        const valid = await bcrypt.compare(parsed.data.password, hash);

        if (!user?.passwordHash || !valid) return null;

        if (isEmailVerificationEnabled() && !user.emailVerified) {
          return null;
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.displayName ?? user.username,
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

      if (token.sub) {
        try {
          const [row] = await db
            .select({
              sessionVersion: users.sessionVersion,
              emailVerified: users.emailVerified,
              username: users.username,
              displayName: users.displayName,
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

          if (isEmailVerificationEnabled() && !row.emailVerified) {
            return { ...token, sub: undefined };
          }

          token.name = row.displayName ?? row.username;
        } catch {
          // keep token on DB blips
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.sub) {
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
