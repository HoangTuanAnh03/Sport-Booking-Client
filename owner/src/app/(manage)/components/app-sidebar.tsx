"use client";
import {
  House,
  UserCircle2,
  MapPinned,
  Swords,
  CircleDollarSign,
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  PlusIcon,
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
import { NavUser } from "@/app/(manage)/components/nav-user";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { NavMain } from "@/app/(manage)/components/nav-main";
import { useGetMyVenuesQuery } from "@/queries/useVenue";
import { AddVenueDialog } from "@/components/AddVenueDialog";
import { Button } from "@/components/ui/button";

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
    title: "Quản lý lịch đặt",
    url: "/payments",
    icon: CircleDollarSign,
  },
];

export function AppSidebar() {
  const [itemCurrent, setItemCurrent] = useState<Item>();
  const [isAddVenueDialogOpen, setIsAddVenueDialogOpen] = useState(false);
  const { data: venues, isLoading, error } = useGetMyVenuesQuery();

  useEffect(() => {
    const href = "/" + window.location.href.split("/")[3];
    setItemCurrent(items.find((item) => href.startsWith(item.url)));
  }, []);

  const data = {
    navMain: [
      {
        title: "Quản lý địa điểm",
        url: "#",
        icon: SquareTerminal,
        isActive: false,
        items: isLoading
          ? [{ title: "Đang tải...", url: "#" }]
          : error
          ? [{ title: "Lỗi tải dữ liệu", url: "#" }]
          : [
              ...(venues?.map((venue) => ({
                title: venue.name,
                url: `/venues/${venue.id}`,
              })) || []),
              {
                title: "Thêm địa điểm",
                url: "#",
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  setIsAddVenueDialogOpen(true);
                },
              },
            ],
      },
    ],
  };

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
      <SidebarContent className="gap-0">
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
                    // className={`hover:bg-[#f7e6e6] ${
                    //   item === itemCurrent
                    //     ? "text-[#ed1b2f] bg-red-200 "
                    //     : "text-gray-500 "
                    // }`}
                  >
                    <Link href={item.url}>
                      <item.icon
                      // className={`${
                      //   item === itemCurrent
                      //     ? "text-[#ed1b2f]"
                      //     : "text-gray-500"
                      // }`}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <NavMain items={data.navMain} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      {/* Add Venue Dialog */}
      <AddVenueDialog
        open={isAddVenueDialogOpen}
        onOpenChange={setIsAddVenueDialogOpen}
      />
    </Sidebar>
  );
}
