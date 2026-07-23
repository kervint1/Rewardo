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
  points: number;
  min_withdrawal_points: number;
  points_per_sol: number;
}

export interface Withdrawal {
  id: string;
  yape_phone: string;
  points: number;
  amount_soles: number;
  status: "pending" | "completed" | "rejected";
  created_at: string;
}

export interface Postback {
  id: string;
  reward_points: number;
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

// ソル額はDecimal由来の文字列（"10.00"）で届くため数値に正規化する（ポイントは整数のまま）
function normalizeWithdrawal(w: Withdrawal): Withdrawal {
  return { ...w, amount_soles: Number(w.amount_soles) };
}

export function getMe(token: string): Promise<Me> {
  return apiFetch<Me>("/api/v1/me", token);
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

export function getPostbacks(
  token: string
): Promise<{ postbacks: Postback[] }> {
  return apiFetch<{ postbacks: Postback[] }>("/api/v1/postbacks", token);
}

export async function createWithdrawal(
  token: string,
  yapePhone: string,
  points: number
): Promise<Withdrawal> {
  const w = await apiFetch<Withdrawal>("/api/v1/withdrawals", token, {
    method: "POST",
    body: JSON.stringify({ yape_phone: yapePhone, points }),
  });
  return normalizeWithdrawal(w);
}
