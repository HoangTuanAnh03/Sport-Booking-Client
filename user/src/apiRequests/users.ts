import http from "@/utils/api";
import { UserResponse } from "@/types/user";

const userApiRequest = {
  sGetById: (id: string) => http.get<IBackendRes<UserResponse>>(`users/${id}`),

  sGetMyInfo: () => http.get<IBackendRes<UserResponse>>(`/me`),
};

export default userApiRequest;
