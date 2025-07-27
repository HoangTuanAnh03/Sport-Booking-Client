import http from "@/utils/api";

const venueApiRequest = {
  sGetAllForMap: () =>
    http.get<IBackendRes<VenueMap[]>>(
      `/venues/map`
      // `/venues/search_near_for_home?distance=1000000`
    ),
  sGetVenueDetail: (id: string) =>
    http.get<IBackendRes<VenueDetail>>(`/venues/detail/${id}`),
  sGetVenueNearHome: (distance?: number, lat?: number, lng?: number) => {
    const params = new URLSearchParams();
    distance ? params.set("distance", distance.toString()) : "1000000";
    if (lat) params.set("lat", lat.toString());
    if (lng) params.set("lng", lng.toString());

    const query = params.toString();
    return http.get<IBackendRes<VenueDetail[]>>(
      `/venues/search_near_for_home${query ? `?${query}` : ""}`
    );
  },
};

export default venueApiRequest;
