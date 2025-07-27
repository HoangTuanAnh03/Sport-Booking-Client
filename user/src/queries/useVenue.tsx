import venueApiRequest from "@/apiRequests/venue";
import { useQuery } from "@tanstack/react-query";

export const useGetVenueForMap = () => {
  return useQuery({
    queryKey: ["getVenueForMap"],
    queryFn: () => venueApiRequest.sGetAllForMap(),
    staleTime: 10 * 1000,
  });
};

export const useGetVenueDetail = (id: string) => {
  return useQuery({
    queryKey: ["getVenueDetail", id],
    queryFn: () => venueApiRequest.sGetVenueDetail(id),
    staleTime: 10 * 1000,
  });
};

export const useGetVenueNearHome = (lat?: number, lng?: number) => {
  return useQuery({
    queryKey: ["getVenueNearHome", lat, lng],
    queryFn: () => venueApiRequest.sGetVenueNearHome(lat, lng),
    staleTime: 10 * 1000,
  });
};
