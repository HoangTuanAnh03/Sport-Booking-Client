import { VenueImage } from "@/types/image";
import { Review } from "@/types/review";
import http from "@/utils/api";

const imageApiRequest = {
  sGetAllImageByVenueId: (id: number) =>
    http.get<IBackendRes<VenueImage[]>>(`/venue-images/venue/${id}`),
};

export default imageApiRequest;
