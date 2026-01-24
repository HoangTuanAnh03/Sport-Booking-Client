"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  useGetOnlineStatisticsQuery,
  useGetBasicStatisticsQuery,
  useGetDailyRevenueChartQuery,
  useGetRevenueByVenueQuery,
} from "@/queries/useStatistics";
import { OwnerFilterType } from "@/types/statistics";
import { useState, useMemo } from "react";
import {
  Users,
  Building2,
  Star,
  CheckCircle2,
  Loader2,
  MapPin,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  Tooltip,
} from "recharts";

// Colors for charts
const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];
const VENUE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

// Chart configs
const bookingSuccessChartConfig = {
  success: {
    label: "Thành công",
    color: "#22c55e",
  },
  failed: {
    label: "Thất bại",
    color: "#ef4444",
  },
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

const topFieldsChartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

const bookingChartConfig = {
  booking: {
    label: "Đơn đặt",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [revenueFilter, setRevenueFilter] =
    useState<OwnerFilterType>("LAST_7_DAYS");
  const [topFieldsFilter, setTopFieldsFilter] =
    useState<OwnerFilterType>("LAST_30_DAYS");
  const [orderFilter, setOrderFilter] =
    useState<OwnerFilterType>("LAST_7_DAYS");

  const { data: onlineStats, isLoading: isLoadingOnline } =
    useGetOnlineStatisticsQuery();
  const { data: basicStats, isLoading: isLoadingBasic } =
    useGetBasicStatisticsQuery();
  const { data: dailyRevenueStats, isLoading: isLoadingDailyRevenue } =
    useGetDailyRevenueChartQuery(revenueFilter);
  const { data: bookingStats, isLoading: isLoadingBooking } =
    useGetDailyRevenueChartQuery(orderFilter);
  const { data: topCourtsStats, isLoading: isLoadingTopCourts } =
    useGetRevenueByVenueQuery(topFieldsFilter);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const formatCompactNumber = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Prepare booking success rate pie chart data
  const bookingSuccessData = basicStats?.bookingSuccessRate
    ? [
        {
          name: "success",
          value: basicStats.bookingSuccessRate,
          fill: "#22c55e",
        },
        {
          name: "failed",
          value: 100 - basicStats.bookingSuccessRate,
          fill: "#ef4444",
        },
      ]
    : [];

  // Prepare period revenue data for line chart
  const periodRevenueData = useMemo(() => {
    if (!dailyRevenueStats?.venueData || dailyRevenueStats.venueData.length === 0)
      return [];

    // Get unique dates from all venues
    const dates =
      dailyRevenueStats.venueData[0]?.dailyData.map((d) => d.date) || [];

    return dates.map((date) => {
      const dataPoint: any = { periodLabel: date };
      let totalRevenue = 0;
      dailyRevenueStats.venueData.forEach((venue) => {
        const dayData = venue.dailyData.find((d) => d.date === date);
        const revenue = dayData ? dayData.revenue : 0;
        dataPoint[`venue_${venue.venueId}`] = revenue;
        totalRevenue += revenue;
      });
      dataPoint.total = totalRevenue;
      return dataPoint;
    });
  }, [dailyRevenueStats]);

  // Prepare period booking data for line chart
  const periodBookingData = useMemo(() => {
    if (!bookingStats?.venueData || bookingStats.venueData.length === 0)
      return [];

    // Get unique dates from all venues
    const dates =
      bookingStats.venueData[0]?.dailyData.map((d) => d.date) || [];

    return dates.map((date) => {
      const dataPoint: any = { periodLabel: date };
      let totalBookings = 0;
      bookingStats.venueData.forEach((venue) => {
        const dayData = venue.dailyData.find((d) => d.date === date);
        const bookingCount = dayData ? dayData.bookingCount : 0;
        dataPoint[`venue_${venue.venueId}`] = bookingCount;
        totalBookings += bookingCount;
      });
      dataPoint.total = totalBookings;
      return dataPoint;
    });
  }, [bookingStats]);

  // Get unique venues for booking chart legend
  const uniqueBookingVenues = useMemo(() => {
    return (
      bookingStats?.venueData?.map((venue, index) => ({
        venueId: venue.venueId,
        venueName: venue.venueName,
        color: VENUE_COLORS[index % VENUE_COLORS.length],
      })) || []
    );
  }, [bookingStats]);

  // Prepare top fields data (top courts)
  const topFieldsData =
    topCourtsStats?.topCourts?.slice(0, 5).map((court, index) => ({
      name:
        court.courtName.length > 12
          ? court.courtName.substring(0, 12) + "..."
          : court.courtName,
      fullName: `${court.courtName} - ${court.venueName}`,
      revenue: court.revenue,
      venueName: court.venueName,
      fill: COLORS[index % COLORS.length],
    })) || [];

  // Get unique venues for line chart legend
  const uniqueVenues = useMemo(() => {
    return (
      dailyRevenueStats?.venueData?.map((venue, index) => ({
        venueId: venue.venueId,
        venueName: venue.venueName,
        color: VENUE_COLORS[index % VENUE_COLORS.length],
      })) || []
    );
  }, [dailyRevenueStats]);

  if (
    isLoadingBasic ||
    isLoadingDailyRevenue ||
    isLoadingBooking ||
    isLoadingTopCourts
  ) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-4 pt-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Online Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lượt truy cập đồng thời
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingOnline ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatNumber(onlineStats?.totalOnlineUsers || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        {/* Total Venues Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số địa điểm</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(basicStats?.totalVenues || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Địa điểm</p>
          </CardContent>
        </Card>

        {/* Total Courts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số sân</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(basicStats?.totalCourts || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Sân thể thao</p>
          </CardContent>
        </Card>

        {/* Average Rating Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đánh giá trung bình
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {basicStats?.averageRating?.toFixed(1) || "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">Trên 5 sao</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Booking Success Rate & Period Revenue */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Booking Success Rate Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tỉ lệ đặt lịch thành công</CardTitle>
            <CardDescription>
              Thống kê tỷ lệ đặt lịch thành công và thất bại
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingSuccessData.length > 0 ? (
              <ChartContainer
                config={bookingSuccessChartConfig}
                className="mx-auto aspect-square h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex items-center gap-2">
                            <span>
                              {name === "success" ? "Thành công" : "Thất bại"}:
                            </span>
                            <span className="font-bold">
                              {Number(value).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={bookingSuccessData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    // label={({ name, percent }) =>
                    //   `${name === "success" ? "Thành công" : "Thất bại"}: ${(
                    //     percent * 100
                    //   ).toFixed(1)}%`
                    // }
                  >
                    {bookingSuccessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Period Revenue with Filter */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Doanh thu theo thời gian</CardTitle>
              <CardDescription>
                Theo dõi doanh thu của từng venue
              </CardDescription>
            </div>
            <Select
              value={revenueFilter}
              onValueChange={(value: OwnerFilterType) =>
                setRevenueFilter(value)
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LAST_7_DAYS">7 ngày</SelectItem>
                <SelectItem value="LAST_30_DAYS">30 ngày</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {periodRevenueData.length > 0 ? (
              <ChartContainer
                config={revenueChartConfig}
                className="h-[300px] w-full"
              >
                <LineChart data={periodRevenueData} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="periodLabel"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-1">
                              <div className="font-medium text-xs">
                                {payload[0].payload.periodLabel}
                              </div>
                              {payload.map((entry: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-[10px]"
                                >
                                  <div
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="flex-1 truncate max-w-[80px]">
                                    {entry.dataKey === "total"
                                      ? "Tổng"
                                      : uniqueVenues.find(
                                          (v) =>
                                            `venue_${v.venueId}` ===
                                            entry.dataKey
                                        )?.venueName || entry.dataKey}
                                  </span>
                                  <span className="font-bold">
                                    {formatCurrency(entry.value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {uniqueVenues.map((venue) => (
                    <Line
                      key={venue.venueId}
                      type="monotone"
                      dataKey={`venue_${venue.venueId}`}
                      stroke={venue.color}
                      strokeWidth={2}
                      dot={false}
                      name={venue.venueName}
                    />
                  ))}
                  <Legend
                    content={({ payload }) => (
                      <div className="flex flex-wrap gap-2 justify-center mt-2">
                        {payload?.map((entry: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 text-[10px]"
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="truncate max-w-[60px]">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3: Venue Revenue & Top Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Order Count Over Time Line Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Số lượng đơn đặt theo thời gian</CardTitle>
              <CardDescription>Theo dõi số lượng đơn đặt hàng</CardDescription>
            </div>
            <Select
              value={orderFilter}
              onValueChange={(value: OwnerFilterType) =>
                setOrderFilter(value)
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LAST_7_DAYS">7 ngày</SelectItem>
                <SelectItem value="LAST_30_DAYS">30 ngày</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {periodBookingData.length > 0 ? (
              <ChartContainer
                config={bookingChartConfig}
                className="h-[350px] w-full"
              >
                <LineChart data={periodBookingData} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="periodLabel"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-1">
                              <div className="font-medium text-xs">
                                {payload[0].payload.periodLabel}
                              </div>
                              {payload.map((entry: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-[10px]"
                                >
                                  <div
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="flex-1 truncate max-w-[80px]">
                                    {entry.dataKey === "total"
                                      ? "Tổng"
                                      : uniqueBookingVenues.find(
                                          (v) =>
                                            `venue_${v.venueId}` ===
                                            entry.dataKey
                                        )?.venueName || entry.dataKey}
                                  </span>
                                  <span className="font-bold">
                                    {entry.value} đơn
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {uniqueBookingVenues.map((venue) => (
                    <Line
                      key={venue.venueId}
                      type="monotone"
                      dataKey={`venue_${venue.venueId}`}
                      stroke={venue.color}
                      strokeWidth={2}
                      dot={false}
                      name={venue.venueName}
                    />
                  ))}
                  <Legend
                    content={({ payload }) => (
                      <div className="flex flex-wrap gap-2 justify-center mt-2">
                        {payload?.map((entry: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 text-[10px]"
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="truncate max-w-[60px]">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Fields by Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Top 5 sân doanh thu cao nhất</CardTitle>
              <CardDescription>
                Xếp hạng sân theo tổng doanh thu
              </CardDescription>
            </div>
            <Select
              value={topFieldsFilter}
              onValueChange={(value: OwnerFilterType) =>
                setTopFieldsFilter(value)
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Chọn thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LAST_7_DAYS">7 ngày qua</SelectItem>
                <SelectItem value="LAST_30_DAYS">30 ngày qua</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {topFieldsData.length > 0 ? (
              <ChartContainer
                config={topFieldsChartConfig}
                className="h-[350px] w-full"
              >
                <BarChart
                  key={topFieldsFilter}
                  data={topFieldsData}
                  layout="vertical"
                  margin={{ left: 10, right: 10 }}
                  accessibilityLayer
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCompactNumber}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={90}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <span className="font-bold">
                            {formatCurrency(value as number)}
                          </span>
                        )}
                        labelFormatter={(label, payload) =>
                          payload?.[0]?.payload?.fullName || label
                        }
                      />
                    }
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {topFieldsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
