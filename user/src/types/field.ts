export type OpeningHour = {
  field_id: string;
  day_of_week: string;
  opening_time: string;
  closing_time: string;
};

export type Field = {
  field_id: string;
  venue_id: string;
  sport_type_id: number;
  field_name: string;
  default_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  opening_hour_today?: OpeningHour;
};

export interface FieldById {
  id: number;
  name: string;
  monthLimit: number;
  sportTypeId: number;
  venueId: number;
  minBookingMinutes: number;
  sportTypeName: string;
  status: "ENABLE" | "UNABLE" | "DELETED";
  openingHours: {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
  }[];
}

export type FieldsByVenueId = {
  fields: FieldByVenueId[];
};

export type FieldByVenueId = {
  id: number;
  name: string;
  sportTypeId: number;
};

export type CourtSlotsByField = {
  id: number;
  name: string;
  monthLimit: number;
  minBookingMinutes: number;
  status: FieldStatus;
  openTime: string;
  closeTime: string;
  courts: CourtByField[];
};

export type CourtByField = {
  id: number;
  name: string;
  status: CourtStatus;
  slots: CourtSlots[];
};

export type CourtSlots = {
  id: number;
  startTime: string;
  endTime: string;
  status: CourtSlotStatus;
  isMerge: boolean;
  price: number;
  bookingId: string;
};

export enum CourtSlotStatus {
  PAID = "PAID",
  LOCK = "LOCK",
  HOLD = "HOLD",
  AVAILABLE = "AVAILABLE",
}

export enum CourtStatus {
  ENABLE = "ENABLE",
  UNABLE = "UNABLE",
  DELETED = "DELETED",
}

export enum FieldStatus {
  ENABLE = "ENABLE",
  UNABLE = "UNABLE",
  DELETED = "DELETED",
}
