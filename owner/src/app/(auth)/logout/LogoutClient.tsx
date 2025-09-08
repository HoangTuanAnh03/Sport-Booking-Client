"use client";
import { getRefreshTokenFormLocalStorage } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LogoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync } = useLogoutMutation();
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const ref = useRef<any>(null);

  useEffect(() => {
    if (
      ref.current ||
      (refreshToken && refreshToken !== getRefreshTokenFormLocalStorage()) ||
      (accessToken && accessToken === getRefreshTokenFormLocalStorage())
    )
      return;

    ref.current = mutateAsync;

    mutateAsync().then((res) => {
      setTimeout(() => {
        ref.current = null;
      }, 1000);
      router.push("/login");
    });
  }, [mutateAsync, router, refreshToken]);

  return <div>Logout</div>;
}
