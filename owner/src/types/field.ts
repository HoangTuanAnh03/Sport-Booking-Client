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
