import http from "@/utils/api";
import { NotificationResponse } from "@/types/notification";
import envConfig from "@/config";

const notificationApiRequest = {
  getUserNotifications: (params?: { pageNo?: number; pageSize?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.pageNo !== undefined)
      queryParams.append("page", params.pageNo.toString());
    if (params?.pageSize !== undefined)
      queryParams.append("size", params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/notifications?${queryString}`
      : `/notifications`;

    return http.get<PagingResponse<NotificationResponse>>(url, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    });
  },

  getUnreadNotifications: () =>
    http.get<IBackendRes<NotificationResponse[]>>(`/notifications/unread`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),

  getUnreadCount: () =>
    http.get<IBackendRes<number>>(`/notifications/unread-count`, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),

  markAsRead: (notificationId: number) =>
    http.put<IBackendRes<NotificationResponse>>(
      `/notifications/${notificationId}/mark-read`,
      null,
      {
        baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
      }
    ),

  markAllAsRead: () =>
    http.put<IBackendRes<void>>(`/notifications/mark-all-read`, null, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),

  deleteNotification: (notificationId: number) =>
    http.delete<IBackendRes<void>>(`/notifications/${notificationId}`, null, {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),
};

export default notificationApiRequest;
