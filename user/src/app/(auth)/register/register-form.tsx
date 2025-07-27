"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  RegisterBody,
  RegisterBodyType,
} from "@/schemaValidations/auth.schema";
import authApiRequest from "@/apiRequests/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

const RegisterForm = () => {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  const form = useForm<RegisterBodyType>({
    resolver: zodResolver(RegisterBody),
    mode: "all",
    defaultValues: {
      name: "Hoàng Tuấn Anh",
      email: "user@gmail.com",
      password: "12345678",
      phone_number: "0987654321",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: RegisterBodyType) {
    const resRegister = await authApiRequest.sRegister(values);

    if (resRegister.status === 201) {
      // form.reset();
      router.push(`/verify?email=${values.email}`);
    } else if (resRegister.status === 409) {
      form.setError("email", {
        type: "invalid",
        message: "Email đã được đăng ký",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 flex-shrink-0 w-full"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Họ và Tên <abbr className="text-red-600">*</abbr>
              </FormLabel>
              <FormControl>
                <Input className="h-11" placeholder="Họ và Tên" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email <abbr className="text-red-600">*</abbr>
              </FormLabel>
              <FormControl>
                <Input
                  className="h-11"
                  placeholder="Email"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mật khẩu <abbr className="text-red-600">*</abbr>
              </FormLabel>

              <FormControl>
                <Input
                  className="h-11"
                  placeholder="Mật khẩu"
                  type="password"
                  {...field}
                />
                {/* <PasswordInput/> */}
                {/* <PasswordInput
                  id="password_confirmation"
                  // value={passwordConfirmation}
                  // onChange={(e) => setPasswordConfirmation(e.target.value)}
                  autoComplete="new-password"
                /> */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Số điện thoại <abbr className="text-red-600">*</abbr>
              </FormLabel>
              <FormControl>
                <Input
                  className="h-11"
                  placeholder="Ví dụ: 0987654321 hoặc +84987654321"
                  type="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className={"!mt-8 w-full h-11 bg-[green] hover:bg-[#006400] text-[16px]"}
        >
          Đăng ký
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
