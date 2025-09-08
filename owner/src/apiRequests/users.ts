import http from "@/utils/api";
import {
  ForgotPasswordBodyType,
  VerifyOtpBodyType,
} from "@/schemaValidations/user.schema";
import envConfig from "@/config";

const userApiRequest = {
  sForgotPassword: (body: ForgotPasswordBodyType) =>
    http.post<IBackendRes<any>>("/users/forgot-password", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),
  sVerifyOtp: (body: VerifyOtpBodyType) =>
    http.post<IBackendRes<any>>("/users/verify-otp", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),
};

export default userApiRequest;
