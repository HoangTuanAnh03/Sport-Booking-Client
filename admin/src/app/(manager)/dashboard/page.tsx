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
  useGetSystemStatisticsQuery,
  useGetTopVenuesQuery,
} from "@/queries/useStatistics";
import { FilterType } from "@/types/statistics";
import { useState } from "react";
import { Users, Building2, UserCheck, Dumbbell, Loader2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Colors for charts
const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

// Chart configs
const paymentChartConfig = {
  paid: {
    label: "Đã thanh toán",
    color: "#22c55e",
  },
  unpaid: {
    label: "Chưa thanh toán",
    color: "#ef4444",
  },
} satisfies ChartConfig;

const sportTypeChartConfig = {
  courts: {
    label: "Số sân",
    color: "#3b82f6",
  },
  venues: {
    label: "Số địa điểm",
    color: "#22c55e",
  },
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

const bookingsChartConfig = {
  bookings: {
    label: "Số đơn đặt",
    color: "#8b5cf6",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [revenueFilter, setRevenueFilter] = useState<FilterType>("THIS_MONTH");
  const [bookingsFilter, setBookingsFilter] = useState<FilterType>("THIS_MONTH");

  const { data: onlineStats, isLoading: isLoadingOnline } =
    useGetOnlineStatisticsQuery();
  const { data: systemStats, isLoading: isLoadingSystem } =
    useGetSystemStatisticsQuery();
  const { data: topRevenueStats, isLoading: isLoadingTopRevenue } =
    useGetTopVenuesQuery(revenueFilter);
  const { data: topBookingsStats, isLoading: isLoadingTopBookings } =
    useGetTopVenuesQuery(bookingsFilter);

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

  // Prepare payment pie chart data
  const paymentChartData = systemStats?.paymentStatistics
    ? [
        {
          name: "paid",
          value: systemStats.paymentStatistics.paidVenueCount,
          amount: systemStats.paymentStatistics.paidAmount,
          fill: "#22c55e",
        },
        {
          name: "unpaid",
          value: systemStats.paymentStatistics.unpaidVenueCount,
          amount: systemStats.paymentStatistics.pendingAmount,
          fill: "#ef4444",
        },
      ]
    : [];

  // Prepare sport type bar chart data
  const sportTypeChartData =
    systemStats?.sportTypeStatistics?.map((stat) => ({
      name: stat.sportTypeName,
      courts: stat.totalCourts,
      venues: stat.venueCount,
    })) || [];

  // Prepare top venues by revenue data
  const topRevenueData =
    topRevenueStats?.topVenuesByRevenue?.slice(0, 5).map((venue, index) => ({
      name:
        venue.venueName.length > 15
          ? venue.venueName.substring(0, 15) + "..."
          : venue.venueName,
      fullName: venue.venueName,
      revenue: venue.totalRevenue,
      bookings: venue.bookingCount,
      fill: COLORS[index % COLORS.length],
    })) || [];

  // Prepare top venues by booking count data
  const topBookingsData =
    topBookingsStats?.topVenuesByBookingCount?.slice(0, 5).map(
      (venue, index) => ({
        name:
          venue.venueName.length > 15
            ? venue.venueName.substring(0, 15) + "..."
            : venue.venueName,
        fullName: venue.venueName,
        revenue: venue.totalRevenue,
        bookings: venue.bookingCount,
        fill: COLORS[index % COLORS.length],
      })
    ) || [];

  if (isLoadingSystem) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-4 pt-4">
      {/* <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h2>
      </div> */}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Online Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Người dùng online
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
            <CardTitle className="text-sm font-medium">Tổng địa điểm</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(systemStats?.totalVenues || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(systemStats?.totalActiveVenues || 0)} địa điểm đang hoạt
              động
            </p>
          </CardContent>
        </Card>

        {/* Total Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng người dùng
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(systemStats?.totalUsers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Trong hệ thống</p>
          </CardContent>
        </Card>

        {/* Sport Types Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loại thể thao</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(systemStats?.totalSportTypes || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Thể loại</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Payment Pie Chart & Sport Type Bar Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Payment Statistics Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tỉ lệ thanh toán</CardTitle>
            <CardDescription>
              Thống kê địa điểm đã thanh toán và chưa thanh toán
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentChartData.length > 0 ? (
              <ChartContainer
                config={paymentChartConfig}
                className="mx-auto aspect-square h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex items-center gap-2">
                            <span>
                              {name === "paid"
                                ? "Đã thanh toán"
                                : "Chưa thanh toán"}
                              :
                            </span>
                            <span className="font-bold">
                              {String(value)} venue
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={paymentChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    // label={({ name, percent }) =>
                    //   `${name === "paid" ? "Đã TT" : "Chưa TT"}: ${(
                    //     percent * 100
                    //   ).toFixed(0)}%`
                    // }
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sport Type Statistics Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Số sân theo thể loại</CardTitle>
            <CardDescription>
              Thống kê số sân và địa điểm theo từng môn thể thao
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sportTypeChartData.length > 0 ? (
              <ChartContainer
                config={sportTypeChartConfig}
                className="h-[300px] w-full"
              >
                <BarChart data={sportTypeChartData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="courts"
                    fill="var(--color-courts)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="venues"
                    fill="var(--color-venues)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Top Venues */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top 5 Venues by Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Top 5 địa điểm doanh thu cao nhất</CardTitle>
              <CardDescription>
                Xếp hạng địa điểm theo tổng doanh thu
              </CardDescription>
            </div>
            <Select
              value={revenueFilter}
              onValueChange={(value: FilterType) => setRevenueFilter(value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Chọn thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAY">Hôm nay</SelectItem>
                <SelectItem value="THIS_MONTH">Tháng này</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoadingTopRevenue ? (
              <div className="flex items-center justify-center h-[350px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : topRevenueData.length > 0 ? (
              <ChartContainer
                config={revenueChartConfig}
                className="h-[350px] w-full"
              >
                <BarChart
                  key={revenueFilter}
                  data={topRevenueData}
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
                    width={100}
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
                    {topRevenueData.map((entry, index) => (
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

        {/* Top 5 Venues by Booking Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Top 5 địa điểm nhiều đơn đặt nhất</CardTitle>
              <CardDescription>
                Xếp hạng địa điểm theo số lượng đơn đặt
              </CardDescription>
            </div>
            <Select
              value={bookingsFilter}
              onValueChange={(value: FilterType) => setBookingsFilter(value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Chọn thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAY">Hôm nay</SelectItem>
                <SelectItem value="THIS_MONTH">Tháng này</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoadingTopBookings ? (
              <div className="flex items-center justify-center h-[350px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : topBookingsData.length > 0 ? (
              <ChartContainer
                config={bookingsChartConfig}
                className="h-[350px] w-full"
              >
                <BarChart
                  key={bookingsFilter}
                  data={topBookingsData}
                  layout="vertical"
                  margin={{ left: 10, right: 10 }}
                  accessibilityLayer
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <span className="font-bold">
                            {formatNumber(value as number)} đơn
                          </span>
                        )}
                        labelFormatter={(label, payload) =>
                          payload?.[0]?.payload?.fullName || label
                        }
                      />
                    }
                  />
                  <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
                    {topBookingsData.map((entry, index) => (
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
