"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, Wallet } from "lucide-react";

import { Logo } from "@/components/Logo";

export function Header({ points }: { points: number }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/home" aria-label="Inicio">
          <Logo />
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/home"
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              pathname === "/home"
                ? "bg-yellow-100 text-yellow-700"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Tareas
          </Link>
          <Link
            href="/exchange"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
              pathname === "/exchange"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Canjear
          </Link>
          <Link
            href="/wallet"
            className="flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1.5 text-sm text-neutral-900 transition-colors hover:bg-yellow-300"
          >
            <Wallet className="h-4 w-4" />
            <span className="tabular-nums">{points.toLocaleString("es-PE")} pts</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
