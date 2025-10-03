import envConfig from "@/config";
import { Booking } from "@/types/booking";
import http from "@/utils/api";

const bookingApiRequest = {
  sGetBookingList: () =>
    http.get<IBackendRes<Booking>>("/bookings/list", {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),
};

export default bookingApiRequest;
