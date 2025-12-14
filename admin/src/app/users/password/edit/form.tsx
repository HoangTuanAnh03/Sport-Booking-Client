"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  EditPasswordBody,
  EditPasswordBodyType,
  NewPasswordReq,
} from "@/schemaValidations/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import authApiRequest from "@/apiRequests/auth";
import { toast } from "@/hooks/use-toast";
import { decodeJWT, getAccessTokenFormLocalStorage } from "@/lib/utils";
import { useRouter } from "next/navigation";

const EditForm = () => {
  const router = useRouter();
  const authCodeRegex = /code=([^&]+)/;
  const isMatch = window.location.href.match(authCodeRegex);
  const authCode = isMatch ? isMatch[1] : "";
  console.log("🚀 ~ EditForm ~ authCode:", authCode);

  if (!isMatch) {
    router.push("/login");
  }

  const form = useForm<EditPasswordBodyType>({
    resolver: zodResolver(EditPasswordBody),
    mode: "all",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: EditPasswordBodyType) {
    const body: NewPasswordReq = { code: authCode, password: values.password };

    const { payload } = await authApiRequest.verifyNewPassword(body);
    if (payload.code === 200) {
      toast({
        title: "Đổi mật khẩu thành công",
      });
      const accessToken = getAccessTokenFormLocalStorage();
      if (accessToken) {
        const role = decodeJWT(accessToken).scope;
      }
      router.push("/");
    } else {
      toast({
        variant: "destructive",
        title: "Mã code không hợp lệ",
      });
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 flex-shrink-0 w-full"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Mật khẩu mới <abbr className="text-red-600">*</abbr>
                </FormLabel>

                <FormControl>
                  <Input
                    className="h-11"
                    placeholder="Mật khẩu mới"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Xác nhận mật khẩu mới <abbr className="text-red-600">*</abbr>
                </FormLabel>

                <FormControl>
                  <Input
                    className="h-11"
                    placeholder="Xác nhận mật khẩu mới"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="!mt-8 w-full h-11 bg-[#ED1B2F] hover:bg-[#c83333] text-[16px]"
          >
            Cập nhật mật khẩu mới
          </Button>
        </form>
      </Form>
    </>
  );
};

export default EditForm;
