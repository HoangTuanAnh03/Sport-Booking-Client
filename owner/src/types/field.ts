export interface FieldOwnerResponse {
  id: number;
  name: string;
  monthLimit: number;
  sportTypeId: number;
  minBookingMinutes: number;
  sportTypeName: string;
  status: "ENABLE" | "UNABLE" | "DELETED";
  openingHours: {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
  }[];
  courts: CourtResponse[];
}

export interface CourtResponse {
  id: number;
  name: string;
  status: "ENABLE" | "UNABLE" | "DELETED";
  defaultPrice: number;
  dailyPricing: {
    dayOfWeek: string;
    prices: {
      startTime: string;
      endTime: string;
      price: number;
    }[];
  }[];
}

export interface UpdateFieldRequest {
  name: string;
  monthLimit: number;
  defaultOpenTime: string;
  defaultCloseTime: string;
  status: "ENABLE" | "UNABLE" | "DELETED"; // Added back status field
  openingHours: {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
  }[];
  // minBookingMinutes is removed since it's not editable
}

export interface CreateFieldRequest {
  name: string;
  monthLimit: number;
  minBookingMinutes: number;
  sportTypeId: number;
  venueId: number;
  defaultOpenTime: string;
  defaultCloseTime: string;
  openingHours: {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
  }[];
}

export interface UpdateCourtRequest {
  name: string;
  defaultPrice: number;
  status: "ENABLE" | "UNABLE" | "DELETED";
  dailyPricing: {
    dayOfWeek: string;
    prices: {
      startTime: string;
      endTime: string;
      price: number;
    }[];
  }[];
}

export interface CreateCourtRequest {
  name: string;
  fieldId: number;
  defaultPrice: number;
  dailyPricing: {
    dayOfWeek: string;
    prices: {
      startTime: string;
      endTime: string;
      price: number;
    }[];
  }[];
}

// Court Slots Types
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
