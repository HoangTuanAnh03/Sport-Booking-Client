import http from "@/utils/api";
import {
  ForgotPasswordBodyType,
  VerifyOtpBodyType,
} from "@/schemaValidations/user.schema";
import envConfig from "@/config";
import { User } from "@/types/user";
import { BookingOwnerResponse } from "@/types/booking";

const bookingApiRequest = {
  sConfirm: (bookingId: string) =>
    http.post<void>(
      `/booking/owner/confirm/${bookingId}`,
      {},
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
      }
    ),
  sCancel: (bookingId: string) =>
    http.post<void>(
      `/booking/owner/cancel/${bookingId}`,
      {},
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
      }
    ),

  sGetBookingById: (bookingId: string) =>
    http.get<IBackendRes<BookingOwnerResponse>>(`/booking/${bookingId}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),

  sGetListBooking: (params?: {
    pageNo?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
    search?: string;
    status?: string;
    venueId?: number;
    fieldId?: number;
    date?: string;
  }) => {
    const queryParams = new URLSearchParams();

    if (params?.pageNo !== undefined)
      queryParams.append("pageNo", params.pageNo.toString());
    if (params?.pageSize !== undefined)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortDir) queryParams.append("sortDir", params.sortDir);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.venueId !== undefined)
      queryParams.append("venueId", params.venueId.toString());
    if (params?.fieldId !== undefined)
      queryParams.append("fieldId", params.fieldId.toString());
    if (params?.date) queryParams.append("date", params.date);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/booking/owner?${queryString}`
      : "/booking/owner";

    return http.get<PagingResponse<BookingOwnerResponse>>(url, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    });
  },
};

export default bookingApiRequest;
