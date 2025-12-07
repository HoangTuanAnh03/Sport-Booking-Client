import bookingApiRequest from "@/apiRequests/booking";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export const useGetListBookingQuery = (params?: {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
  search?: string;
  status?: string;
  venueId?: number;
  fieldId?: number;
  date?: string;
}) => {
  return useQuery({
    queryKey: ["bookings", "list", params],
    queryFn: async () => {
      const response = await bookingApiRequest.sGetListBooking(params);
      return response.payload;
    },
  });
};

export const useGetBookingByIdQuery = (bookingId: string | null) => {
  return useQuery({
    queryKey: ["bookings", "detail", bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      const response = await bookingApiRequest.sGetBookingById(bookingId);
      return response.payload?.data;
    },
    enabled: !!bookingId,
  });
};

export const useConfirmBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingApiRequest.sConfirm(bookingId),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Xác nhận booking thành công",
      });

      // Invalidate and refetch bookings list
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error?.payload?.message ?? "Có lỗi xảy ra khi xác nhận booking",
        variant: "destructive",
      });
    },
  });
};

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingApiRequest.sCancel(bookingId),
    onSuccess: (data, variables) => {
      toast({
        title: "Thành công",
        description: "Hủy booking thành công",
      });

      // Invalidate and refetch bookings list
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi hủy booking",
        variant: "destructive",
      });
    },
  });
};
