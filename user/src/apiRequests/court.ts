import http from "@/utils/api";
import { BookingRequest, PaymentInf } from "@/types/court";

const courtApiRequest = {
  sCreateBooking: (bookingRequest: BookingRequest) =>
    http.post<IBackendRes<PaymentInf>>(`/bookings`, bookingRequest),
  sConfirmBooking: (bookingId: string) =>
    http.get<IBackendRes<any>>(`/bookings/${bookingId}/confirm`),
};

export default courtApiRequest;
