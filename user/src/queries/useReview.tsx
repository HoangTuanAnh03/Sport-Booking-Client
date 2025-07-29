import reviewApiRequest from "@/apiRequests/review";
import { useQuery } from "@tanstack/react-query";

export const useGetReviewByVenueId = (id: number) => {
  return useQuery({
    queryKey: ["getReview", id],
    queryFn: () => reviewApiRequest.sGetReviewByVenueId(id),
    staleTime: 10 * 1000,
  });
};
