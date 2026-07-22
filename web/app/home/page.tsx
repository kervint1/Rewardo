"use client";

import { BottomNav } from "@/components/BottomNav";
import { useMe } from "@/hooks/useMe";

const MONLIX_IFRAME_URL = process.env.NEXT_PUBLIC_MONLIX_IFRAME_URL;

export default function HomePage() {
  const { me } = useMe();

  const points = me?.points ?? 0;
  const minPoints = me?.min_withdrawal_points ?? 10000;
  const progress = Math.min((points / minPoints) * 100, 100);

  return (
    <div className="min-h-screen pb-16 flex flex-col">
      <header className="border-b border-gray-200 px-4 py-3">
        <div className="mx-auto max-w-md">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold">
              {points.toLocaleString("es-PE")} pts
            </span>
            <span className="text-sm text-gray-500">
              Mínimo para retirar: {minPoints.toLocaleString("es-PE")} pts
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-brand transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {MONLIX_IFRAME_URL && me ? (
          <iframe
            src={`${MONLIX_IFRAME_URL}&subid=${me.id}`}
            className="h-full w-full border-0"
            title="Tareas"
          />
        ) : (
          <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center text-gray-400">
              Monlix iframe
              <br />
              <span className="text-sm">(pendiente de contrato)</span>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
