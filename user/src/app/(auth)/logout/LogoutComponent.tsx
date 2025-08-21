"use client";
import { useAppStore } from "@/components/app-provider";
import { getRefreshTokenFormLocalStorage } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Logout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync } = useLogoutMutation();
  const accessToken = searchParams.get("accessToken");
  const ref = useRef<any>(null);

  useEffect(() => {
    if (
      ref.current ||
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
  }, [mutateAsync, router, accessToken]); // Thêm accessToken vào dependency array

  return <div>Logout</div>;
}
