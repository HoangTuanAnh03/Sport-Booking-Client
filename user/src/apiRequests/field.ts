import http from "@/utils/api";
import { CourtSlotsByField, FieldsByVenueId, FieldById } from "@/types/field";
import envConfig from "@/config";

const fieldApiRequest = {
  sGetFieldById: (id: number) =>
    http.get<IBackendRes<FieldById>>(`/fields/${id}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),
  sGetFieldByVenueId: (id: number) =>
    http.get<IBackendRes<FieldsByVenueId>>(`/fields/getByVenueId/${id}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
    }),

  sGetCourtSlotsByFieldId: (fieldId: string, date?: string) => {
    const params = new URLSearchParams();
    if (date !== undefined) params.set("date", date);

    const query = params.toString();
    return http.get<IBackendRes<CourtSlotsByField>>(
      `/fields/${fieldId}/slots${query ? `?${query}` : ""}`,
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
      }
    );
  },
};

export default fieldApiRequest;
