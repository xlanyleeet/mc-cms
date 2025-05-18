"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleRegister = async () => {
    setError("");
  
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  
    if (res.ok) {
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
  
      if (signInRes?.ok) {
        router.push("/");
      } else {
        setError("Не вдалося увійти після реєстрації");
      }
    } else {
      const data = await res.json();
      setError(data.message || "Помилка реєстрації");
    }
  };  

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-4">
        <h1 className="text-2xl font-bold text-center mb-4">Реєстрація</h1>

        <input
          type="text"
          placeholder="Ім’я"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-700 text-white"
        />
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

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={handleRegister}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Зареєструватися
        </button>
      </div>
    </div>
  );
}
