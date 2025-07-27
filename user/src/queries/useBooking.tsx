import { useQuery } from "@tanstack/react-query";
import bookingApiRequest from "@/apiRequests/booking";

export const useGetListBooking = () => {
  return useQuery({
    queryKey: ["getListBooking"],
    queryFn: () => bookingApiRequest.sGetBookingList(),
    staleTime: 10 * 1000,
  });
};
