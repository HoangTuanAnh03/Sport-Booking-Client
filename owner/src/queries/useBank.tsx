import { useQuery } from "@tanstack/react-query";
import bankApiRequest from "@/apiRequests/bank";

export const useBanks = () => {
  return useQuery({
    queryKey: ["banks"],
    queryFn: bankApiRequest.getBanks,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
