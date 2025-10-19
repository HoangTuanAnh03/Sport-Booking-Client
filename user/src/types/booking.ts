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
  services: Array<{
    id: number;
    quantity: number;
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

export type Booking = {
  id: string; // uuid
  userId: string;
  venueId: number;
  venueName: string;
  venueAddress: string;
  venuePhoneNumber: string;
  venueBankName: string;
  venueBankNumber: string;
  venueBankHolderName: string;
  customerName: string;
  customerPhoneNumber: string;
  note?: string | null;
  status: BookingStatus | string;
  imageUrl?: string | null;
  detail: BookingDetail;
  createdAt: string; // ISO timestamp
};

export type BookingDetail = {
  totalAmount: number;
  date: string; // ISO date string (e.g., "2025-10-18")
  courts: BookingCourt[];
  services: BookingService[];
};

export type BookingCourt = {
  id: number;
  name: string;
  slots: BookingSlot[];
};

export type BookingSlot = {
  price: number;
  startTime: string; // e.g., "10:30"
  endTime: string; // e.g., "11:00"
};

export type BookingService = {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
};
