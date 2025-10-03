import envConfig from "@/config";
import { Review } from "@/types/review";
import http from "@/utils/api";

const reviewApiRequest = {
  sGetReviewByVenueId: (id: number) =>
    http.get<IBackendRes<Review[]>>(`/reviews/venue/${id}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),
};

export default reviewApiRequest;
