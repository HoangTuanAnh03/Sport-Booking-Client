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

export const useGetVenueNearHome = (lat?: number, lng?: number) => {
  return useQuery({
    queryKey: ["getVenueNearHome", lat, lng],
    queryFn: () => venueApiRequest.sGetVenueNearHome(lat, lng),
    staleTime: 10 * 1000,
  });
};

export const useGetDirection = (
  destination: [number, number],
  origin?: [number, number],
  vehicle?: string
) => {
  return useMutation({
    mutationKey: ["getDirection", destination, origin, vehicle],
    mutationFn: () =>
      venueApiRequest.sGetDirection(destination, origin, vehicle),
  });
};
