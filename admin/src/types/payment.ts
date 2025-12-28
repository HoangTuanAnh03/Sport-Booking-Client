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
  status: "PAID" | "PENDING" | "CANCELLED";
  createdAt: string;
}
