import http from "@/utils/api";
import { PaymentHistory } from "@/types/payment";
import envConfig from "@/config";

const paymentApiRequest = {
  sGetAdminPaymentHistory: (params: {
    month?: number;
    year?: number;
    pageNo?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
    search?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.month) queryParams.append("month", params.month.toString());
    if (params.year) queryParams.append("year", params.year.toString());
    if (params.pageNo !== undefined) queryParams.append("pageNo", params.pageNo.toString());
    if (params.pageSize !== undefined) queryParams.append("pageSize", params.pageSize.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortDir) queryParams.append("sortDir", params.sortDir);
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/payment/admin/history?${queryString}` : "/payment/admin/history";

    return http.get<PagingResponse<PaymentHistory>>(url, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT,
    });
  },
};

export default paymentApiRequest;
