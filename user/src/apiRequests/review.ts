import envConfig from "@/config";
import { Review, CreateReviewRequest } from "@/types/review";
import http from "@/utils/api";

const reviewApiRequest = {
  sGetReviewByVenueId: (id: number) =>
    http.get<IBackendRes<Review[]>>(`/reviews/venue/${id}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),

  sCreateReview: (payload: CreateReviewRequest) =>
    http.post<IBackendRes<Review>>("/reviews", payload, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),
};

export default reviewApiRequest;
