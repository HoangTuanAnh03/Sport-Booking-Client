"use client";
import {
  House,
  UserCircle2,
  MapPinned,
  Swords,
  CircleDollarSign,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavUser } from "@/app/(manager)/components/nav-user";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type Item = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGAttributes<SVGElement>>;
};

const items: Item[] = [
  {
    title: "Bảng điều khiển",
    url: "/dashboard",
    icon: House,
  },
  {
    title: "Quản lý người dùng",
    url: "/users",
    icon: UserCircle2,
  },
  {
    title: "Quản lý loại thể thao",
    url: "/sport-types",
    icon: Swords,
  },
  {
    title: "Quản lý địa điểm",
    url: "/venues",
    icon: MapPinned,
  },
  {
    title: "Quản lý thanh toán",
    url: "/payments",
    icon: CircleDollarSign,
  },
];

export function AppSidebar() {
  const [itemCurrent, setItemCurrent] = useState<Item>();

  useEffect(() => {
    const href = "/" + window.location.href.split("/")[3];
    setItemCurrent(items.find((item) => href.startsWith(item.url)));
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-[56px] flex items-center justify-center">
        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent group-data-[state=collapsed]:hidden">
          Sport Booking
        </span>
        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent hidden group-data-[state=collapsed]:block">
          S
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  onClick={() => setItemCurrent(item)}
                >
                  <SidebarMenuButton
                    asChild
                    size={"md"}
                    className={`hover:bg-[#f7e6e6] ${
                      item === itemCurrent
                        ? "text-[#ed1b2f] bg-red-200 "
                        : "text-gray-500 "
                    }`}
                  >
                    <Link href={item.url}>
                      <item.icon
                        className={`${
                          item === itemCurrent
                            ? "text-[#ed1b2f]"
                            : "text-gray-500"
                        }`}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
