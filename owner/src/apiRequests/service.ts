import http from "@/utils/api";
import {
  CreateServiceRequest,
  UpdateServiceRequest,
  RestResponseServiceResponse,
} from "@/types/service";
import envConfig from "@/config";

const serviceApiRequest = {
  sCreateService: (body: CreateServiceRequest) =>
    http.post<RestResponseServiceResponse>("/services", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),

  sUpdateService: (serviceId: number, body: UpdateServiceRequest) =>
    http.put<RestResponseServiceResponse>(`/services/${serviceId}`, body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),

  sDeleteService: (serviceId: number) =>
    http.delete(
      `/services/${serviceId}`,
      {},
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
      }
    ),
};

export default serviceApiRequest;
