import categoryApiRequest from "@/apiRequests/category";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export interface UpdateCategoryBodyType {
  name: string;
}

export interface CreateCategoryBodyType {
  name: string;
  venueId: number;
}

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      body,
    }: {
      categoryId: number;
      body: UpdateCategoryBodyType;
    }) => categoryApiRequest.sUpdateCategory(categoryId, body),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Cập nhật danh mục thành công",
      });

      // Invalidate and refetch venue detail to reflect category changes
      queryClient.invalidateQueries({
        queryKey: ["venues", "detail", variables.categoryId],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error?.payload?.message ?? "Có lỗi xảy ra khi cập nhật danh mục",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) =>
      categoryApiRequest.sDeleteCategory(categoryId),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Xóa danh mục thành công",
      });

      // Invalidate and refetch venue detail to reflect category changes
      queryClient.invalidateQueries({
        queryKey: ["venues"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error?.payload?.message ?? "Có lỗi xảy ra khi xóa danh mục",
        variant: "destructive",
      });
    },
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCategoryBodyType) =>
      categoryApiRequest.sCreateCategory(body),
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: "Tạo danh mục thành công",
      });

      // Invalidate and refetch venue detail to reflect category changes
      queryClient.invalidateQueries({
        queryKey: ["venues"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error?.payload?.message ?? "Có lỗi xảy ra khi tạo danh mục",
        variant: "destructive",
      });
    },
  });
};
