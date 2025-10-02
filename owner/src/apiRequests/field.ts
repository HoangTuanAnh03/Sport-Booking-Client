import http from "@/utils/api";
import envConfig from "@/config";
import {
  FieldOwnerResponse,
  UpdateFieldRequest,
  UpdateCourtRequest,
  CreateFieldRequest,
  CreateCourtRequest,
  CourtSlotsByField,
} from "@/types/field";

const fieldApiRequest = {
  sGetCourtSlotsByFieldId: (fieldId: string, date?: string) => {
    const params = new URLSearchParams();
    if (date !== undefined) params.set("date", date);

    const query = params.toString();
    return http.get<IBackendRes<CourtSlotsByField>>(
      `/fields/${fieldId}/slots${query ? `?${query}` : ""}`,
      {
        baseUrl: "http://localhost:8100",
      }
    );
  },

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

  sMergeCourtSlots: (payload: {
    date: string;
    fieldId: number;
    court: Array<{
      id: number;
      timeSlot: Array<{
        id: number;
        startTime: { hour: number; minute: number; second: number };
        endTime: { hour: number; minute: number; second: number };
      }>;
    }>;
  }) =>
    http.post<IBackendRes<any>>("/court-slots/merge", payload, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),

  sLockCourtSlots: (slotIds: number[]) =>
    http.post<IBackendRes<any>>(
      "/court-slots/lock",
      { slotIds },
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
      }
    ),
};

export default fieldApiRequest;
