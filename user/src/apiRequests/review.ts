import { Review } from "@/types/review";
import http from "@/utils/api";

const reviewApiRequest = {
  sGetReviewByVenueId: (id: number) =>
    http.get<IBackendRes<Review[]>>(`/reviews/venue/${id}`, {
      baseUrl: "http://localhost:8090",
    }),
};

export default reviewApiRequest;
