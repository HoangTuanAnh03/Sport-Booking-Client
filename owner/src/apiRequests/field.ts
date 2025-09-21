import http from "@/utils/api";
import envConfig from "@/config";
import {
  FieldOwnerResponse,
  UpdateFieldRequest,
  UpdateCourtRequest,
  CreateFieldRequest,
  CreateCourtRequest,
} from "@/types/field";

const fieldApiRequest = {
  sGetFieldsByVenueId: (venueId: number) =>
    http.get<IBackendRes<FieldOwnerResponse[]>>(`/fields/owner/${venueId}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),

  sCreateField: (body: CreateFieldRequest) =>
    http.post<IBackendRes<FieldOwnerResponse>>("/fields", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),

  sUpdateField: (fieldId: number, body: UpdateFieldRequest) =>
    http.put<IBackendRes<FieldOwnerResponse>>(`/fields/${fieldId}`, body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),

  sUpdateCourt: (courtId: number, body: UpdateCourtRequest) =>
    http.put<IBackendRes<any>>(`/courts/${courtId}`, body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),

  sDeleteCourt: (courtId: number) =>
    http.delete<IBackendRes<any>>(
      `/courts/${courtId}`,
      {},
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
      }
    ),

  sCreateCourt: (body: CreateCourtRequest) =>
    http.post<IBackendRes<any>>("/courts", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),

  sDeleteField: (fieldId: number) =>
    http.delete<IBackendRes<any>>(
      `/fields/${fieldId}`,
      {},
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
      }
    ),
};

export default fieldApiRequest;
