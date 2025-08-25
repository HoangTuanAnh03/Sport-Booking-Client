import http from "@/utils/api";
import {
  ForgotPasswordBodyType,
  VerifyOtpBodyType,
} from "@/schemaValidations/user.schema";

const userApiRequest = {
  sForgotPassword: (body: ForgotPasswordBodyType) =>
    http.post<IBackendRes<any>>("/users/forgot-password", body, {
      baseUrl: "http://localhost:8080",
    }),
  sVerifyOtp: (body: VerifyOtpBodyType) =>
    http.post<IBackendRes<any>>("/users/verify-otp", body, {
      baseUrl: "http://localhost:8080",
    }),
};

export default userApiRequest;
