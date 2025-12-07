import notificationApiRequest from "@/apiRequests/notification";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetUserNotifications = (params?: {
  pageNo?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationApiRequest.getUserNotifications(params),
  });
};

export const useGetUnreadNotifications = () => {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationApiRequest.getUnreadNotifications(),
  });
};

export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationApiRequest.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationApiRequest.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApiRequest.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationApiRequest.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
