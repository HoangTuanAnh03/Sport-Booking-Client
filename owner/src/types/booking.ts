export interface BookingOwnerResponse {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar: string | null;
  venueId: number;
  fieldId: number;
  venueName: string;
  venueAddress: string;
  venuePhoneNumber: string;
  customerName: string;
  customerPhoneNumber: string;
  note: string | null;
  status: BookingStatus;
  imageUrl: string | null;
  detail: BookingDetail;
  createdAt: string;
}

export enum BookingStatus {
  PENDING = "PENDING",
  EXPIRED = "EXPIRED",
  CUSTOMER_CANCELED = "CUSTOMER_CANCELED",
  OWNER_CANCELED = "OWNER_CANCELED",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
}

export interface BookingTimeSlot {
  startTime: string;
  endTime: string;
  price: number;
}

export interface BookingCourt {
  id: number;
  name: string;
  slots: BookingTimeSlot[];
}

export interface BookingService {
  name: string;
  pricePerUnit: number;
  quantity: number;
}

export interface BookingDetail {
  date: string;
  totalAmount: number;
  courts: BookingCourt[];
  services?: BookingService[];
}
