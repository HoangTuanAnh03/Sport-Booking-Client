"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <div className="w-full flex justify-center h-screen items-center">
      <div className="max-w-md p-6 w-full flex items-center flex-col text-center">
        <Image
          src="/robby-subscription.svg"
          alt="Email Sent"
          width={160}
          height={160}
        />
        <h2 className="text-3xl font-bold mt-4 mb-6 text-red-700">
          Mật khẩu đã được gửi qua email
        </h2>

        <p className="text-[16px] mb-2 text-gray-600">
          Chúng tôi đã gửi mật khẩu tạm thời đến địa chỉ email:
        </p>

        <p className="text-[16px] font-semibold text-red-600 mb-6">{email}</p>

        <p className="text-[14px] text-gray-500 mb-6">
          Vui lòng kiểm tra hộp thư đến và sử dụng mật khẩu tạm thời để đăng
          nhập. Bạn có thể thay đổi mật khẩu sau khi đăng nhập thành công.
        </p>

        <Button className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold text-[16px] mb-4">
          <Link href="/login" className="w-full">
            Đăng nhập ngay
          </Link>
        </Button>

        <p className="text-sm text-gray-500">
          Không nhận được email? Kiểm tra thư mục spam hoặc{" "}
          <Link href="/register" className="text-red-600 hover:text-red-800">
            đăng ký lại
          </Link>
        </p>
      </div>
    </div>
  );
}
