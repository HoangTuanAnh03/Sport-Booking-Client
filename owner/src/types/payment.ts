export interface CourtDetail {
  sportTypeId: number;
  sportTypeName: string;
  numberOfCourts: number;
  pricePerCourt: number;
  totalAmount: number;
}

export interface VenuePayment {
  venueId: number;
  venueName: string;
  address: string;
  phoneNumber: string;
  status: "PENDING" | "ENABLE" | "DISABLE";
  isPaidThisMonth: boolean;
  totalAmountToPay: number;
  courtDetails: CourtDetail[];
}

export interface VenuePaymentResponse {
  code: number;
  data: VenuePayment[];
}

export interface CreatePaymentRequest {
  venueIds: number[];
  returnUrl: string;
  cancelUrl: string;
}

export interface CreatePaymentResponse {
    paymentUrl: string;
}

// Payment history types
export interface PaymentHistoryItem {
  name: string;
  amount: number;
  quantity: number;
  perPrice: number;
}

export interface PaymentHistoryDetail {
  venueName: string;
  totalAmount: number;
  items: PaymentHistoryItem[];
}

export interface PaymentHistory {
  id: number;
  code: number;
  amount: number;
  details: PaymentHistoryDetail[];
  message: string;
  status: "PAID" | "PENDING" | "FAILED" | "CANCELLED";
  createdAt: string;
}

