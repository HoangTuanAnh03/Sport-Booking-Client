import { ButtonLogout } from "@/components/layout/components/ButtonLogout";
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
import Link from "next/link";
import { HelpCircle, BookOpen, LogOut, User } from "lucide-react";
import { useAppStore } from "@/components/app-provider";

export function AvatarOption() {
  const name = useAppStore((state) => state.name);
  const avatarUrl = useAppStore((state) => state.avatarUrl);
  const noPassword = useAppStore((state) => state.noPassword);

  // Generate initials from name
  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .slice(-2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="select-none cursor-pointer">
            <AvatarImage
              src={
                avatarUrl && avatarUrl !== ""
                  ? avatarUrl
                  : "/default_avatar.png"
              }
              alt={name || "User"}
            />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-2" align="end">
          <DropdownMenuLabel className="flex items-center gap-3 p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  avatarUrl && avatarUrl !== ""
                    ? avatarUrl
                    : "/default_avatar.png"
                }
                alt={name || "User"}
              />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-base">
                {name || "Người dùng"}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="p-3 cursor-pointer">
              <Link href="/user/profile" className="w-full ">
                <User className="h-4 w-4 mr-3" />
                Xem hồ sơ
              </Link>
            </DropdownMenuItem>
            {noPassword && (
              <DropdownMenuItem asChild className="p-3 cursor-pointer">
                <Link href="/user/change-password" className="w-full ">
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Đổi mật khẩu
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="p-3 cursor-pointer">
              <Link href="/booking/list" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-3" />
                <span>Lịch sử đặt</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="p-3 cursor-pointer">
            <LogOut className="h-4 w-4 mr-3" />
            <ButtonLogout />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
