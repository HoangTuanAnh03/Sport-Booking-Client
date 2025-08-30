import http from "@/utils/api";
import {
  CreateVenueBodyType,
  UpdateVenueBodyType,
  UpdateVenueStatusBodyType,
} from "@/schemaValidations/venue.schema";
import {
  VenueResponse,
  VenueAdminResponse,
  VenueAdminPaginatedResponse,
  VenueSingleResponse,
  VenueAdminSearchParams,
} from "@/types/venue";

const venueApiRequest = {
  // GET /venues/admin/search - Search venues for admin with pagination and filters
  sSearchVenuesForAdmin: (params?: VenueAdminSearchParams) => {
    const queryParams = new URLSearchParams();

    if (params?.pageNo !== undefined)
      queryParams.append("pageNo", params.pageNo.toString());
    if (params?.pageSize !== undefined)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortDir) queryParams.append("sortDir", params.sortDir);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.types && params.types.length > 0) {
      params.types.forEach((type) =>
        queryParams.append("types", type.toString())
      );
    }
    if (params?.isPaid !== undefined)
      queryParams.append("isPaid", params.isPaid.toString());
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/venues/admin/search?${queryString}`
      : "/venues/admin/search";

    return http.get<IModelPaginate<VenueAdminResponse>>(url, {
      baseUrl: "http://localhost:8090",
    });
  },

  // GET /venues/{id} - Get venue detail by ID
  sGetVenueById: (id: number) => {
    return http.get<IBackendRes<VenueResponse>>(`/venues/${id}`, {
      baseUrl: "http://localhost:8090",
    });
  },

  // POST /venues - Create new venue
  sCreateVenue: (body: CreateVenueBodyType) => {
    return http.post<IBackendRes<VenueResponse>>("/venues", body, {
      baseUrl: "http://localhost:8090",
    });
  },

  // PUT /venues/{id} - Update venue
  sUpdateVenue: (id: number, body: UpdateVenueBodyType) => {
    return http.put<IBackendRes<VenueResponse>>(`/venues/${id}`, body, {
      baseUrl: "http://localhost:8090",
    });
  },

  // PUT /venues/status - Update venue status
  sUpdateVenueStatus: (body: UpdateVenueStatusBodyType) => {
    return http.put<null>("/venues/status", body, {
      baseUrl: "http://localhost:8090",
    });
  },

  // DELETE /venues/{id} - Delete venue
  sDeleteVenue: (id: number) => {
    return http.delete<null>(`/venues/${id}`, undefined, {
      baseUrl: "http://localhost:8090",
    });
  },
};

export default venueApiRequest;
