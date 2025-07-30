import { Category } from "@/types/service";
import http from "@/utils/api";

const serviceApiRequest = {
  sGetCategoryByVenueId: (id: number) =>
    http.get<IBackendRes<Category[]>>(`/categories/venue/${id}`),
};

export default serviceApiRequest;
