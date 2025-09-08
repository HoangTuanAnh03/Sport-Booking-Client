import http from "@/utils/api";
import {
  LoginBodyType,
  LoginResType,
  RegisterBodyType,
} from "@/schemaValidations/auth.schema";
import { NewPasswordReq } from "@/schemaValidations/user.schema";
import envConfig from "@/config";

const authApiRequest = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: IBackendRes<LoginResType>;
  }> | null,

  sLogin: (body: LoginBodyType) =>
    http.post<IBackendRes<LoginResType>>("/auth/login", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),

  login: (body: LoginBodyType) =>
    http.post<IBackendRes<LoginResType>>("/api/auth/login", body),

  sOutbound: (code: string) =>
    http.post<IBackendRes<LoginResType>>(
      `/auth/outbound/authentication?code=${code}`,
      null,
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
      }
    ),

  outbound: (code: string) => http.post("/api/auth/outbound", code),

  sVerifyRegister: (code: string) =>
    http.get<IBackendRes<LoginResType>>(`/auth/verifyRegister?code=${code}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),

  verifyRegister: (code: string) =>
    http.post<IBackendRes<LoginResType>>("/api/auth/verify/register", code),

  sVerifyNewPassword: (body: NewPasswordReq) =>
    http.post<IBackendRes<LoginResType>>(`/auth/verifyForgotPassword`, body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),

  verifyNewPassword: (body: NewPasswordReq) =>
    http.post<IBackendRes<LoginResType>>("/api/auth/verify/newPassword", body),

  sLogout: (refresh_token: string) =>
    http.post<IBackendRes<any>>(
      "/auth/logout",
      {},
      {
        headers: { Cookie: `refresh_token=${refresh_token}` },
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
      }
    ),

  logout: () => http.post<IBackendRes<any>>("/api/auth/logout", {}),

  sRegister: (body: RegisterBodyType) =>
    http.post<IBackendRes<any>>("/auth/register", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),

  async refreshToken() {
    if (this.refreshTokenRequest) {
      return this.refreshTokenRequest;
    }
    // @ts-ignore
    this.refreshTokenRequest = http.post<IBackendRes<LoginResType>>(
      "/api/auth/refresh-token",
      {}
    );
    const result = await this.refreshTokenRequest;
    this.refreshTokenRequest = null;
    return result;
  },

  sRefreshToken: (refreshToken: string) =>
    http.post<IBackendRes<LoginResType>>(
      "/auth/refreshToken",
      {},
      {
        headers: { Cookie: `refresh_token=${refreshToken}` },
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
      }
    ),
};

export default authApiRequest;
