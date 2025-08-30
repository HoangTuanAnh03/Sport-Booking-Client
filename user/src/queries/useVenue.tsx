import venueApiRequest from "@/apiRequests/venue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const venueKeys = {
  all: ["venues"] as const,
  map: () => [...venueKeys.all, "map"] as const,
  detail: (id: number) => [...venueKeys.all, "detail", id] as const,
  search: (options: any) => [...venueKeys.all, "search", options] as const,
};

export const useGetVenueForMap = () => {
  return useQuery({
    queryKey: venueKeys.map(),
    queryFn: () => venueApiRequest.sGetAllForMap(),
    staleTime: 10 * 1000,
  });
};

export const useGetVenueDetail = (id: number) => {
  return useQuery({
    queryKey: venueKeys.detail(id),
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
    queryKey: venueKeys.search(options),
    queryFn: () => venueApiRequest.useVenues(options),
    staleTime: 10 * 1000,
  });
};

// Upload image mutation
export const useUploadVenueImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const response = await venueApiRequest.sUploadImage(file);
      return response.payload.data!; // Assert non-null since API should return string
    },
    onSuccess: (imageUrl) => {
      // Optionally invalidate venue-related queries if needed
      // queryClient.invalidateQueries({ queryKey: venueKeys.all });
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });
};
