import { Review } from "@/types/review";
import http from "@/utils/api";

const reviewApiRequest = {
  sGetReviewByVenueId: (id: number) =>
    http.get<IBackendRes<Review[]>>(`/reviews/venue/${id}`),
};

export default reviewApiRequest;
