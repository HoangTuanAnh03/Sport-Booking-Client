import http from "@/utils/api";
import {
  Category,
  UpdateCategoryRequest,
  CreateCategoryRequest,
} from "@/types/venue";
import envConfig from "@/config";

const categoryApiRequest = {
  sUpdateCategory: (categoryId: number, body: UpdateCategoryRequest) =>
    http.put<IBackendRes<Category>>(`/categories/${categoryId}`, body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),

  sDeleteCategory: (categoryId: number) =>
    http.delete(
      `/categories/${categoryId}`,
      {},
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
      }
    ),

  sCreateCategory: (body: CreateCategoryRequest) =>
    http.post<IBackendRes<Category>>("/categories", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),
};

export default categoryApiRequest;
