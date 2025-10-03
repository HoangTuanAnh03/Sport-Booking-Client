import http from "@/utils/api";
import {
  CreateSportTypeBodyType,
  UpdateSportTypeBodyType,
} from "@/schemaValidations/sport-type.schema";
import { SportTypeResponse, SportTypeSingleResponse } from "@/types/sport-type";
import { env } from "process";
import envConfig from "@/config";

const sportTypeApiRequest = {
  // GET /sport-types - Get all sport types with optional parameters
  sGetAllSportTypes: (params?: {
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
    const url = queryString ? `/sport-types?${queryString}` : "/sport-types";

    return http.get<IModelPaginate<SportTypeResponse>>(url, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    });
  },

  // GET /sport-types/{id} - Get sport type by ID
  sGetSportTypeById: (id: number) => {
    return http.get<IBackendRes<SportTypeResponse>>(`/sport-types/${id}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    });
  },

  // POST /sport-types - Create new sport type
  sCreateSportType: (body: CreateSportTypeBodyType) => {
    return http.post<IBackendRes<SportTypeResponse>>("/sport-types", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    });
  },

  // PUT /sport-types/{id} - Update sport type
  sUpdateSportType: (id: number, body: UpdateSportTypeBodyType) => {
    return http.put<IBackendRes<SportTypeResponse>>(
      `/sport-types/${id}`,
      body,
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
      }
    );
  },

  // DELETE /sport-types/{id} - Delete sport type
  sDeleteSportType: (id: number) => {
    return http.delete<null>(`/sport-types/${id}`, undefined, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    });
  },
};

export default sportTypeApiRequest;
