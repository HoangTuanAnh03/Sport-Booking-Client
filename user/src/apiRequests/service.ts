import { Category } from "@/types/service";
import http from "@/utils/api";

const serviceApiRequest = {
  sGetCategoryByVenueId: (id: number) =>
    http.get<IBackendRes<Category[]>>(`/categories/venue/${id}`, {
      baseUrl: "http://localhost:8090",
    }),
};

export default serviceApiRequest;
