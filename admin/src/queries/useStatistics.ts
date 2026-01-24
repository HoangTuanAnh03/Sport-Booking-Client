import { useQuery } from "@tanstack/react-query";
import { FilterType } from "@/types/statistics";
import statisticsApiRequest from "@/apiRequests/statistics";

export const useGetOnlineStatisticsQuery = () => {
  return useQuery({
    queryKey: ["statistics", "online"],
    queryFn: async () => {
      const response = await statisticsApiRequest.sGetOnlineStatistics();
      return response.payload?.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useGetSystemStatisticsQuery = () => {
  return useQuery({
    queryKey: ["statistics", "system"],
    queryFn: async () => {
      const response = await statisticsApiRequest.sGetSystemStatistics();
      return response.payload?.data;
    },
  });
};

export const useGetTopVenuesQuery = (filterType?: FilterType) => {
  return useQuery({
    queryKey: ["statistics", "top-venues", filterType],
    queryFn: async () => {
      const response = await statisticsApiRequest.sGetTopVenues(filterType);
      return response.payload?.data;
    },
  });
};

export const useGetTopVenuesByRevenueQuery = (filterType: FilterType) => {
  return useQuery({
    queryKey: ["statistics", "top-venues-by-revenue", filterType],
    queryFn: async () => {
      const response = await statisticsApiRequest.sGetTopVenuesByRevenue(
        filterType
      );
      return response.payload?.data;
    },
  });
};
