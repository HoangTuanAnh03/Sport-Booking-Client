import { VenueImage } from "@/types/image";
import http from "@/utils/api";

const imageApiRequest = {
  sGetAllImageByVenueId: (id: number) =>
    http.get<IBackendRes<VenueImage[]>>(`/venue-images/venue/${id}`, {
      baseUrl: "http://localhost:8090",
    }),
};

export default imageApiRequest;
