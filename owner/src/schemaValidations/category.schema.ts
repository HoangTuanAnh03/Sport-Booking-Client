import z from "zod";

export const UpdateCategoryBody = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
});

export const CreateCategoryBody = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  venueId: z.number().min(1, "Mã địa điểm không hợp lệ"),
});

export type UpdateCategoryBodyType = z.TypeOf<typeof UpdateCategoryBody>;
export type CreateCategoryBodyType = z.TypeOf<typeof CreateCategoryBody>;
