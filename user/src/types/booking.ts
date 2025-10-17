export type CreateBookingRequest = {
  date: string; // ISO date string (e.g., "2024-06-10")
  fieldId: number;
  courts: Array<{
    courtId: number;
    timeSlots: Array<{
      id: number;
      startTime: string; // ISO time string (e.g., "14:00:00")
      endTime: string; // ISO time string (e.g., "15:00:00")
    }>;
  }>;
  customerName: string;
  customerPhone: string;
  note?: string;
};

export type ConfirmBookingRequest = {
  bookingId: string;
  imageUrl?: string;
};

export enum BookingStatus {
  PENDING = "PENDING",
  EXPIRED = "EXPIRED",
  CUSTOMER_CANCELED = "CUSTOMER_CANCELED",
  OWNER_CANCELED = "OWNER_CANCELED",
  COMPLETED = "COMPLETED",
}
