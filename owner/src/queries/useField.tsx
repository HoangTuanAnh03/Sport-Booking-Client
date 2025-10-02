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
        title: "ThÃ nh cÃ´ng",
        description: "Táº¡o cá»¥m sÃ¢n thÃ nh cÃ´ng",
      });

      // Invalidate and refetch fields list
      queryClient.invalidateQueries({
        queryKey: ["fields"],
      });

      return data;
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
        title: "ThÃ nh cÃ´ng",
        description: "Cáº­p nháº­t cá»¥m sÃ¢n thÃ nh cÃ´ng",
      });

      // Invalidate and refetch fields list
      queryClient.invalidateQueries({
        queryKey: ["fields"],
      });

      return data;
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
        title: "ThÃ nh cÃ´ng",
        description: "Cáº­p nháº­t sÃ¢n con thÃ nh cÃ´ng",
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
        title: "ThÃ nh cÃ´ng",
        description: "XÃ³a sÃ¢n con thÃ nh cÃ´ng",
      });

      // Invalidate and refetch fields list
      queryClient.invalidateQueries({
        queryKey: ["fields"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lá»—i",
        description:
          error?.payload?.message ?? "CÃ³ lá»—i xáº£y ra khi xÃ³a sÃ¢n con",
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
        title: "ThÃ nh cÃ´ng",
        description: "Táº¡o sÃ¢n con thÃ nh cÃ´ng",
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
        title: "ThÃ nh cÃ´ng",
        description: "XÃ³a cá»¥m sÃ¢n thÃ nh cÃ´ng",
      });

      // Invalidate and refetch fields list
      queryClient.invalidateQueries({
        queryKey: ["fields"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lá»—i",
        description:
          error?.payload?.message ?? "CÃ³ lá»—i xáº£y ra khi xÃ³a cá»¥m sÃ¢n",
        variant: "destructive",
      });
    },
  });
};

export const useGetCourtSlotsByFieldId = (id?: string, date?: string) => {
  return useQuery({
    queryKey: ["getCourtSlotsByFieldId", id, date],
    queryFn: () => fieldApiRequest.sGetCourtSlotsByFieldId(id!, date),
    enabled: !!id,
    staleTime: 10 * 1000,
  });
};

export const useMergeCourtSlotsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      date: string;
      fieldId: number;
      court: {
        id: number;
        timeSlot: {
          id: number;
          startTime: { hour: number; minute: number; second: number };
          endTime: { hour: number; minute: number; second: number };
        }[];
      }[];
    }) => fieldApiRequest.sMergeCourtSlots(params),
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
        description:
          error?.payload?.message ?? "Có lỗi xảy ra khi gộp khung giờ",
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
