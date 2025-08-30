"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/components/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  Shield,
  Loader2,
  Camera,
  Lock,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useMyInfoQuery, useUpdateUserMutation } from "@/queries/useUser";
import { UpdateUserBody } from "@/schemaValidations/user.schema";
import { useUploadVenueImageMutation } from "@/queries/useVenue";

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: userInfo, isLoading, error, refetch } = useMyInfoQuery();
  const updateUserMutation = useUpdateUserMutation();
  const uploadImageMutation = useUploadVenueImageMutation();

  const setName = useAppStore((state) => state.setName);
  const setImage = useAppStore((state) => state.setImage);
  const setEmail = useAppStore((state) => state.setEmail);
  const noPassword = useAppStore((state) => state.noPassword);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    avatarUrl: "",
  });

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

  // Update edit form when user info changes
  useEffect(() => {
    if (userInfo) {
      setEditForm({
        name: userInfo.name || "",
        phoneNumber: userInfo.phoneNumber || "",
        avatarUrl: userInfo.avatarUrl || "",
      });

      // Update app store with latest data
      setName(userInfo.name);
      setImage(userInfo.avatarUrl || "");
      setEmail(userInfo.email);
    }
  }, [userInfo, setName, setImage, setEmail]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userInfo) {
      setEditForm({
        name: userInfo.name || "",
        phoneNumber: userInfo.phoneNumber || "",
        avatarUrl: userInfo.avatarUrl || "",
      });
    }
  };

  const handleSave = async () => {
    try {
      // Validate form data
      const validatedData = UpdateUserBody.parse({
        name: editForm.name.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        avatarUrl: editForm.avatarUrl.trim() || "",
      });

      // Use the actual update mutation
      await updateUserMutation.mutateAsync(validatedData);

      // Update app store
      setName(validatedData.name);
      setImage(validatedData.avatarUrl || "");

      setIsEditing(false);
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin thành công",
      });
    } catch (error: any) {
      // Handle validation errors
      if (error.errors) {
        const firstError = error.errors[0];
        toast({
          title: "Lỗi dữ liệu",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra khi cập nhật thông tin",
          variant: "destructive",
        });
      }
      console.error("Error updating user info:", error);
    }
  };

  const handleAvatarClick = () => {
    // Only allow avatar change when in editing mode
    if (!isEditing) {
      return;
    }

    // Create file input and trigger click
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          // Upload image and get URL
          const imageUrl = await uploadImageMutation.mutateAsync(file);

          // Update form with new avatar URL
          setEditForm((prev) => ({
            ...prev,
            avatarUrl: imageUrl,
          }));

          toast({
            title: "Thành công",
            description:
              "Tải ảnh lên thành công. Nhấn Lưu để cập nhật thông tin.",
          });
        } catch (error: any) {
          toast({
            title: "Lỗi",
            description: error.message || "Có lỗi xảy ra khi tải ảnh",
            variant: "destructive",
          });
        }
      }
    };
    fileInput.click();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role?.toUpperCase()) {
      case "USER":
        return "Người dùng";
      case "ADMIN":
        return "Quản trị viên";
      case "MANAGER":
        return "Quản lý";
      case "OWNER":
        return "Chủ sân";
      default:
        return role || "Không xác định";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "destructive";
      case "MANAGER":
        return "default";
      case "OWNER":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="h-9 bg-gray-200 rounded-md w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
        </div>

        <div className="grid gap-6">
          {/* Profile Header Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded-md w-40 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-64 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name field skeleton */}
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                    {/* Email field skeleton */}
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded-md w-40 animate-pulse"></div>
                    </div>
                    {/* Phone field skeleton */}
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                    {/* Role field skeleton */}
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded-md w-20 animate-pulse mt-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded-md w-40 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-56 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded-md w-40 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                </div>
                <div className="h-px bg-gray-200 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-48 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
            <p className="text-muted-foreground mb-4">
              Không thể tải thông tin người dùng
            </p>
            <Button onClick={() => refetch()}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">
            Không tìm thấy thông tin người dùng
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {updateUserMutation.isPending ? "Lưu..." : "Lưu"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
              disabled={updateUserMutation.isPending}
            >
              <X className="h-4 w-4" />
              Hủy
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Profile Header Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>
              Thông tin cá nhân và liên hệ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="relative group" onClick={handleAvatarClick}>
                <Avatar
                  className={`h-24 w-24 shadow-lg ring-4 ring-white border-2 border-gray-100 transition-all duration-200 ${
                    isEditing
                      ? "cursor-pointer hover:ring-blue-300 hover:shadow-xl"
                      : "cursor-not-allowed hover:ring-gray-300"
                  }`}
                >
                  <AvatarImage
                    src={
                      editForm.avatarUrl && editForm.avatarUrl !== ""
                        ? editForm.avatarUrl
                        : userInfo.avatarUrl && userInfo.avatarUrl !== ""
                        ? userInfo.avatarUrl
                        : "/default_avatar.png"
                    }
                    alt={userInfo.name || "User"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {getInitials(userInfo.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Hover overlay */}
                {isEditing && (
                  <>
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center pointer-events-none">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    {/* Click hint */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      Nhấp để đổi ảnh
                    </div>
                  </>
                )}
                {!isEditing && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Nhấn &apos;Chỉnh sửa&apos; để thay đổi
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Họ và tên
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Nhập họ và tên"
                        required
                      />
                    ) : (
                      <p className="text-sm font-medium py-2 px-3 bg-muted rounded-md">
                        {userInfo.name || "Chưa cập nhật"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm font-medium py-2 px-3 bg-muted rounded-md">
                      {userInfo.email || "Chưa cập nhật"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Email không thể thay đổi
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Số điện thoại
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editForm.phoneNumber}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            phoneNumber: e.target.value,
                          }))
                        }
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    ) : (
                      <p className="text-sm font-medium py-2 px-3 bg-muted rounded-md">
                        {userInfo.phoneNumber || "Chưa cập nhật"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Vai trò
                    </Label>
                    <div className="py-2">
                      <Badge variant={getRoleBadgeVariant(userInfo.realmRole)}>
                        {getRoleDisplayName(userInfo.realmRole)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Show message when avatar is changed but not saved */}
                {editForm.avatarUrl !== (userInfo.avatarUrl || "") && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-800">
                        Ảnh đại diện đã thay đổi. Nhấn &quot;Lưu&quot; để cập
                        nhật thông tin.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bổ sung</CardTitle>
            <CardDescription>
              Các thông tin khác về tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium">Trạng thái tài khoản</h3>
                  <p className="text-sm text-muted-foreground">
                    Tài khoản đang hoạt động
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  Đã xác thực
                </Badge>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>
                  ID người dùng:{" "}
                  <span className="font-mono">{userInfo.id || "N/A"}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy Card */}
        {noPassword && (
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật và quyền riêng tư</CardTitle>
              <CardDescription>
                Quản lý các cài đặt bảo mật tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Lock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Mật khẩu</h3>
                      <p className="text-sm text-muted-foreground">
                        Thay đổi mật khẩu đăng nhập của bạn
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/user/change-password")}
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Đổi mật khẩu
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
