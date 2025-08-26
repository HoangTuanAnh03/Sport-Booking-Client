"use client";
import authApiRequest from "@/apiRequests/auth";
import { handleErrorApi } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function ButtonLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApiRequest.logout();
      router.push("/login");
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  return <div onClick={handleLogout}>Log out</div>;
}
