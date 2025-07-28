import http from "@/utils/api";

const venueApiRequest = {
  sGetAllForMap: () =>
    http.get<IBackendRes<VenueMap[]>>(
      `/venues/map`
      // `/venues/search_near_for_home?distance=1000000`
    ),
  sGetVenueDetail: (id: number) =>
    http.get<IBackendRes<VenueDetail>>(`/venues/${id}`),
  sGetDirection: (destination: Coord, origin?: Coord, vehicle?: string) => {
    const params = new URLSearchParams();
    if (origin) {
      params.set("sLat", origin[0].toString());
      params.set("sLng", origin[1].toString());
    }

    if (vehicle) {
      params.set("vehicle", vehicle);
    }
    params.set("eLat", destination[0].toString());
    params.set("eLng", destination[1].toString());

    const query = params.toString();
    return http.get<IBackendRes<any>>(
      `/venues/direction${query ? `?${query}` : ""}`
    );
  },
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
