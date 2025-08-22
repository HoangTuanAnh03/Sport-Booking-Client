import http from "@/utils/api";
import { Field } from "@/types/field";
import { CourtSlotsByField } from "@/types/field";

const fieldApiRequest = {
  sGetFieldByVenueId: (id: number) =>
    http.get<IBackendRes<IModelPaginateResponse<Field[]>>>(
      `/fields/getByVenueId/${id}`
    ),

  sGetCourtSlotsByFieldId: (fieldId: string, date?: string) => {
    const params = new URLSearchParams();
    if (date !== undefined) params.set("date", date);

    const query = params.toString();
    return http.get<IBackendRes<CourtSlotsByField>>(
      `/fields/${fieldId}/courts/slots${query ? `?${query}` : ""}`,
      {
        baseUrl: "http://localhost:8100",
      }
    );
  },
};

export default fieldApiRequest;
