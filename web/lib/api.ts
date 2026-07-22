const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface ApiErrorBody {
  code: string;
  message: string;
}

export class ApiError extends Error {
  code: string;
  constructor(body: ApiErrorBody) {
    super(body.message);
    this.code = body.code;
  }
}

export interface Me {
  id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
  balance: number;
  min_withdrawal_amount: number;
}

export interface Withdrawal {
  id: string;
  yape_phone: string;
  amount: number;
  status: "pending" | "completed" | "rejected";
  created_at: string;
}

async function apiFetch<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.error ?? { code: "UNKNOWN", message: "Error de conexión" }
    );
  }
  return res.json();
}

// APIは金額をDecimal由来の文字列（"11.00"）で返すため、数値に正規化する
function normalizeWithdrawal(w: Withdrawal): Withdrawal {
  return { ...w, amount: Number(w.amount) };
}

export async function getMe(token: string): Promise<Me> {
  const me = await apiFetch<Me>("/api/v1/me", token);
  return {
    ...me,
    balance: Number(me.balance),
    min_withdrawal_amount: Number(me.min_withdrawal_amount),
  };
}

export async function getWithdrawals(
  token: string
): Promise<{ withdrawals: Withdrawal[] }> {
  const res = await apiFetch<{ withdrawals: Withdrawal[] }>(
    "/api/v1/withdrawals",
    token
  );
  return { withdrawals: res.withdrawals.map(normalizeWithdrawal) };
}

export async function createWithdrawal(
  token: string,
  yapePhone: string,
  amount: number
): Promise<Withdrawal> {
  const w = await apiFetch<Withdrawal>("/api/v1/withdrawals", token, {
    method: "POST",
    body: JSON.stringify({ yape_phone: yapePhone, amount }),
  });
  return normalizeWithdrawal(w);
}
