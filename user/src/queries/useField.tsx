import { useQuery } from "@tanstack/react-query";
import fieldApiRequest from "@/apiRequests/field";

export const useGetFieldByVenueId = (id: number) => {
  return useQuery({
    queryKey: ["getFieldByVenueId", id],
    queryFn: () => fieldApiRequest.sGetFieldByVenueId(id),
    staleTime: 10 * 1000,
  });
};
