/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'mc-heads.net' // Дозволити завантаження зображень з цього домену
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mc-heads.net',
        port: '',
        pathname: '/avatar/**',
      },
    ],
  },
}

import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Розширюємо інтерфейс сесії NextAuth, додаючи наші власні поля
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }

  /**
   * Розширюємо інтерфейс користувача NextAuth
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Розширюємо інтерфейс JWT NextAuth
   */
  interface JWT {
    id?: string;
    role?: string;
  }
}
module.exports = nextConfig;