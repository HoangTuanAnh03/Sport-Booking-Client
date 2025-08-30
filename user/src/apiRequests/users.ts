import http from "@/utils/api";
import {
  ForgotPasswordBodyType,
  VerifyOtpBodyType,
  UpdateUserBodyType,
} from "@/schemaValidations/user.schema";
import { User } from "@/types/user";

const userApiRequest = {
  sMyInfo: () =>
    http.get<IBackendRes<User>>("/users/my-info", {
      baseUrl: "http://localhost:8080",
    }),
  sUpdateUser: (body: UpdateUserBodyType) =>
    http.put<IBackendRes<User>>("/users", body, {
      baseUrl: "http://localhost:8080",
    }),

  sForgotPassword: (body: ForgotPasswordBodyType) =>
    http.post<IBackendRes<any>>("/users/forgot-password", body, {
      baseUrl: "http://localhost:8080",
    }),
  sVerifyOtp: (body: VerifyOtpBodyType) =>
    http.post<IBackendRes<any>>("/users/verify-otp", body, {
      baseUrl: "http://localhost:8080",
    }),
  sChangePassword: (body: { oldPassword: string; newPassword: string }) =>
    http.post<IBackendRes<string>>("/users/change-password", body, {
      baseUrl: "http://localhost:8080",
    }),
};

export default userApiRequest;
