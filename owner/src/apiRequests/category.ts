import http from "@/utils/api";
import { Category } from "@/types/venue";
import envConfig from "@/config";

export interface UpdateCategoryRequest {
  name: string;
}

export interface CreateCategoryRequest {
  name: string;
  venueId: number;
}

export interface UpdateCategoryResponse {
  code: number;
  data: Category;
}

export interface CreateCategoryResponse {
  code: number;
  data: Category;
}

const categoryApiRequest = {
  sUpdateCategory: (categoryId: number, body: UpdateCategoryRequest) =>
    http.put<UpdateCategoryResponse>(`/categories/${categoryId}`, body, {
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
    http.post<CreateCategoryResponse>("/categories", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),
};

export default categoryApiRequest;
