import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import bookingApiRequest from "@/apiRequests/booking";
import venueApiRequest from "@/apiRequests/venue";

export const useGetListBooking = () => {
  return useQuery({
    queryKey: ["getListBooking"],
    queryFn: () => bookingApiRequest.sGetBookingList(),
    staleTime: 0, // Data is always considered stale
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    gcTime: 0, // Don't cache data after query becomes inactive (was cacheTime in older versions)
  });
};

// mutation
export const useHoldBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["holdBooking"],
    mutationFn: bookingApiRequest.sHoldBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) =>
          ["getCourtSlotsByFieldId", "getListBooking"].includes(
            String(q.queryKey[0])
          ),
      });
    },
  });
};

export const useConfirmBooking = () => {
  const queryClient = useQueryClient();
  queryClient.refetchQueries({
    predicate: (q) =>
      ["getCourtSlotsByFieldId", "getListBooking"].includes(
        String(q.queryKey[0])
      ),
  });
  return useMutation({
    mutationKey: ["confirmBooking"],
    mutationFn: bookingApiRequest.sConfirmBooking,
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  queryClient.refetchQueries({
    predicate: (q) =>
      ["getCourtSlotsByFieldId", "getListBooking"].includes(
        String(q.queryKey[0])
      ),
  });
  return useMutation({
    mutationKey: ["cancelBooking"],
    mutationFn: bookingApiRequest.sCancelBooking,
  });
};

export const useGetBookingById = (bookingId: string) => {
  return useQuery({
    queryKey: ["getBookingById", bookingId],
    queryFn: () => bookingApiRequest.sGetBookingById(bookingId),
    staleTime: 0, // Data is always considered stale
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    gcTime: 0, // Don't cache data after query becomes inactive (was cacheTime in older versions)
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationKey: ["uploadImage"],
    mutationFn: venueApiRequest.sUploadImage,
  });
};
