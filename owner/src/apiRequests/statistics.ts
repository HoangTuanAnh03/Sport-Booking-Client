import http from "@/utils/api";
import envConfig from "@/config";
import {
  OnlineStatistics,
  DashboardStatistics,
  DashboardQueryParams,
} from "@/types/statistics";

const statisticsApiRequest = {
  // Get online users count (owner)
  sGetOnlineStatistics: () =>
    http.get<IBackendRes<OnlineStatistics>>("/statistics/owner/online", {
      baseUrl:
        envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888/api/v1",
    }),

  // Get dashboard statistics (owner)
  sGetDashboardStatistics: (params?: DashboardQueryParams) => {
    const queryParams = new URLSearchParams();
    if (params?.revenueFilterType) {
      queryParams.append("revenueFilterType", params.revenueFilterType);
    }
    if (params?.topFieldsFilterType) {
      queryParams.append("topFieldsFilterType", params.topFieldsFilterType);
    }
    if (params?.orderFilterType) {
      queryParams.append("orderFilterType", params.orderFilterType);
    }

    const queryString = queryParams.toString();
    return http.get<IBackendRes<DashboardStatistics>>(
      `/statistics/owner/dashboard${queryString ? `?${queryString}` : ""}`,
      {
        baseUrl:
          envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8888/api/v1",
      }
    );
  },
};

export default statisticsApiRequest;
