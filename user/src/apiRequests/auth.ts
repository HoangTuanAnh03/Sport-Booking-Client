import http from "@/utils/api";
import {
  LoginBodyType,
  LoginResType,
  RefreshTokenResType,
  RegisterBodyType,
} from "@/schemaValidations/auth.schema";

const authApiRequest = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: IBackendRes<RefreshTokenResType>;
  }> | null,

  sLogin: (body: LoginBodyType) =>
    http.post<IBackendRes<LoginResType>>("/auth/login", body, {
      baseUrl: "http://localhost:8080",
    }),

  login: (body: LoginBodyType) =>
    http.post<IBackendRes<LoginResType>>("/api/auth/login", body, {
      baseUrl: "",
    }),

  sOutbound: (code: string) =>
    http.post<IBackendRes<LoginResType>>(
      `/auth/outbound/authentication?code=${code}`,
      null,
      {
        baseUrl: "http://localhost:8080",
      }
    ),

  outbound: (code: string) =>
    http.post("/api/auth/outbound", code, {
      baseUrl: "",
    }),

  sVerifyRegister: (code: string) =>
    http.get<IBackendRes<LoginResType>>(`/auth/verifyRegister?code=${code}`, {
      baseUrl: "http://localhost:8080",
    }),

  verifyRegister: (code: string) =>
    http.post<IBackendRes<LoginResType>>("/api/auth/verify/register", code, {
      baseUrl: "",
    }),

  sLogout: (refresh_token: string) =>
    http.post<IBackendRes<any>>(
      "/auth/logout",
      {},
      {
        baseUrl: "http://localhost:8080",
        headers: { Cookie: `refresh_token=${refresh_token}` },
      }
    ),

  logout: () =>
    http.post<IBackendRes<any>>(
      "/api/auth/logout",
      {},
      {
        baseUrl: "",
      }
    ),

  sRegister: (body: RegisterBodyType) =>
    http.post<IBackendRes<any>>("/auth/register", body, {
      baseUrl: "http://localhost:8080",
    }),

  async refreshToken() {
    if (this.refreshTokenRequest) {
      return this.refreshTokenRequest;
    }
    this.refreshTokenRequest = http.post<IBackendRes<RefreshTokenResType>>(
      "/api/auth/refresh-token",
      {},
      {
        baseUrl: "",
      }
    );
    const result = await this.refreshTokenRequest;
    this.refreshTokenRequest = null;
    return result;
  },

  sRefreshToken: (refreshToken: string) =>
    http.post<IBackendRes<RefreshTokenResType>>(
      "/auth/refreshToken",
      {},
      {
        baseUrl: "http://localhost:8080",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      }
    ),
};

export default authApiRequest;
