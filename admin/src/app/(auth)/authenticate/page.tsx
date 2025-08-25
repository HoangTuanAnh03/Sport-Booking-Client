"use client";
import authApiRequest from "@/apiRequests/auth";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect } from "react";

export default function Authentication() {
  const router = useRouter();
  const isCalledRef = React.useRef(false);

  useEffect(() => {
    const authCodeRegex = /code=([^&]+)/;
    const isMatch = window.location.href.match(authCodeRegex);
    const authCode = isMatch ? isMatch[1] : "";

    if (!isMatch) {
      router.push("/login");
    }

    const outbound = async (code: string) => {
      const res = await authApiRequest.outbound(code);

      if (res.status === 200) {
        toast({
          title: "Đăng nhập thành công bằng Google.",
        });
        router.push("/");
      } else if (res.status === 403) {
        toast({
          variant: "destructive",
          title: "Chỉ ADMIN mới được vào trang này",
        });
        router.push("/login");
      } else {
        toast({
          variant: "destructive",
          title: "Tài khoản sử dụng phương thức đăng nhập bằng mật khẩu.",
        });
        router.push("/login");
      }
    };

    if (isCalledRef.current) return;

    outbound(authCode);
    isCalledRef.current = true;
  }, []);

  return (
    <div className="w-full h-lvh flex flex-col justify-center items-center">
      <Loader2 className="h-[50px] w-[50px] text-blue-600 animate-spin" />
      <div className="mt-4">Authenticate ...</div>
    </div>
  );
}
