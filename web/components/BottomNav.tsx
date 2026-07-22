"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/home", label: "Inicio", icon: "🏠" },
  { href: "/wallet", label: "Billetera", icon: "👛" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-md">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center py-2 text-sm ${
              pathname === item.href ? "font-bold text-brand-dark" : "text-gray-500"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
