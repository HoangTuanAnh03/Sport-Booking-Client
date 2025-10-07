import http from "@/utils/api";
import { Field } from "@/types/field";
import { CourtSlotsByField } from "@/types/field";
import envConfig from "@/config";

const fieldApiRequest = {
  sGetFieldByVenueId: (id: number) =>
    http.get<IBackendRes<IModelPaginateResponse<Field[]>>>(
      `/fields/getByVenueId/${id}`,
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8100",
      }
    ),

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
