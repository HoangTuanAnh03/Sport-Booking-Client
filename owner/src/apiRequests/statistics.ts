import http from "@/utils/api";
import envConfig from "@/config";
import {
  OnlineStatistics,
  BasicStatistics,
  DailyRevenueChartData,
  OwnerFilterType,
  RevenueByVenueStatistics,
} from "@/types/statistics";

const statisticsApiRequest = {
  // Get online users count (owner)
  sGetOnlineStatistics: () =>
    http.get<IBackendRes<OnlineStatistics>>("/statistics/owner/online", {
      baseUrl:
        envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888/api/v1",
    }),

  // Get basic statistics (owner)
  sGetBasicStatistics: () =>
    http.get<IBackendRes<BasicStatistics>>("/statistics/owner/basic", {
      baseUrl:
        envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888/api/v1",
    }),

  // Get daily revenue chart (owner)
  sGetDailyRevenueChart: (filterType: OwnerFilterType) =>
    http.get<IBackendRes<DailyRevenueChartData>>(
      `/statistics/owner/daily-revenue-chart?filterType=${filterType}`,
      {
        baseUrl:
          envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888/api/v1",
      }
    ),

  // Get revenue by venue (top courts)
  sGetRevenueByVenue: (filterType: OwnerFilterType) =>
    http.get<IBackendRes<RevenueByVenueStatistics>>(
      `/statistics/owner/revenue-by-venue?filterType=${filterType}`,
      {
        baseUrl:
          envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888/api/v1",
      }
    ),


};

export default statisticsApiRequest;
