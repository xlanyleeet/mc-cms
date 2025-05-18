'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

// Metadata не може бути використана в компоненті client
// Перенесіть це до окремого файлу metadata.ts у корені app
// export const metadata = {
//   title: 'Minecraft Server CMS',
//   description: 'Офіційний сайт сервера Minecraft',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <head>
        <title>Minecraft Server CMS</title>
        <meta name="description" content="Офіційний сайт сервера Minecraft" />
      </head>
      <body className={`${inter.className} bg-zinc-900 text-white`}>
        <Providers>
          <Header />
          <main className="max-w-6xl mx-auto mt-6 px-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}