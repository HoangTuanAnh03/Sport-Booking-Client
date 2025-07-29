import venueApiRequest from "@/apiRequests/venue";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetVenueForMap = () => {
  return useQuery({
    queryKey: ["getVenueForMap"],
    queryFn: () => venueApiRequest.sGetAllForMap(),
    staleTime: 10 * 1000,
  });
};

export const useGetVenueDetail = (id: number) => {
  return useQuery({
    queryKey: ["getVenueDetail", id],
    queryFn: () => venueApiRequest.sGetVenueDetail(id),
    staleTime: 10 * 1000,
  });
};

export const useVenues = (options?: {
  pageNo?: number;
  pageSize?: number;
  lng?: number;
  lat?: number;
  name?: string;
  types?: number[];
  maxDistance?: number;
}) => {
  return useQuery({
    queryKey: ["getVenueNearHome", options],
    queryFn: () => venueApiRequest.useVenues(options),
    staleTime: 10 * 1000,
  });
};
