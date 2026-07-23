"use client";

import { Header } from "@/components/Header";
import { Progress } from "@/components/ui/progress";
import { useMe } from "@/hooks/useMe";

const MONLIX_IFRAME_URL = process.env.NEXT_PUBLIC_MONLIX_IFRAME_URL;

const MOCK_TASKS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Tarea de ejemplo ${i + 1}`,
  points: (i + 1) * 250,
}));

export default function HomePage() {
  const { me } = useMe();

  const points = me?.points ?? 0;
  const minPoints = me?.min_withdrawal_points ?? 10000;
  const remaining = Math.max(minPoints - points, 0);
  const progress = Math.min((points / minPoints) * 100, 100);

  return (
    <div className="min-h-screen w-full bg-neutral-50">
      <Header points={points} />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Points / progress card */}
        <div className="rounded-3xl bg-yellow-400 p-6 sm:p-8">
          <p className="text-sm text-neutral-800">Tus puntos</p>
          <div className="mt-1" style={{ fontSize: "2.25rem", lineHeight: 1 }}>
            {points.toLocaleString("es-PE")} pts
          </div>

          <div className="mt-5 rounded-2xl bg-white/50 p-4">
            <div className="flex items-center justify-between text-sm text-neutral-800">
              <span>Mínimo para retirar</span>
              <span>{minPoints.toLocaleString("es-PE")} pts</span>
            </div>
            <Progress
              value={progress}
              className="mt-2 h-3 bg-white [&>[data-slot=progress-indicator]]:bg-neutral-900"
            />
            <p className="mt-2 text-xs text-neutral-700">
              {remaining > 0
                ? `Te faltan ${remaining.toLocaleString("es-PE")} pts para retirar`
                : "¡Ya puedes retirar! Solicítalo desde tu billetera 🎉"}
            </p>
          </div>
        </div>

        {/* Monlix iframe: tareas, detalle y verificación las maneja Monlix */}
        <div className="mt-8">
          <h2>Tareas con recompensa</h2>
          <div className="mt-4 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            {MONLIX_IFRAME_URL && me ? (
              <iframe
                src={`${MONLIX_IFRAME_URL}&subid=${me.id}`}
                className="h-[70vh] w-full border-0"
                title="Tareas"
              />
            ) : (
              <div className="p-6">
                <p className="mb-4 text-center text-xs text-neutral-400">
                  Vista previa (pendiente de contrato con Monlix)
                </p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
                  {MOCK_TASKS.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 p-4 text-center"
                    >
                      <div className="h-12 w-12 rounded-full bg-yellow-100" />
                      <div className="text-sm text-neutral-900">{task.title}</div>
                      <span className="text-xs text-yellow-600">
                        +{task.points.toLocaleString("es-PE")} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
