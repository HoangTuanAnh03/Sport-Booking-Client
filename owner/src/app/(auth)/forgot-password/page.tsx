"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import userApiRequest from "@/apiRequests/users";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate email
      const validatedData = forgotPasswordSchema.parse({ email });

      // TODO: Replace with actual API call
      const response = await userApiRequest.sForgotPassword({
        email: validatedData.email,
      });

      if (response.payload?.code === 404) {
        // show error not found email in form
        setErrors({ email: "Email không tồn tại" });
        return;
      }

      if (response.payload?.code === 429) {
        toast({
          variant: "destructive",
          title: "Thao tác quá nhiều",
          description:
            "Bạn đã gửi yêu cầu quá nhiều. Vui lòng chờ trong 5 phút.",
        });
        return;
      }

      toast({
        title: "Email đã được gửi",
        description: "Vui lòng kiểm tra hộp thư để lấy mã OTP",
      });

      // Redirect to OTP verification page with email parameter
      router.push(
        `/forgot-password/verify-otp?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "email") {
            fieldErrors.email = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          variant: "destructive",
          title: "Có lỗi xảy ra",
          description: "Không thể gửi email. Vui lòng thử lại sau.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex mt-2 w-full justify-center text-[#121212] min-h-screen">
      <div className="flex flex-col max-w-[1340px] w-full px-6">
        <div className="flex items-center my-6">
          <h3 className="text-xl font-bold">Chào mừng bạn đến với</h3>
          <div className="pl-2">
            <span className="text-3xl font-bold text-red-700 drop-shadow-lg shadow-red-500/30">
              Sport Booking
            </span>
          </div>
        </div>

        <div className="flex justify-between w-full gap-[10%]">
          <div className="flex-[4_4_0%]">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href="/login"
                    className="text-red-600 hover:text-red-800"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </Link>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Quên mật khẩu
                  </CardTitle>
                </div>
                <CardDescription>
                  Nhập địa chỉ email của bạn để nhận mã OTP xác thực
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập địa chỉ email của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
                  </Button>
                </form>

                <div className="flex justify-center mt-6 text-sm">
                  Nhớ mật khẩu?&nbsp;
                  <Link
                    href="/login"
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-[5_5_0%]">
            <h2 className="text-2xl font-bold mb-4">
              Lấy lại mật khẩu một cách nhanh chóng và an toàn
            </h2>
            <ul className="text-base font-normal space-y-4">
              <li className="flex">
                <CheckIcon color="#dc2626" width={25} height={25} />
                <span className="ml-2">
                  Nhận mã OTP xác thực qua email trong vài phút
                </span>
              </li>
              <li className="flex">
                <CheckIcon color="#dc2626" width={25} height={25} />
                <span className="ml-2">
                  Bảo mật cao với mã xác thực được mã hóa
                </span>
              </li>
              <li className="flex">
                <CheckIcon color="#dc2626" width={25} height={25} />
                <span className="ml-2">
                  Dễ dàng tạo mật khẩu mới và truy cập lại hệ thống
                </span>
              </li>
              <li className="flex">
                <CheckIcon color="#dc2626" width={25} height={25} />
                <span className="ml-2">
                  Hỗ trợ 24/7 nếu gặp vấn đề trong quá trình lấy lại mật khẩu
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
