"use client"

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord } from "react-icons/fa";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCredentialsLogin = async () => {
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/", // або "/dashboard"
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="Server Logo" className="w-20 h-20 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold">Вхід на сервер</h1>
      </div>

      {/* Auth Buttons */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <AuthButton
          icon={<FcGoogle className="w-5 h-5" />}
          text="Увійти через Google"
          onClick={() => signIn("google")}
        />
        <AuthButton
          icon={<FaDiscord className="w-5 h-5 text-indigo-400" />}
          text="Увійти через Discord"
          onClick={() => signIn("discord")}
        />

        {/* Email/Password Form */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-700 text-white"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-700 text-white"
        />
        <button
          onClick={handleCredentialsLogin}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Увійти
        </button>
        <p className="text-sm text-center">
            Немає акаунту?{" "}
            <a href="/auth/register" className="text-blue-400 hover:underline">
                Зареєструватися
            </a>
        </p>
      </div>
    </div>
  );
  function AuthButton({
    icon,
    text,
    onClick,
  }: {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 w-full px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-md text-white text-sm font-medium shadow transition"
      >
        {icon}
        <span className="flex-1 text-center -ml-5">{text}</span>
      </button>
    );
  }  
}
