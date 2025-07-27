import LoginForm from "@/app/(auth)/login/login-form";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import Google from "@/app/(auth)/login/google";
import { Checkbox } from "@/components/ui/checkbox";
import TermsGoogle from "@/app/(auth)/register/terms";
import RegisterForm from "@/app/(auth)/register/register-form";

// import Icon from "";

export default function RegisterPage() {
  return (
    <div className="flex w-full justify-center text-[#121212] bg-cover"
        style={{
        backgroundImage: "url('/image.png?height=1080&width=1920')",
      }}
    >
      <div className="absolute inset-0 bg-teal-500/30 backdrop-blur-sm h-full"></div>
      
      <div className="max-w-[600px] w-full h-screen flex justify-center items-center">
      <div className="w-full max-w-md p-8 rounded-lg bg-sky-50/90 shadow-lg relative z-10">
        <div className="flex items-center my-6">
          <h3 className="text-xl font-bold">Chào mừng bạn đến với AE booking</h3>
        </div>
        <div className="flex justify-between w-full gap-[10%] ">
          <div className="flex-[4_4_0%]">
            <div className="text-2xl font-bold">Đăng ký tài khoản - Khách </div>
            <div className="relative flex items-center py-4">
              <Separator className="absolute" />
              <div className="relative flex w-full  justify-center  ">
              </div>
            </div>
            <RegisterForm />
            <div className="flex justify-center my-4">
              Bạn đã có tài khoản?&nbsp;
              <Link
                href="/login"
                className="text-[#0e2eed] hover:text-[#192fb5]"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
    </div>
  );
}
