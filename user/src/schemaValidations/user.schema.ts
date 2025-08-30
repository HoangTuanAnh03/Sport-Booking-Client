import z from "zod";

export const ForgotPasswordBody = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, {
        message: "Thông tin bắt buộc",
      })
      .email("Email không đúng định dạng")
      .max(256),
  })
  .strict();

export type ForgotPasswordBodyType = z.TypeOf<typeof ForgotPasswordBody>;

export const VerifyOtpBody = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, {
        message: "Thông tin bắt buộc",
      })
      .email("Email không đúng định dạng")
      .max(256),
    otp: z
      .number()
      .min(1, {
        message: "Thông tin bắt buộc",
      })
      .max(256),
    newPassword: z
      .string({})
      .nonempty({ message: "Thông tin bắt buộc" })
      .min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      })
      .max(30),
  })
  .strict();

export type VerifyOtpBodyType = z.TypeOf<typeof VerifyOtpBody>;

export const EditPasswordBody = z
  .object({
    password: z
      .string({})
      .nonempty({ message: "Thông tin bắt buộc" })
      .min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      })
      .max(30),
    confirmPassword: z
      .string()
      .nonempty({ message: "Thông tin bắt buộc" })
      .min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      })
      .max(30),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu xác nhận không giống Mật khẩu mới",
        path: ["confirmPassword"],
      });
    }
  });

export type EditPasswordBodyType = z.TypeOf<typeof EditPasswordBody>;

export type NewPasswordReq = {
  code: string;
  password: string;
};

export const UpdateUserBody = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: "Tên là thông tin bắt buộc",
      })
      .max(100, {
        message: "Tên không được vượt quá 100 ký tự",
      }),
    phoneNumber: z
      .string()
      .trim()
      .min(1, {
        message: "Số điện thoại là thông tin bắt buộc",
      })
      .regex(/^[0-9+\-\s()]+$/, {
        message: "Số điện thoại không đúng định dạng",
      })
      .max(20, {
        message: "Số điện thoại không được vượt quá 20 ký tự",
      }),
    avatarUrl: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => {
          if (!value || value === "") return true;
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        {
          message: "URL ảnh đại diện không đúng định dạng",
        }
      ),
  })
  .strict();

export type UpdateUserBodyType = z.TypeOf<typeof UpdateUserBody>;

export const ChangePasswordBody = z
  .object({
    oldPassword: z
      .string()
      .nonempty({ message: "Mật khẩu hiện tại là thông tin bắt buộc" })
      .min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      })
      .max(30),
    newPassword: z
      .string()
      .nonempty({ message: "Mật khẩu mới là thông tin bắt buộc" })
      .min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      })
      .max(30),
    confirmPassword: z
      .string()
      .nonempty({ message: "Xác nhận mật khẩu là thông tin bắt buộc" })
      .min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      })
      .max(30),
  })
  .strict()
  .superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu xác nhận không giống Mật khẩu mới",
        path: ["confirmPassword"],
      });
    }
  });

export type ChangePasswordBodyType = z.TypeOf<typeof ChangePasswordBody>;
