import envConfig from "@/config";
import { VenueImage } from "@/types/image";
import { Review } from "@/types/review";
import http from "@/utils/api";

const imageApiRequest = {
  sGetAllImageByVenueId: (id: number) =>
    http.get<IBackendRes<VenueImage[]>>(`/venue-images/venue/${id}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),
};

export default imageApiRequest;
