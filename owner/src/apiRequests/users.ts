import http from "@/utils/api";
import {
  ForgotPasswordBodyType,
  VerifyOtpBodyType,
} from "@/schemaValidations/user.schema";
import envConfig from "@/config";
import { User } from "@/types/user";

const userApiRequest = {
  sMyInfo: () =>
    http.get<IBackendRes<User>>("/users/my-info", {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),
  sForgotPassword: (body: ForgotPasswordBodyType) =>
    http.post<IBackendRes<any>>("/users/forgot-password", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),
  sVerifyOtp: (body: VerifyOtpBodyType) =>
    http.post<IBackendRes<any>>("/users/verify-otp", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),
  sGetListUser: (params?: {
    pageNo?: number;
    pageSize?: number;
    search?: string;
    sortDir?: string;
    sortBy?: string;
  }) => {
    const queryParams = new URLSearchParams();

    if (params?.pageNo !== undefined)
      queryParams.append("pageNo", params.pageNo.toString());
    if (params?.pageSize !== undefined)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortDir) queryParams.append("sortDir", params.sortDir);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

    const queryString = queryParams.toString();
    const url = queryString ? `/users?${queryString}` : "/users";

    return http.get<IModelPaginate<User>>(url, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    });
  },
};

export default userApiRequest;
