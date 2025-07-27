import z from "zod";

export const RegisterBody = z
  .object({
    name: z.string({ required_error: "Required information" }).trim().max(256),
    email: z
      .string({ required_error: "Required information" })
      .trim()
      .email("Email không đúng định dạng")
      .max(256),
    password: z
      .string({ required_error: "Required information" })
      .min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      })
      .max(30),
    // confirmPassword: z.string().min(6).max(30),
    phone_number: z
    .string({ required_error: "Số điện thoại là bắt buộc" })
    .trim()
    .regex(
      /^(0|\+84)(3[2-9]|5[2689]|7[06789]|8[1-9]|9[0-9])[0-9]{7}$/,
      "Số điện thoại không hợp lệ (VD: 0987654321 hoặc +84987654321)"
    )
    .transform((val) => val.replace(/^0/, "+84")), // Chuyển đầu số 0 thành +84
  })
  .strict();
// .superRefine(({ confirmPassword, password }, ctx) => {
//   if (confirmPassword !== password) {
//     ctx.addIssue({
//       code: "custom",
//       message: "Mật khẩu không khớp",
//       path: ["confirmPassword"],
//     });
//   }
// });

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>;

export const RegisterRes = z.object({});

export type RegisterResType = z.TypeOf<typeof RegisterRes>;

export const LoginBody = z
  .object({
    email: z
      .string({ required_error: "Required information" })
      .trim()
      .email("Email không đúng định dạng")
      .max(256),
    password: z
      .string({ required_error: "Required information" })
      .min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      })
      .max(30),
  })
  .strict();

export type LoginBodyType = z.TypeOf<typeof LoginBody>;

export const LoginRes = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.string(),
    image: z.string(),
    phone_number: z.string()
  }),
  access_token: z.string()
});

export type LoginResType = z.TypeOf<typeof LoginRes>;
