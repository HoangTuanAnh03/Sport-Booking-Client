import { useMutation, useQuery } from "@tanstack/react-query";
import bookingApiRequest from "@/apiRequests/booking";

// export const useGetListBooking = () => {
//   return useQuery({
//     queryKey: ["getListBooking"],
//     queryFn: () => bookingApiRequest.sGetBookingList(),
//     staleTime: 10 * 1000,
//   });
// };

// mutation
export const useHoldBooking = () => {
  return useMutation({
    mutationKey: ["holdBooking"],
    mutationFn: bookingApiRequest.sHoldBooking,
  });
};
