"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getMe, type Me } from "@/lib/api";

/** ログイン必須ページ用: 未ログインなら/loginへ、ログイン済みなら/meを取得する */
export function useMe() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (session?.apiToken) {
      getMe(session.apiToken).then(setMe).catch(console.error);
    }
  }, [status, session?.apiToken, router]);

  return { me, token: session?.apiToken, refresh: () => session?.apiToken && getMe(session.apiToken).then(setMe) };
}
