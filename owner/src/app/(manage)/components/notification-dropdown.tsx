"use client";

import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useGetUnreadCount,
  useGetUserNotifications,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/queries/useNotification";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { NotificationResponse, NotificationStatus } from "@/types/notification";
import { getAccessTokenFormLocalStorage } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
  const [isAuth, setIsAuth] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getAccessTokenFormLocalStorage();
      if (token) {
        setIsAuth(true);
      }
    }
  }, []);

  const pagination = useMemo(() => ({ pageNo: 0, pageSize: 20 }), []);
  const { data: unreadCountData } = useGetUnreadCount();
  const { data: notificationsData } = useGetUserNotifications(pagination);

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const deleteNotificationMutation = useDeleteNotificationMutation();

  const unreadCount = unreadCountData?.payload?.data || 0;
  const notifications = notificationsData?.payload?.content || [];

  const handleNotificationClick = (notification: NotificationResponse) => {
    if (notification.status === NotificationStatus.SENT) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.path) {
      router.push(notification.path);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  if (!isAuth) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Thông báo</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto p-1"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Đánh dấu đã đọc
            </Button>
          )}
        </div>
        <div className="h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Không có thông báo
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-1 p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors relative group",
                    notification.status === NotificationStatus.SENT
                      ? "bg-muted/20"
                      : ""
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium text-sm line-clamp-2 pr-4">
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.content}
                  </p>
                  {notification.status === NotificationStatus.SENT && (
                    <span className="absolute top-4 right-2 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(e, notification.id)}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
