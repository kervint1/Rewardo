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
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadHistory = (t: string) =>
    getWithdrawals(t).then((r) => setHistory(r.withdrawals)).catch(console.error);

  useEffect(() => {
    if (token) loadHistory(token);
  }, [token]);

  const balance = me?.balance ?? 0;
  const min = me?.min_withdrawal_amount ?? 10;
  const canSubmit =
    !!token && !submitting && balance >= min && phone.length === 9 && Number(amount) > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      await createWithdrawal(token, phone, Number(amount));
      setPhone("");
      setAmount("");
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
          <p className="text-sm text-gray-600">Saldo disponible</p>
          <p className="text-4xl font-extrabold">S/ {balance.toFixed(2)}</p>
        </section>

        <section>
          <h2 className="mb-3 font-bold">Retirar a Yape</h2>
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
              step="0.01"
              min="0"
              placeholder={`Monto (mínimo S/ ${min.toFixed(2)})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-brand py-3 font-bold transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {submitting ? "Enviando..." : "Solicitar retiro"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-3 font-bold">Historial</h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no tienes retiros.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="font-bold">S/ {w.amount.toFixed(2)}</p>
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
