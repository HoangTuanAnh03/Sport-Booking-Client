import z from "zod";

export const CreateServiceBody = z.object({
  name: z.string().min(1, "Tên dịch vụ không được để trống"),
  price: z.number().min(0, "Giá dịch vụ phải lớn hơn hoặc bằng 0"),
  units: z.string().min(1, "Đơn vị không được để trống"),
  isAvailable: z.boolean(),
  categoryId: z.number().min(1, "ID danh mục không hợp lệ"),
});

export const UpdateServiceBody = z.object({
  name: z.string().min(1, "Tên dịch vụ không được để trống"),
  price: z.number().min(0, "Giá dịch vụ phải lớn hơn hoặc bằng 0"),
  units: z.string().min(1, "Đơn vị không được để trống"),
  isAvailable: z.boolean(),
  categoryId: z.number().min(1, "ID danh mục không hợp lệ"),
});

export type CreateServiceBodyType = z.TypeOf<typeof CreateServiceBody>;
export type UpdateServiceBodyType = z.TypeOf<typeof UpdateServiceBody>;
