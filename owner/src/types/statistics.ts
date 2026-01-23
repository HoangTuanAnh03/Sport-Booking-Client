// Owner Statistics Types

// Filter types
export type OwnerFilterType = "YESTERDAY" | "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH" | "LAST_MONTH";

// Online Statistics
export interface OnlineUsersByVenue {
  venueId: number;
  venueName: string;
  onlineUsersCount: number;
}

export interface OnlineStatistics {
  totalOnlineUsers: number;
  onlineUsersByVenue: OnlineUsersByVenue[];
}

// Venue Breakdown Item (used in revenue and order statistics)
export interface VenueBreakdownItem {
  venueId: number;
  venueName: string;
  venueAvatar: string;
  revenue?: number; // For revenue statistics
  orderCount?: number; // For order statistics
}

// Period Revenue Item
export interface PeriodRevenue {
  periodLabel: string; // Date label like "2024-01-01"
  revenue: number;
  venueBreakdown: VenueBreakdownItem[];
}

// Revenue Statistics
export interface RevenueStatistics {
  filterType: string;
  totalRevenue: number;
  venueRevenues: VenueBreakdownItem[];
  periodRevenues: PeriodRevenue[];
}

// Period Order Item
export interface PeriodOrder {
  periodLabel: string;
  orderCount: number;
  venueBreakdown: VenueBreakdownItem[];
}

// Order Statistics
export interface OrderStatistics {
  filterType: string;
  totalOrders: number;
  venueOrders: VenueBreakdownItem[];
  periodOrders: PeriodOrder[];
}

// Top Field Item
export interface TopField {
  fieldId: number;
  fieldName: string;
  venueId: number;
  venueName: string;
  totalRevenue: number;
  rank: number;
}

// Daily Revenue Chart Statistics
export interface DailyPoint {
  date: string;
  revenue: number;
  bookingCount: number;
}

export interface VenueDailyRevenue {
  venueId: number;
  venueName: string;
  venueAvatar: string;
  totalRevenue: number;
  totalBookings: number;
  dailyData: DailyPoint[];
}

export interface DailyRevenueChartData {
  filterType: string;
  totalRevenue: number;
  totalBookings: number;
  venueData: VenueDailyRevenue[];
}

// Basic Statistics
export interface BasicStatistics {
  totalVenues: number;
  totalCourts: number;
  averageRating: number;
  bookingSuccessRate: number;
}

// Dashboard Statistics
export interface DashboardStatistics {
  revenueStatistics: RevenueStatistics;
  topFieldsByRevenue: TopField[];
  orderStatistics: OrderStatistics;
}

// Dashboard Query Params
export interface DashboardQueryParams {
  revenueFilterType?: OwnerFilterType;
  topFieldsFilterType?: OwnerFilterType;
  orderFilterType?: OwnerFilterType;
}
