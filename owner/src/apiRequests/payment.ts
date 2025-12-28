import http from "@/utils/api";
import { VenuePayment, CreatePaymentRequest, CreatePaymentResponse, PaymentHistory } from "@/types/payment";
import envConfig from "@/config";

const paymentApiRequest = {
  sGetOwnerVenuePayments: () =>
    http.get<IBackendRes<VenuePayment[]>>("/payment/owner/venues", {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888",
    }),
  sCreatePayment: (body: CreatePaymentRequest) =>
    http.post<IBackendRes<string>>("/payment/create", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888",
    }),
  sGetPaymentHistory: (pageNo: number = 0, pageSize: number = 10) =>
    http.get<PagingResponse<PaymentHistory>>(
      `/payment/history/me?pageNo=${pageNo}&pageSize=${pageSize}`,
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888",
      }
    ),
  sCancelPayment: (orderCode: string) =>
    http.post<IBackendRes<null>>(`/payment/cancel/${orderCode}`, {}, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888",
    }),
};

export default paymentApiRequest;
