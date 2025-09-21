import http from "@/utils/api";
import envConfig from "@/config";
import { SportTypeResponse } from "@/types/sport-type";

const sportTypeApiRequest = {
  sGetAllSportTypes: () => {
    return http.get<PagingResponse<SportTypeResponse>>("/sport-types", {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    });
  },

  sGetSportTypeById: (id: number) => {
    return http.get<IBackendRes<SportTypeResponse>>(`/sport-types/${id}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    });
  },
};

export default sportTypeApiRequest;
