import LoginForm from "@/app/(auth)/login/login-form";
import Image from "next/image";
import { CheckIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import Google from "@/app/(auth)/login/google";

export default function LoginPage() {
  const UrlOwner = process.env.NEXT_PUBLIC_OWNER_URL;
  return (
    <div
      className="flex w-full h-[calc(100vh-65px)] justify-center text-[#121212] bg-cover "
      style={{
        backgroundImage: "url('/image.png?height=1080&width=1920')",
      }}
    >
      <div className="absolute inset-0 top-16 bg-teal-500/30 backdrop-blur-sm"></div>

      <div className="max-w-[600px] h-full w-full  flex justify-center items-center">
        <div className="w-full max-w-md p-8 rounded-lg bg-sky-50/90 shadow-lg relative z-10">
          <div className=" items-center my-6">
            <h3 className="text-xl font-bold">Đăng nhập - Khách</h3>
            <br />
            <h3 className="text-m font-bold">
              Chào mừng bạn đến với AE booking
            </h3>
          </div>
          <div className="flex justify-between w-full gap-[10%] ">
            <div className="flex-[4_4_0%]">
              <LoginForm />
              <div className="flex justify-center my-4">
                <Link
                  href={`${UrlOwner}/login`}
                  className="text-[#0e2eed] hover:text-[#192fb5]"
                >
                  Nếu bạn là chủ sân, bấm vào đây để đăng nhập?&nbsp;
                </Link>
              </div>
              <div className="flex justify-center my-4">
                Bạn chưa có tài khoản?&nbsp;
                <Link
                  href="/register"
                  className="text-[#0e2eed] hover:text-[#192fb5]"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
