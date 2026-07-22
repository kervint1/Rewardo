"use client";

import { useEffect, useState } from "react";

import { BottomNav } from "@/components/BottomNav";
import { useMe } from "@/hooks/useMe";
import {
  ApiError,
  createWithdrawal,
  getWithdrawals,
  type Withdrawal,
} from "@/lib/api";

const STATUS_LABEL: Record<Withdrawal["status"], string> = {
  pending: "Pendiente",
  completed: "Pagado",
  rejected: "Rechazado",
};

const STATUS_STYLE: Record<Withdrawal["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

export default function WalletPage() {
  const { me, token, refresh } = useMe();
  const [phone, setPhone] = useState("");
  const [pointsInput, setPointsInput] = useState("");
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadHistory = (t: string) =>
    getWithdrawals(t).then((r) => setHistory(r.withdrawals)).catch(console.error);

  useEffect(() => {
    if (token) loadHistory(token);
  }, [token]);

  const points = me?.points ?? 0;
  const minPoints = me?.min_withdrawal_points ?? 10000;
  const rate = me?.points_per_sol ?? 1000;
  const inputPoints = Number(pointsInput) || 0;
  const solesPreview = inputPoints > 0 ? inputPoints / rate : 0;
  const canSubmit =
    !!token && !submitting && points >= minPoints && phone.length === 9 && inputPoints > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      await createWithdrawal(token, phone, inputPoints);
      setPhone("");
      setPointsInput("");
      await Promise.all([refresh(), loadHistory(token)]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <main className="mx-auto max-w-md px-4 py-6 flex flex-col gap-8">
        <section className="rounded-xl bg-brand/20 p-6 text-center">
          <p className="text-sm text-gray-600">Tus puntos</p>
          <p className="text-4xl font-extrabold">
            {points.toLocaleString("es-PE")} pts
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {rate.toLocaleString("es-PE")} pts = S/ 1.00
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-bold">Canjear por Yape</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="tel"
              inputMode="numeric"
              pattern="9[0-9]{8}"
              maxLength={9}
              placeholder="Número de Yape (9 dígitos)"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              type="number"
              step={rate}
              min={0}
              placeholder={`Puntos (mínimo ${minPoints.toLocaleString("es-PE")})`}
              value={pointsInput}
              onChange={(e) => setPointsInput(e.target.value.replace(/\D/g, ""))}
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            {inputPoints > 0 && (
              <p className="text-sm text-gray-600">
                Recibirás <span className="font-bold">S/ {solesPreview.toFixed(2)}</span> en tu Yape
              </p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-brand py-3 font-bold transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {submitting ? "Enviando..." : "Canjear puntos"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-3 font-bold">Historial</h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no tienes canjes.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="font-bold">
                      {w.points.toLocaleString("es-PE")} pts → S/ {w.amount_soles.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {w.yape_phone} ·{" "}
                      {new Date(w.created_at).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[w.status]}`}
                  >
                    {STATUS_LABEL[w.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
