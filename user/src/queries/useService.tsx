import serviceApiRequest from "@/apiRequests/service";
import { useQuery } from "@tanstack/react-query";

export const useGetServiceByVenueId = (id: number) => {
  return useQuery({
    queryKey: ["getServiceByVenueId", id],
    queryFn: () => serviceApiRequest.sGetCategoryByVenueId(id),
    staleTime: 10 * 1000,
  });
};
