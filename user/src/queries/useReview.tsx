import reviewApiRequest from "@/apiRequests/review";
import { useQuery } from "@tanstack/react-query";

export const useGetReview = (id: string, page: number, perPage: number) => {
  return useQuery({
    queryKey: ["getReview", id],
    queryFn: () => reviewApiRequest.sGetReview(id, page, perPage),
    staleTime: 10 * 1000,
  });
};
