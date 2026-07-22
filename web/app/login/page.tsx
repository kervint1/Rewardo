"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
      <h1 className="text-4xl font-extrabold">
        Cash<span className="text-brand-dark">Yape</span>
      </h1>
      <button
        onClick={() => signIn("google", { callbackUrl: "/home" })}
        className="w-full max-w-xs rounded-xl bg-brand py-3 font-bold hover:bg-brand-dark transition-colors"
      >
        Continuar con Google
      </button>
    </main>
  );
}
