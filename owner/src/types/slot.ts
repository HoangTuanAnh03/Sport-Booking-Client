export interface CourtSlots {
  id: number;
  startTime: string | { hour: number; minute: number };
  endTime: string | { hour: number; minute: number };
  status: "PAID" | "LOCK" | "HOLD" | "AVAILABLE";
  isMerge: boolean;
  price: number;
}

export interface Court {
  id: number;
  name: string;
  status: "ENABLE" | "UNABLE" | "DELETED";
  slots: CourtSlots[];
}

export interface FieldSlotsResponse {
  id: number;
  name: string;
  monthLimit: number;
  status: "ENABLE" | "UNABLE" | "DELETED";
  openTime: string | { hour: number; minute: number };
  closeTime: string | { hour: number; minute: number };
  minBookingMinutes: number;
  courts: Court[];
}

export interface LockCourtSlotRequest {
  date: string; // Format: "YYYY-MM-DD"
  fieldId: number;
  courts: {
    id: number;
    timeSlots: {
      id: number;
      startTime: string; // Format: "hh:mm:ss"
      endTime: string; // Format: "hh:mm:ss"
    }[];
  }[];
}

export interface UnlockCourtSlotRequest {
  date: string; // Format: "YYYY-MM-DD"
  fieldId: number;
  courts: {
    id: number;
    slotIds: number[];
  }[];
}

export interface MergeCourtSlotRequest {
  startTime: string; // Format: "hh:mm:ss"
  endTime: string; // Format: "hh:mm:ss"
  date: string; // Format: "YYYY-MM-DD"
  courtId: number;
}
