import venueApiRequest from "@/apiRequests/venue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateVenueBodyType } from "@/schemaValidations/venue.schema";
import { UpdateVenueStatusBodyType } from "@/schemaValidations/venue.schema";
import { toast } from "@/hooks/use-toast";

export const useGetMyVenuesQuery = () => {
  return useQuery({
    queryKey: ["venues", "me"],
    queryFn: async () => {
      const response = await venueApiRequest.sGetMyVenues();
      return response.payload?.data;
    },
  });
};

export const useGetVenueDetailQuery = (venueId: number) => {
  return useQuery({
    queryKey: ["venues", "detail", venueId],
    queryFn: async () => {
      const response = await venueApiRequest.sGetVenueDetail(venueId);
      return response.payload?.data;
    },
    enabled: !!venueId,
  });
};

export const useUpdateVenueMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      venueId,
      body,
    }: {
      venueId: number;
      body: UpdateVenueBodyType;
    }) => venueApiRequest.sUpdateVenue(venueId, body),
    onSuccess(data, variables, context) {
      toast({
        title: "Thành công",
        description: "Cập nhật tin địa điểm thành công",
      });

      // Invalidate and refetch venue detail
      queryClient.invalidateQueries({
        queryKey: ["venues", "detail", variables.venueId],
      });

      // Invalidate venues list
      queryClient.invalidateQueries({
        queryKey: ["venues", "me"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error?.payload?.message ?? "Có lỗi xảy ra khi cập nhật thông tin",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateVenueStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateVenueStatusBodyType) =>
      venueApiRequest.sUpdateVenueStatus(body),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái địa điểm thành công",
      });

      // Invalidate and refetch venue detail
      queryClient.invalidateQueries({
        queryKey: ["venues", "detail", variables.id],
      });

      // Invalidate venues list
      queryClient.invalidateQueries({
        queryKey: ["venues", "me"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error?.payload?.message ?? "Có lỗi xảy ra khi cập nhật trạng thái",
        variant: "destructive",
      });
    },
  });
};

export const useUploadVenueImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const response = await venueApiRequest.sUploadVenueImage(file);
      return response.payload; // Return the payload which contains the data
    },
    onSuccess: (payload, variables) => {
      toast({
        title: "Thành công",
        description: "Tải ảnh lên thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi tải ảnh lên",
        variant: "destructive",
      });
    },
  });
};

export const useCreateVenueImagesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      venueId,
      imageType,
      files,
    }: {
      venueId: number;
      imageType: "AVATAR" | "THUMBNAIL" | "DEFAULT";
      files: File[];
    }) => {
      const response = await venueApiRequest.sCreateVenueImages(
        venueId,
        imageType,
        files
      );
      return response.payload; // Return the payload which contains the data
    },
    onSuccess: (payload, variables) => {
      toast({
        title: "Thành công",
        description: "Tải ảnh lên thành công",
      });

      // Invalidate and refetch venue detail
      queryClient.invalidateQueries({
        queryKey: ["venues", "detail", variables.venueId],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi tải ảnh lên",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteVenueImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: number) => {
      const response = await venueApiRequest.sDeleteVenueImage(imageId);
      return response; // Return the response
    },
    onSuccess: (response, variables) => {
      toast({
        title: "Thành công",
        description: "Xóa ảnh thành công",
      });

      // Invalidate all venue queries to refetch data
      queryClient.invalidateQueries({
        queryKey: ["venues"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi xóa ảnh",
        variant: "destructive",
      });
    },
  });
};
