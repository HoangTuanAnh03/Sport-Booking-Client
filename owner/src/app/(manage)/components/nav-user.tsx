"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/components/app-provider";
import { ButtonLogout } from "@/app/(manage)/components/ButtonLogout";
import { Skeleton } from "@/components/ui/skeleton";

export function NavUser() {
  const { isMobile } = useSidebar();
  const name = useAppStore((state) => state.name);
  const image = useAppStore((state) => state.avatarUrl);
  const email = useAppStore((state) => state.email);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-12 w-12 rounded-lg">
                <AvatarImage
                  className="object-cover"
                  src={image && image !== "" ? image : undefined}
                  alt={name}
                />
                <AvatarFallback className="rounded-lg">
                  {name
                    ? name
                        .split(" ")
                        .slice(-2)
                        .map((word) => word.charAt(0))
                        .join("")
                        .toUpperCase()
                    : "N/A"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {name ? (
                  <span className="truncate font-semibold">{name}</span>
                ) : (
                  <Skeleton className="h-4 w-full" />
                )}
                {email ? (
                  <span className="truncate text-xs">{email}</span>
                ) : (
                  <Skeleton className="h-3 w-3/4 mt-1" />
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage
                    className="object-cover"
                    src={image && image !== "" ? image : undefined}
                    alt={name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {name
                      ? name
                          .split(" ")
                          .slice(-2)
                          .map((word) => word.charAt(0))
                          .join("")
                          .toUpperCase()
                      : "N/A"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {name ? (
                    <span className="truncate font-semibold">{name}</span>
                  ) : (
                    <Skeleton className="h-4 w-full" />
                  )}
                  {email ? (
                    <span className="truncate text-xs">{email}</span>
                  ) : (
                    <Skeleton className="h-3 w-3/4 mt-1" />
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              <ButtonLogout />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
