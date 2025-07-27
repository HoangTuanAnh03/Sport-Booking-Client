import http from "@/utils/api";
import { UserResponse } from "@/types/user";

const userApiRequest = {
  sGetById: (id: string) => http.get<IBackendRes<UserResponse>>(`users/${id}`),

  sGetAll: (
    spec: IModelSpecificationRequest,
    page: IModelPaginateRequest,
  ) =>
    http.get<IBackendRes<IModelPaginate<UserResponse>>>(`users?page=${
      page.page
    }&size=${page.size}&sort=${page.sort}
    ${"&filter=" + spec.filter} `),

  sGetMyInfo: () => 
    http.get<IBackendRes<UserResponse>>(`/me`),
};

export default userApiRequest;
