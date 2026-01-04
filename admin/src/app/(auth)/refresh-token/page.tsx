"use client";
import {
  checkAndRefreshToken,
  getRefreshTokenFormLocalStorage,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react";

function RefreshTokenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPathname = searchParams.get("redirect");
  const refreshToken = searchParams.get("refreshToken");

  useEffect(() => {
    if (refreshToken && refreshToken === getRefreshTokenFormLocalStorage()) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || "/");
        },
      });
    }
  }, [router, refreshToken, redirectPathname]);
  return <div>Refresh Token ...</div>;
}

export default function RefreshTokenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RefreshTokenContent />
    </Suspense>
  );
}
