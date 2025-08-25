import http from "@/utils/api";
import {
  ForgotPasswordBodyType,
  VerifyOtpBodyType,
} from "@/schemaValidations/user.schema";

const userApiRequest = {
  sForgotPassword: (body: ForgotPasswordBodyType) =>
    http.post<IBackendRes<any>>("/users/forgot-password", body),
  sVerifyOtp: (body: VerifyOtpBodyType) =>
    http.post<IBackendRes<any>>("/users/verify-otp", body),
};

export default userApiRequest;
