import paymentApiRequest from "@/apiRequests/payment";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreatePaymentRequest } from "@/types/payment";
import { toast } from "@/hooks/use-toast";

export const useGetOwnerVenuePaymentsQuery = () => {
  return useQuery({
    queryKey: ["payment", "owner", "venues"],
    queryFn: async () => {
      const response = await paymentApiRequest.sGetOwnerVenuePayments();
      return response.payload?.data;
    },
  });
};

export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (body: CreatePaymentRequest) => paymentApiRequest.sCreatePayment(body),
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: "Đang chuyển hướng đến trang thanh toán...",
      });
      
      // Invalidate payment queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["payment", "history"] });
      queryClient.invalidateQueries({ queryKey: ["payment", "owner", "venues"] });
      
      // Redirect to payment URL if available
      if (data?.payload?.data) {
        window.location.href = data.payload.data;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.payload?.message ?? "Có lỗi xảy ra khi tạo thanh toán",
        variant: "destructive",
      });
    },
  });
};

export const useGetPaymentHistoryQuery = (pageNo: number = 0, pageSize: number = 10) => {
  return useQuery({
    queryKey: ["payment", "history", pageNo, pageSize],
    queryFn: async () => {
      const response = await paymentApiRequest.sGetPaymentHistory(pageNo, pageSize);
      return response.payload;
    },
  });
};

export const useCancelPaymentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderCode: string) => paymentApiRequest.sCancelPayment(orderCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment", "owner", "venues"] });
        },
    });
};
