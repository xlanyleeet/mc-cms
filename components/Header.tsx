'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Додамо детальніше логування для відстеження проблеми
    console.log('Auth Status:', status);
    console.log('Session Data:', session);
    
    // Редирект для адміна
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      router.push('/admin');
    }
    
    // Обробка клацань поза дропдауном
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [status, session, router]);

  // Визначаємо URL аватара на основі username користувача
  const avatarUrl = session?.user?.name
    ? `https://mc-heads.net/avatar/${session.user.name}/40`
    : '/default-avatar.png';

  return (
    <header className="w-full p-4 bg-zinc-950 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white">
          MC Server
        </Link>
        <nav className="flex gap-4 items-center text-white">
          <Link href="/" className="hover:underline">
            Головна
          </Link>
          <Link href="/subscriptions" className="hover:underline">
            Підписки
          </Link>
          
          {/* Стан авторизації */}
          {status === 'loading' ? (
            <span className="text-sm text-zinc-400">Завантаження...</span>
          ) : status === 'authenticated' && session?.user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none flex items-center"
                aria-label="Відкрити меню користувача"
              >
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg z-50 border border-zinc-700">
                  <div className="px-4 py-2 text-sm text-white border-b border-zinc-700">
                    Привіт, {session.user.name}
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-white hover:bg-zinc-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Профіль
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700"
                  >
                    Вийти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin?callbackUrl=/user"
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm font-medium"
            >
              Увійти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}