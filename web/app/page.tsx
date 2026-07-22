"use client";

import { useRouter } from "next/navigation";

const STEPS = [
  { num: "1", text: "Elige una tarea" },
  { num: "2", text: "Cumple las condiciones" },
  { num: "3", text: "Recibe tu dinero por Yape" },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <main
      onClick={() => router.push("/login")}
      className="min-h-screen cursor-pointer flex flex-col items-center justify-center gap-10 px-6 text-center"
    >
      <div>
        <h1 className="text-4xl font-extrabold">
          Cash<span className="text-brand-dark">Yape</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Completa tareas y recibe dinero al instante en tu Yape. Gratis.
        </p>
      </div>

      <ol className="flex flex-col gap-4 w-full max-w-xs">
        {STEPS.map((s) => (
          <li key={s.num} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-bold">
              {s.num}
            </span>
            <span className="font-medium">{s.text}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button className="rounded-xl bg-brand py-3 font-bold hover:bg-brand-dark transition-colors">
          Empezar gratis
        </button>
        <button className="rounded-xl border-2 border-brand py-3 font-bold hover:bg-yellow-50 transition-colors">
          Recibir por Yape
        </button>
      </div>
    </main>
  );
}
