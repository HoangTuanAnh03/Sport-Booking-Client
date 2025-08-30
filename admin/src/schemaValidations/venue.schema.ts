import { z } from "zod";

export const CreateVenueBody = z.object({
  name: z
    .string()
    .min(1, "Tên địa điểm không được để trống")
    .max(255, "Tên địa điểm không được vượt quá 255 ký tự"),
  address: z
    .string()
    .min(1, "Địa chỉ không được để trống")
    .max(500, "Địa chỉ không được vượt quá 500 ký tự"),
  phoneNumber: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .regex(/^[0-9]{10,15}$/, "Số điện thoại phải từ 10-15 chữ số"),
  bankName: z
    .string()
    .min(1, "Tên ngân hàng không được để trống")
    .max(100, "Tên ngân hàng không được vượt quá 100 ký tự"),
  bankNumber: z
    .string()
    .min(1, "Số tài khoản ngân hàng không được để trống")
    .max(50, "Số tài khoản ngân hàng không được vượt quá 50 ký tự"),
  bankHolderName: z
    .string()
    .min(1, "Tên chủ tài khoản không được để trống")
    .max(100, "Tên chủ tài khoản không được vượt quá 100 ký tự"),
});

export const UpdateVenueBody = z.object({
  name: z
    .string()
    .min(1, "Tên địa điểm không được để trống")
    .max(255, "Tên địa điểm không được vượt quá 255 ký tự"),
  address: z
    .string()
    .min(1, "Địa chỉ không được để trống")
    .max(500, "Địa chỉ không được vượt quá 500 ký tự"),
  phoneNumber: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .regex(/^[0-9]{10,15}$/, "Số điện thoại phải từ 10-15 chữ số"),
  bankName: z
    .string()
    .min(1, "Tên ngân hàng không được để trống")
    .max(100, "Tên ngân hàng không được vượt quá 100 ký tự"),
  bankNumber: z
    .string()
    .min(1, "Số tài khoản ngân hàng không được để trống")
    .max(50, "Số tài khoản ngân hàng không được vượt quá 50 ký tự"),
  bankHolderName: z
    .string()
    .min(1, "Tên chủ tài khoản không được để trống")
    .max(100, "Tên chủ tài khoản không được vượt quá 100 ký tự"),
});

export const UpdateVenueStatusBody = z.object({
  id: z.number().positive("ID phải là số dương"),
  status: z.enum(
    ["PENDING", "ENABLE", "UNABLE", "LOCK", "UNPAID", "DELETED", "REJECTED"],
    {
      errorMap: () => ({ message: "Trạng thái không hợp lệ" }),
    }
  ),
});

export const VenueParamsSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().positive("ID phải là số dương")),
});

export const VenueAdminSearchSchema = z.object({
  pageNo: z.number().min(0, "Số trang phải >= 0").optional(),
  pageSize: z.number().min(1, "Kích thước trang phải >= 1").optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["ASC", "DESC", "asc", "desc"]).optional(),
  search: z.string().optional(),
  types: z.array(z.number()).optional(),
  isPaid: z.boolean().optional(),
  status: z
    .enum([
      "PENDING",
      "ENABLE",
      "UNABLE",
      "LOCK",
      "UNPAID",
      "DELETED",
      "REJECTED",
    ])
    .optional(),
});

export type CreateVenueBodyType = z.infer<typeof CreateVenueBody>;
export type UpdateVenueBodyType = z.infer<typeof UpdateVenueBody>;
export type UpdateVenueStatusBodyType = z.infer<typeof UpdateVenueStatusBody>;
export type VenueParamsType = z.infer<typeof VenueParamsSchema>;
export type VenueAdminSearchType = z.infer<typeof VenueAdminSearchSchema>;
