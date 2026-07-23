import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// サーバー側（NextAuthコールバック内）からFastAPIを呼ぶときのURL。
// Docker内ではコンテナ間通信のため API_URL_INTERNAL (http://server:8000) を使う
const apiUrl =
  process.env.API_URL_INTERNAL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      // 初回サインイン時: GoogleのIDトークンをFastAPIに渡し、自前JWTを受け取る
      // ここで例外を投げるとNextAuthのセッション発行自体が失敗するため、
      // バックエンド呼び出しの失敗はログに残すだけで握りつぶす（Heroku dynoのスリープ起床待ち等を考慮）
      if (account?.id_token) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 9000);
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (res.ok) {
            const data = await res.json();
            token.apiToken = data.access_token;
          } else {
            console.error("auth/login failed", res.status, await res.text());
          }
        } catch (err) {
          console.error("auth/login request error", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.apiToken = token.apiToken as string | undefined;
      return session;
    },
  },
};
