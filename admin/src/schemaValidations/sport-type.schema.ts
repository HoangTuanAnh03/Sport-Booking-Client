import { z } from "zod";

export const CreateSportTypeBody = z.object({
  name: z.string().min(1, "Tên môn thể thao không được để trống"),
  description: z.string().optional(),
  venuePrice: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
});

export const UpdateSportTypeBody = z.object({
  name: z.string().min(1, "Tên môn thể thao không được để trống"),
  description: z.string().optional(),
  venuePrice: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
});

export const SportTypeParamsSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().positive("ID phải là số dương")),
});

export type CreateSportTypeBodyType = z.infer<typeof CreateSportTypeBody>;
export type UpdateSportTypeBodyType = z.infer<typeof UpdateSportTypeBody>;
export type SportTypeParamsType = z.infer<typeof SportTypeParamsSchema>;
