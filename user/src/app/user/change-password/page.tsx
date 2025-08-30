"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useChangePasswordMutation } from "@/queries/useUser";
import {
  ChangePasswordBody,
  ChangePasswordBodyType,
} from "@/schemaValidations/user.schema";

export default function ChangePasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const changePasswordMutation = useChangePasswordMutation();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordBodyType) => {
    try {
      // Only send oldPassword and newPassword to API
      const { oldPassword, newPassword } = data;
      const res = await changePasswordMutation.mutateAsync({
        oldPassword,
        newPassword,
      });

      if (res.status === 200) {
        toast({
          title: "Thành công",
          description: "Mật khẩu đã được thay đổi thành công",
        });
        // router.push("/");
      } else {
        toast({
          title: "Lỗi",
          description: "Mật khẩu cũ không chính xác",
          variant: "destructive",
        });
      }
      form.reset();
      // router.push("/user/profile");
    } catch (error: any) {
      console.error("Change password error:", error);

      // Handle specific error messages from API
      if (error.payload?.message) {
        toast({
          title: "Lỗi",
          description: error.payload.message,
          variant: "destructive",
        });
      } else if (error.message) {
        toast({
          title: "Lỗi",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra khi thay đổi mật khẩu",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Đổi mật khẩu</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Thay đổi mật khẩu
          </CardTitle>
          <CardDescription>
            Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để bảo mật tài khoản
            của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Password */}
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Mật khẩu hiện tại
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showOldPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu hiện tại"
                          className="pr-10"
                          disabled={changePasswordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          disabled={changePasswordMutation.isPending}
                        >
                          {showOldPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Mật khẩu mới
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                          className="pr-10"
                          disabled={changePasswordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={changePasswordMutation.isPending}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Xác nhận mật khẩu mới
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu mới"
                          className="pr-10"
                          disabled={changePasswordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={changePasswordMutation.isPending}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Security Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  Gợi ý tạo mật khẩu mạnh:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sử dụng ít nhất 8 ký tự</li>
                  <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                  <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
                  <li>• Không sử dụng mật khẩu đã dùng ở nơi khác</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    changePasswordMutation.isPending || !form.formState.isValid
                  }
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang thay đổi...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Đổi mật khẩu
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={changePasswordMutation.isPending}
                >
                  Hủy bỏ
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
