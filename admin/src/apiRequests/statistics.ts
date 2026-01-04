import http from "@/utils/api";
import envConfig from "@/config";
import {
  OnlineStatistics,
  SystemStatistics,
  TopVenuesStatistics,
  FilterType,
} from "@/types/statistics";

const statisticsApiRequest = {
  // Get online users count
  sGetOnlineStatistics: () =>
    http.get<IBackendRes<OnlineStatistics>>("/statistics/admin/online", {
      baseUrl:
        envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888/api/v1",
    }),

  // Get system statistics (venues, users, sport types, payment stats)
  sGetSystemStatistics: () =>
    http.get<IBackendRes<SystemStatistics>>("/statistics/admin/system", {
      baseUrl:
        envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888/api/v1",
    }),

  // Get top venues by revenue and booking count
  sGetTopVenues: (filterType?: FilterType) => {
    const queryParams = new URLSearchParams();
    if (filterType) {
      queryParams.append("filterType", filterType);
    }

    const queryString = queryParams.toString();
    return http.get<IBackendRes<TopVenuesStatistics>>(
      `/statistics/admin/top-venues${queryString ? `?${queryString}` : ""}`,
      {
        baseUrl:
          envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888/api/v1",
      }
    );
  },
};

export default statisticsApiRequest;
