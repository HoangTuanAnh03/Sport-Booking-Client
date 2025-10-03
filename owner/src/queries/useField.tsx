import fieldApiRequest from "@/apiRequests/field";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FieldOwnerResponse,
  UpdateFieldRequest,
  UpdateCourtRequest,
  CreateFieldRequest,
  CreateCourtRequest,
} from "@/types/field";
import { toast } from "@/hooks/use-toast";

export const useGetFieldsByVenueIdQuery = (venueId: number) => {
  return useQuery({
    queryKey: ["fields", "venue", venueId],
    queryFn: async () => {
      const response = await fieldApiRequest.sGetFieldsByVenueId(venueId);
      return response.payload?.data;
    },
    enabled: !!venueId,
  });
};

export const useCreateFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateFieldRequest) =>
      fieldApiRequest.sCreateField(body),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Tạo cụm sân thành công",
      });

      // Invalidate and refetch fields list
      queryClient.invalidateQueries({
        queryKey: ["fields"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi tạo cụm sân",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fieldId,
      body,
    }: {
      fieldId: number;
      body: UpdateFieldRequest;
    }) => fieldApiRequest.sUpdateField(fieldId, body),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Cập nhật cụm sân thành công",
      });

      // Invalidate and refetch fields list
      queryClient.invalidateQueries({
        queryKey: ["fields"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error?.payload?.message ?? "Có lỗi xảy ra khi cập nhật cụm sân",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCourtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courtId,
      body,
    }: {
      courtId: number;
      body: UpdateCourtRequest;
    }) => fieldApiRequest.sUpdateCourt(courtId, body),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Cập nhật sân con thành công",
      });

      // Invalidate and refetch fields list
      queryClient.invalidateQueries({
        queryKey: ["fields"],
      });

      return data;
    },
  });
};

export const useDeleteCourtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courtId: number) => fieldApiRequest.sDeleteCourt(courtId),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Xóa sân con thành công",
      });

      // Invalidate and refetch fields list
      queryClient.invalidateQueries({
        queryKey: ["fields"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi xóa sân con",
        variant: "destructive",
      });
    },
  });
};

export const useCreateCourtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCourtRequest) =>
      fieldApiRequest.sCreateCourt(body),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Tạo sân con thành công",
      });

      // Invalidate and refetch fields list
      queryClient.invalidateQueries({
        queryKey: ["fields"],
      });

      return data;
    },
  });
};

export const useDeleteFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: number) => fieldApiRequest.sDeleteField(fieldId),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Xóa cụm sân thành công",
      });

      // Invalidate and refetch fields list
      queryClient.invalidateQueries({
        queryKey: ["fields"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi xóa cụm sân",
        variant: "destructive",
      });
    },
  });
};

export const useGetCourtSlotsByFieldId = (id: string, date?: string) => {
  return useQuery({
    queryKey: ["getCourtSlotsByFieldId", id, date],
    queryFn: () => fieldApiRequest.sGetCourtSlotsByFieldId(id, date),
    staleTime: 10 * 1000,
  });
};

export const useMergeCourtSlotsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotIds: number[]) =>
      fieldApiRequest.sMergeCourtSlots(slotIds),
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: "Gộp khung giờ thành công",
      });

      // Invalidate court slots queries
      queryClient.invalidateQueries({
        queryKey: ["getCourtSlotsByFieldId"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi gộp khung giờ",
        variant: "destructive",
      });
    },
  });
};

export const useLockCourtSlotsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotIds: number[]) => fieldApiRequest.sLockCourtSlots(slotIds),
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: "Khóa khung giờ thành công",
      });

      // Invalidate court slots queries
      queryClient.invalidateQueries({
        queryKey: ["getCourtSlotsByFieldId"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error?.payload?.message ?? "Có lỗi xảy ra khi khóa khung giờ",
        variant: "destructive",
      });
    },
  });
};
