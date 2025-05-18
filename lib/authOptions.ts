import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";

// Розширимо типи для NextAuth
declare module "next-auth" {
  interface User {
    role?: string;
    id: string;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

// Розширимо JWT типи
declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        
        if (!email || !password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email },
        });
        
        if (!user || !user.hashedPassword) return null;
        
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        
        if (!isValid) return null;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role ?? "user",
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Важливо вказати JWT як стратегію для правильної роботи колбеків
  },
  callbacks: {
    async jwt({ token, user }) {
      // Передаємо дані користувача в токен
      if (user) {
        token.role = user.role ?? "user";
        token.sub = user.id; // Переконаємося, що ID правильно встановлено
      }
      return token;
    },
    async session({ session, token }) {
      // Передаємо дані з токена в сесію
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role ?? "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development", // Включаємо режим debug для розробки
};