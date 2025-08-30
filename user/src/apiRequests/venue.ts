import http from "@/utils/api";

const venueApiRequest = {
  sGetAllForMap: () => http.get<IBackendRes<VenueMap[]>>(`/venues/map`),
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
  useVenues: (options?: {
    pageNo?: number;
    pageSize?: number;
    lng?: number;
    lat?: number;
    search?: string;
    types?: number[];
    maxDistance?: number;
  }) => {
    const params = new URLSearchParams();
    if (options?.pageNo !== undefined)
      params.set("pageNo", options.pageNo.toString());
    if (options?.pageSize !== undefined)
      params.set("pageSize", options.pageSize.toString());
    if (options?.lng !== undefined) params.set("lng", options.lng.toString());
    if (options?.lat !== undefined) params.set("lat", options.lat.toString());
    if (options?.search) params.set("search", options.search);
    if (options?.types && options.types.length > 0) {
      options.types.forEach((type) => params.append("types", type.toString()));
    }
    if (options?.maxDistance !== undefined)
      params.set("maxDistance", options.maxDistance.toString());

    const query = params.toString();
    return http.get<IBackendRes<VenueDetail[]>>(
      `/venues/search${query ? `?${query}` : ""}`
    );
  },
};

export default venueApiRequest;
