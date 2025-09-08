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
import {
  CheckIcon,
  ArrowLeftIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import userApiRequest from "@/apiRequests/users";

const resetPasswordSchema = z
  .object({
    otp: z.string().min(6, "Mã OTP phải có ít nhất 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z
      .string()
      .min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export default function VerifyOTPClient() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = resetPasswordSchema.parse({
        otp,
        newPassword,
        confirmPassword,
      });

      // Call the actual API
      const response = await userApiRequest.sVerifyOtp({
        email,
        otp: parseInt(validatedData.otp),
        newPassword: validatedData.newPassword,
      });

      if (response.status === 500) {
        toast({
          variant: "destructive",
          title: "Mã OTP không hợp lệ",
          description: "Mã OTP không hợp lệ hoặc đã quá thời gian!",
        });
        return;
      }
      if (response.status === 429) {
        toast({
          variant: "destructive",
          title: "Thử quá nhiều lần",
          description:
            "Bạn đã quá 5 lần nhập mã OTP. Hãy gửi lại mã OTP mới để thử lại.",
        });
      }

      setIsSuccess(true);
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: {
          otp?: string;
          newPassword?: string;
          confirmPassword?: string;
        } = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          fieldErrors[field as keyof typeof fieldErrors] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        toast({
          variant: "destructive",
          title: "Có lỗi xảy ra",
          description: "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      // TODO: Replace with actual API call
      const res = await userApiRequest.sForgotPassword({
        email: email,
      });

      if (res.payload?.code === 429) {
        toast({
          variant: "destructive",
          title: "Thao tác quá nhiều",
          description:
            "Bạn đã gửi yêu cầu quá nhiều. Vui lòng chờ trong 5 phút.",
        });
        return;
      }

      toast({
        title: "Đã gửi lại mã OTP",
        description: "Vui lòng kiểm tra email của bạn",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Có lỗi xảy ra",
        description: "Không thể gửi lại mã OTP",
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="flex mt-2 w-full justify-center text-[#121212] min-h-screen items-center">
        <div className="flex flex-col max-w-md w-full px-6">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                  Đặt lại mật khẩu thành công
                </h2>
                <p className="text-gray-600 mb-6">
                  Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể đăng
                  nhập với mật khẩu mới.
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Đăng nhập ngay
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                    href="/forgot-password"
                    className="text-red-600 hover:text-red-800"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </Link>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Xác thực OTP
                  </CardTitle>
                </div>
                <CardDescription>
                  Nhập mã OTP được gửi đến email{" "}
                  <strong className="text-red-600">{email}</strong> và tạo mật
                  khẩu mới
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Mã OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Nhập mã OTP 6 ký tự"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={errors.otp ? "border-red-500" : ""}
                      disabled={isSubmitting}
                      maxLength={6}
                    />
                    {errors.otp && (
                      <p className="text-sm text-red-500">{errors.otp}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={
                          errors.newPassword ? "border-red-500 pr-10" : "pr-10"
                        }
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeClosedIcon className="w-4 h-4" />
                        ) : (
                          <EyeOpenIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-red-500">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={
                          errors.confirmPassword
                            ? "border-red-500 pr-10"
                            : "pr-10"
                        }
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeClosedIcon className="w-4 h-4" />
                        ) : (
                          <EyeOpenIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                  </Button>
                </form>

                <div className="flex flex-col gap-2 mt-6 text-sm text-center">
                  <div>
                    Chưa nhận được mã OTP?{" "}
                    <button
                      onClick={handleResendOTP}
                      className="text-red-600 hover:text-red-800 font-medium underline"
                    >
                      Gửi lại
                    </button>
                  </div>
                  <div>
                    <Link
                      href="/login"
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-[5_5_0%]">
            <h2 className="text-2xl font-bold mb-4">
              Tạo mật khẩu mới an toàn và bảo mật
            </h2>
            <ul className="text-base font-normal space-y-4">
              <li className="flex">
                <CheckIcon color="#dc2626" width={25} height={25} />
                <span className="ml-2">
                  Xác thực bằng mã OTP được gửi qua email đảm bảo an toàn
                </span>
              </li>
              <li className="flex">
                <CheckIcon color="#dc2626" width={25} height={25} />
                <span className="ml-2">
                  Mật khẩu được mã hóa và bảo vệ bằng công nghệ hiện đại
                </span>
              </li>
              <li className="flex">
                <CheckIcon color="#dc2626" width={25} height={25} />
                <span className="ml-2">
                  Tạo mật khẩu mạnh với ít nhất 6 ký tự để bảo vệ tài khoản
                </span>
              </li>
              <li className="flex">
                <CheckIcon color="#dc2626" width={25} height={25} />
                <span className="ml-2">
                  Đăng nhập ngay sau khi đặt lại mật khẩu thành công
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
