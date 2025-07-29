import imageApiRequest from "@/apiRequests/image";
import { useQuery } from "@tanstack/react-query";

export const useGetImageByVenueId = (id: number) => {
  return useQuery({
    queryKey: ["getImage", id],
    queryFn: () => imageApiRequest.sGetAllImageByVenueId(id),
    staleTime: 10 * 1000,
  });
};
