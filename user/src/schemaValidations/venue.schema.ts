import z from "zod";

// File upload validation
export const FileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: "Vui lòng chọn một tệp tin",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Kích thước tệp tin không được vượt quá 5MB",
    })
    .refine(
      (file) => {
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        return allowedTypes.includes(file.type);
      },
      {
        message: "Chỉ hỗ trợ các định dạng ảnh: JPEG, JPG, PNG, WEBP",
      }
    ),
});

export type FileUploadType = z.TypeOf<typeof FileUploadSchema>;

// Venue image upload specific validation
export const VenueImageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: "Vui lòng chọn một ảnh",
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "Kích thước ảnh không được vượt quá 10MB",
    })
    .refine(
      (file) => {
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        return allowedTypes.includes(file.type);
      },
      {
        message: "Chỉ hỗ trợ các định dạng ảnh: JPEG, JPG, PNG, WEBP",
      }
    )
    .refine(
      (file) => {
        // Additional validation for image dimensions if needed
        return true; // For now, accept all valid image files
      },
      {
        message: "Ảnh không hợp lệ",
      }
    ),
});

export type VenueImageUploadType = z.TypeOf<typeof VenueImageUploadSchema>;
