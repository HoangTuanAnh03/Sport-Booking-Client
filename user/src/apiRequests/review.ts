import { Review } from "@/types/review";
import http from "@/utils/api";

const reviewApiRequest = {
  sGetReview: (id: string, page: number, perPage: number) =>
    http.get<IBackendRes<IModelPaginate<Review[]>>>(
      `/reviews/getByVenueId/${id}?page=${page}&per_page=${perPage}`
    ),
};

export default reviewApiRequest;
