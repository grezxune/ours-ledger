import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { isSuperAdminEmail, resolvePlatformRole } from "@/lib/auth/roles";

function buildProviders() {
  const providers = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    );
  }

  providers.push(
    CredentialsProvider({
      name: "Dev Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Display Name", type: "text" },
        passphrase: { label: "Passphrase", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const passphrase = credentials?.passphrase;
        const allowedPassphrase = process.env.DEV_AUTH_PASSPHRASE ?? "ours-ledger";
        if (!email || passphrase !== allowedPassphrase) {
          return null;
        }

        return {
          id: email,
          email,
          name: credentials?.name || email.split("@")[0],
          platformRole: resolvePlatformRole(email),
        };
      },
    }),
  );

  return providers;
}

/**
 * Shared NextAuth configuration used by route handlers and server helpers.
 */
export const authOptions: NextAuthOptions = {
  providers: buildProviders(),
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.platformRole = isSuperAdminEmail(user.email) ? "super_admin" : "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.email ?? "anonymous";
        session.user.platformRole = token.platformRole === "super_admin" ? "super_admin" : "user";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
