import { Booking } from "@/types/booking";
import http from "@/utils/api";

const bookingApiRequest = {
  sGetBookingList: () => http.get<IBackendRes<Booking>>("/bookings/list"),
};

export default bookingApiRequest;
