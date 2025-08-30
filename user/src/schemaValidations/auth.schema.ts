import z from "zod";

export const RegisterBody = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: "Thông tin bắt buộc",
      })
      .max(256),
    email: z
      .string()
      .trim()
      .min(1, {
        message: "Thông tin bắt buộc",
      })
      .email("Email không đúng định dạng")
      .max(256),
    mobileNumber: z
      .string()
      .trim()
      .min(1, {
        message: "Thông tin bắt buộc",
      })
      .regex(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/, {
        message: "Số điện thoại không đúng định dạng",
      }),
  })
  .strict();

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>;

export const RegisterRes = z.object({});

export type RegisterResType = z.TypeOf<typeof RegisterRes>;

export const LoginBody = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, {
        message: "Thông tin bắt buộc",
      })
      .email("Email không đúng định dạng")
      .max(256),
    password: z
      .string()
      .min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      })
      .max(30)
      .nonempty({ message: "Thông tin bắt buộc" }),
  })
  .strict();

export type LoginBodyType = z.TypeOf<typeof LoginBody>;

export const LoginRes = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
    role: z.string(),
    noPassword: z.boolean(),
  }),
  access_token: z.string(),
  refresh_token: z.string(),
});

export type LoginResType = z.TypeOf<typeof LoginRes>;

export const RefreshTokenRes = z.object({
  token: z.string(),
  refresh_token: z.string(),
});

export type RefreshTokenResType = z.TypeOf<typeof RefreshTokenRes>;
