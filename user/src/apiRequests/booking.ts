import envConfig from "@/config";
import { ConfirmBookingRequest, CreateBookingRequest } from "@/types/booking";
import http from "@/utils/api";

const bookingApiRequest = {
  // sGetBookingList: () =>
  //   http.get<IBackendRes<Booking>>("/booking/list", {
  //     baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
  //   }),

  sHoldBooking: (payload: CreateBookingRequest) =>
    http.post<IBackendRes<string>>("/booking/hold", payload, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),

  sConfirmBooking: (payload: ConfirmBookingRequest) =>
    http.post<IBackendRes<any>>("/booking/confirm", payload, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),

  sCancelBooking: (bookingId: string) =>
    http.post<IBackendRes<any>>(
      `/booking/cancel/${bookingId}`,
      {},
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
      }
    ),
};

export default bookingApiRequest;
