export enum NotificationType {
  SYSTEM = "SYSTEM",
  BOOKING = "BOOKING",
}

export enum NotificationStatus {
  SENT = "SENT",
  READ = "READ",
  HIDDEN = "HIDDEN",
}

export interface NotificationResponse {
  id: number;
  type: NotificationType | string;
  title: string;
  content: string;
  path: string;
  venueId: number;
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
}
