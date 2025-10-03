import envConfig from "@/config";
import { Category } from "@/types/service";
import http from "@/utils/api";

const serviceApiRequest = {
  sGetCategoryByVenueId: (id: number) =>
    http.get<IBackendRes<Category[]>>(`/categories/venue/${id}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),
};

export default serviceApiRequest;
