import paymentApiRequest from "@/apiRequests/payment";
import { useQuery } from "@tanstack/react-query";

export const useGetAdminPaymentHistoryQuery = (params: {
  month?: number;
  year?: number;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
  search?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["payment-history", params],
    queryFn: async () => {
      const response = await paymentApiRequest.sGetAdminPaymentHistory(params);
      return response.payload;
    },
  });
};
