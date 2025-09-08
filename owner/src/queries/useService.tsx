import serviceApiRequest from "@/apiRequests/service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  CreateServiceBodyType,
  UpdateServiceBodyType,
} from "@/schemaValidations/service.schema";

export const useCreateServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateServiceBodyType) =>
      serviceApiRequest.sCreateService(body),
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: "Dịch vụ đã được tạo thành công",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["venues"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi tạo dịch vụ",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      body,
    }: {
      serviceId: number;
      body: UpdateServiceBodyType;
    }) => serviceApiRequest.sUpdateService(serviceId, body),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Dịch vụ đã được cập nhật thành công",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["venues"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error?.payload?.message ?? "Có lỗi xảy ra khi cập nhật dịch vụ",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: number) =>
      serviceApiRequest.sDeleteService(serviceId),
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: "Dịch vụ đã được xóa thành công",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["venues"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi xóa dịch vụ",
        variant: "destructive",
      });
    },
  });
};
