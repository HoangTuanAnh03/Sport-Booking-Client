import http from "@/utils/api";
import {
  ForgotPasswordBodyType,
  VerifyOtpBodyType,
  UpdateUserBodyType,
} from "@/schemaValidations/user.schema";
import { User } from "@/types/user";
import envConfig from "@/config";

const userApiRequest = {
  sMyInfo: () =>
    http.get<IBackendRes<User>>("/users/my-info", {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),
  sUpdateUser: (body: UpdateUserBodyType) =>
    http.put<IBackendRes<User>>("/users", body, {
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
  sChangePassword: (body: { oldPassword: string; newPassword: string }) =>
    http.post<IBackendRes<string>>("/users/change-password", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),
};

export default userApiRequest;
