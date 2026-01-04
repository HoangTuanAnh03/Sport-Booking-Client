// Statistics Types

export interface OnlineStatistics {
  totalOnlineUsers: number;
}

export interface PaymentStatistics {
  paidVenueCount: number;
  paidAmount: number;
  unpaidVenueCount: number;
  pendingAmount: number;
}

export interface SportTypeStatistics {
  sportTypeId: number;
  sportTypeName: string;
  totalCourts: number;
  venueCount: number;
}

export interface SystemStatistics {
  totalVenues: number;
  totalActiveVenues: number;
  totalUsers: number;
  totalSportTypes: number;
  paymentStatistics: PaymentStatistics;
  sportTypeStatistics: SportTypeStatistics[];
}

export interface TopVenue {
  venueId: number;
  venueName: string;
  venueAddress: string;
  venueAvatar: string;
  totalRevenue: number;
  bookingCount: number;
  rank: number;
}

export type FilterType = "TODAY" | "THIS_MONTH";

export interface TopVenuesStatistics {
  filterType: FilterType;
  topVenuesByRevenue: TopVenue[];
  topVenuesByBookingCount: TopVenue[];
}
