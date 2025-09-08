import http from "@/utils/api";
import {
  VenueResponse,
  VenueDetailResponse,
  UpdateVenueRequest,
  UpdateVenueResponse,
  UpdateVenueStatusRequest,
  UpdateVenueStatusResponse,
} from "@/types/venue";
import envConfig from "@/config";

const venueApiRequest = {
  sGetMyVenues: () =>
    http.get<VenueResponse>("/venues/me", {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),
  sGetVenueDetail: (venueId: number) =>
    http.get<VenueDetailResponse>(`/venues/owner/${venueId}`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),
  sUpdateVenue: (venueId: number, body: UpdateVenueRequest) =>
    http.put<UpdateVenueResponse>(`/venues/${venueId}`, body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),
  sUpdateVenueStatus: (body: UpdateVenueStatusRequest) =>
    http.put<UpdateVenueStatusResponse>("/venues/status", body, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
    }),
  sUploadVenueImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return http.post<{
      code: number;
      message: string;
      payload: { data: string };
    }>("/venue-images/upload", formData, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
      // Don't set Content-Type header - let browser set it automatically with boundary
    });
  },
  sCreateVenueImages: (
    venueId: number,
    imageType: "AVATAR" | "THUMBNAIL" | "DEFAULT",
    files: File[]
  ) => {
    const formData = new FormData();
    formData.append("venueId", venueId.toString());
    formData.append("imageType", imageType);
    files.forEach((file) => {
      formData.append("files", file);
    });

    return http.post<{ code: number; message: string; payload: { data: any } }>(
      "/venue-images",
      formData,
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
        // Don't set Content-Type header - let browser set it automatically with boundary
      }
    );
  },
  sDeleteVenueImage: (imageId: number) => {
    return http.delete<{}>(
      `/venue-images/${imageId}`,
      {},
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8090",
      }
    );
  },
};

export default venueApiRequest;
