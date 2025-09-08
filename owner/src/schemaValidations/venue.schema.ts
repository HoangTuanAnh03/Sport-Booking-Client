import z from "zod";

export const UpdateVenueBody = z.object({
  name: z.string().min(1, "Tên địa điểm không được để trống"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, {
      message: "Thông tin bắt buộc",
    })
    .regex(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/, {
      message: "Số điện thoại không đúng định dạng",
    }),
  bankName: z.string().min(1, "Tên ngân hàng không được để trống"),
  bankNumber: z.string().min(1, "Số tài khoản không được để trống"),
  bankHolderName: z.string().min(1, "Chủ tài khoản không được để trống"),
});

export const UpdateVenueStatusBody = z.object({
  id: z.number().min(1, "ID địa điểm không hợp lệ"),
  status: z.enum(
    ["PENDING", "REJECTED", "ENABLE", "UNABLE", "LOCK", "UNPAID", "DELETED"],
    {
      errorMap: () => ({ message: "Trạng thái không hợp lệ" }),
    }
  ),
});

export type UpdateVenueBodyType = z.TypeOf<typeof UpdateVenueBody>;
export type UpdateVenueStatusBodyType = z.TypeOf<typeof UpdateVenueStatusBody>;
