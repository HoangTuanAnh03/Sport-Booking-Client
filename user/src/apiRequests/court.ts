import http from "@/utils/api";
import {BookingRequest, CourtByField, PaymentInf} from "@/types/court";

const courtApiRequest = {
    sGetCourtTimeByFieldId: (id: string, date: string) => http.post<IBackendRes<CourtByField>>(`/court/getByField/${id}`, {date: date}),
    sCreateBooking: (bookingRequest: BookingRequest) => http.post<IBackendRes<PaymentInf>>(`/bookings`, bookingRequest),
    sConfirmBooking: (bookingId: string) => http.get<IBackendRes<any>>(`/bookings/${bookingId}/confirm`)
}

export default courtApiRequest;