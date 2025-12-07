"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { NotificationDropdown } from "@/app/(manage)/components/notification-dropdown";

// Mapping routes to breadcrumb titles
const routeConfig: Record<string, { parent: string; title: string }> = {
  "/venues": { parent: "Quản lý", title: "Sân thể thao" },
  "/bookings": { parent: "Quản lý", title: "Đặt sân" },
  "/slots": { parent: "Quản lý", title: "Khung giờ" },
  "/payment": { parent: "Quản lý", title: "Thanh toán" },
};

export function AppHeader() {
  const pathname = usePathname();

  // Get the current route config or use default
  const currentRoute = routeConfig[pathname] || {
    parent: "Trang chủ",
    title: pathname.replace("/", "") || "Dashboard",
  };

  return (
    <header className="flex justify-between h-16 shrink-0 items-center gap-2 px-4">
      <div className="flex items-center">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">{currentRoute.parent}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentRoute.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        {/* <Link href={"/chat"}><Chat /></Link> */}
        <NotificationDropdown />
      </div>
    </header>
  );
}
