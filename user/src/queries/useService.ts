import { useQuery } from "@tanstack/react-query";
import serviceApiRequest from "@/apiRequests/service";

export function useGetServiceByVenueId(venueId: number) {
  return useQuery({
    queryKey: ["getServiceByVenueId", venueId],
    queryFn: () => serviceApiRequest.sGetCategoryByVenueId(venueId),
    enabled: venueId > 0,
  });
}
