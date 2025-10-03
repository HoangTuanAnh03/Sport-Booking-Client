import http from "@/utils/api";
import { BookingRequest, PaymentInf } from "@/types/court";
import envConfig from "@/config";

const courtApiRequest = {
  sCreateBooking: (bookingRequest: BookingRequest) =>
    http.post<IBackendRes<PaymentInf>>(`/bookings`, bookingRequest, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),
  sConfirmBooking: (bookingId: string) =>
    http.get<IBackendRes<any>>(`/bookings/${bookingId}/confirm`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),
};

export default courtApiRequest;
