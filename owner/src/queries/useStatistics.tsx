import statisticsApiRequest from "@/apiRequests/statistics";
import { useQuery } from "@tanstack/react-query";
import { DashboardQueryParams, OwnerFilterType } from "@/types/statistics";

export const useGetOnlineStatisticsQuery = () => {
  return useQuery({
    queryKey: ["statistics", "owner", "online"],
    queryFn: async () => {
      const response = await statisticsApiRequest.sGetOnlineStatistics();
      return response.payload?.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useGetBasicStatisticsQuery = () => {
  return useQuery({
    queryKey: ["statistics", "owner", "basic"],
    queryFn: async () => {
      const response = await statisticsApiRequest.sGetBasicStatistics();
      return response.payload?.data;
    },
  });
};

export const useGetDailyRevenueChartQuery = (filterType: OwnerFilterType) => {
  return useQuery({
    queryKey: ["statistics", "owner", "daily-revenue-chart", filterType],
    queryFn: async () => {
      const response = await statisticsApiRequest.sGetDailyRevenueChart(
        filterType
      );
      return response.payload?.data;
    },
  });
};

export const useGetDashboardStatisticsQuery = (
  revenueFilter?: OwnerFilterType,
  topFieldsFilter?: OwnerFilterType,
  orderFilter?: OwnerFilterType
) => {
  return useQuery({
    queryKey: [
      "statistics",
      "owner",
      "dashboard",
      revenueFilter,
      topFieldsFilter,
      orderFilter,
    ],
    queryFn: async () => {
      const params: DashboardQueryParams = {
        revenueFilterType: revenueFilter,
        topFieldsFilterType: topFieldsFilter,
        orderFilterType: orderFilter,
      };
      const response = await statisticsApiRequest.sGetDashboardStatistics(
        params
      );
      return response.payload?.data;
    },
  });
};
