"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn, getAccessTokenFormLocalStorage } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { useAppStore } from "@/components/app-provider";
import { AvatarOption } from "@/components/layout/components/AvatarOption";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const isAuth = useAppStore((state) => state.isAuth);
  // console.log("🚀 ~ Header ~ isAuth:", isAuth);

  const accessToken = getAccessTokenFormLocalStorage();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const routes = [
    {
      href: "/",
      label: "Trang chủ",
      active: pathname === "/",
    },
    {
      href: "/maps",
      label: "Bản đồ",
      active: pathname === "/maps",
    },
    {
      href: "/about",
      label: "Giới thiệu",
      active: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Liên hệ",
      active: pathname === "/contact",
    },
  ];

  return (
    <header className="border-b sticky">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Sport Booking
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavigationMenu>
            <NavigationMenuList>
              {routes.map((route) => (
                <NavigationMenuItem key={route.href}>
                  <Link href={route.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        route.active
                          ? "bg-accent text-accent-foreground font-medium"
                          : ""
                      )}
                    >
                      {route.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div className="w-[250px] h-[40px] flex items-center justify-end space-x-2">
          {hydrated &&
            (accessToken ? (
              <AvatarOption />
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">
                    <span lang="vi">Đăng nhập</span>
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register">
                    <span lang="vi">Đăng ký</span>
                  </Link>
                </Button>
              </>
            ))}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden space-x-2">
          <ModeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      route.active ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" asChild>
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Đăng ký</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
