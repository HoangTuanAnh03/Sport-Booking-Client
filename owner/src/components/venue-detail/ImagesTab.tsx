"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditVenueImagesDialog } from "@/components/EditVenueImagesDialog";
import { useDeleteVenueImageMutation } from "@/queries/useVenue";
import { VenueImage } from "@/types/venue";

interface ImagesTabProps {
  venueId: number;
  images: VenueImage[];
  onImagesUpdated: () => void;
}

export function ImagesTab({
  venueId,
  images,
  onImagesUpdated,
}: ImagesTabProps) {
  const [editingImageType, setEditingImageType] = useState<
    "AVATAR" | "THUMBNAIL" | "DEFAULT" | null
  >(null);
  const [isEditImagesDialogOpen, setIsEditImagesDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    id: number;
    url: string;
  } | null>(null);
  const [isDeleteImageDialogOpen, setIsDeleteImageDialogOpen] = useState(false);

  const deleteVenueImageMutation = useDeleteVenueImageMutation();

  const getImagesByType = (type: "DEFAULT" | "THUMBNAIL" | "AVATAR") => {
    return images.filter((img) => img.type === type);
  };

  const confirmDeleteImage = () => {
    if (!imageToDelete) return;

    deleteVenueImageMutation.mutate(imageToDelete.id, {
      onSuccess: () => {
        onImagesUpdated();
        setIsDeleteImageDialogOpen(false);
        setImageToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Avatar and Thumbnail Images - Side by Side Layout */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hình ảnh chính</CardTitle>
          </div>
          <CardDescription>
            Ảnh đại diện và thumbnail được hiển thị trong kết quả tìm kiếm và
            bản đồ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Avatar Image */}
            {getImagesByType("AVATAR").length > 0 ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h3 className="font-medium">Ảnh đại diện</h3>
                </div>
                <div className="relative group">
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                    {getImagesByType("AVATAR").map((image) => (
                      <Image
                        key={image.id}
                        src={image.url}
                        alt="Ảnh đại diện"
                        className="w-full h-full object-cover"
                        width={192}
                        height={192}
                      />
                    ))}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <PencilIcon
                        className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => {
                          setEditingImageType("AVATAR");
                          setIsEditImagesDialogOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Ảnh được hiển thị trong kết quả tìm kiếm và trang chi tiết
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h3 className="font-medium">Ảnh đại diện</h3>
                </div>
                <div
                  className="flex flex-col items-center justify-center w-48 h-48 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    setEditingImageType("AVATAR");
                    setIsEditImagesDialogOpen(true);
                  }}
                >
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    Nhấn để tải lên ảnh đại diện
                  </p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Ảnh được hiển thị trong kết quả tìm kiếm và trang chi tiết
                </p>
              </div>
            )}

            {/* Thumbnail Image */}
            {getImagesByType("THUMBNAIL").length > 0 ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h3 className="font-medium">Ảnh thumbnail</h3>
                </div>
                <div className="relative group">
                  <div className="relative w-64 h-40 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                    {getImagesByType("THUMBNAIL").map((image) => (
                      <Image
                        key={image.id}
                        src={image.url}
                        alt="Ảnh thumbnail"
                        className="w-full h-full object-cover"
                        width={256}
                        height={160}
                      />
                    ))}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <PencilIcon
                        className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => {
                          setEditingImageType("THUMBNAIL");
                          setIsEditImagesDialogOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Ảnh được hiển thị trên bản đồ và danh sách thu gọn
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h3 className="font-medium">Ảnh thumbnail</h3>
                </div>
                <div
                  className="flex flex-col items-center justify-center w-64 h-40 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  onClick={() => {
                    setEditingImageType("THUMBNAIL");
                    setIsEditImagesDialogOpen(true);
                  }}
                >
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    Nhấn để tải lên ảnh thumbnail
                  </p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Ảnh được hiển thị trên bản đồ và danh sách thu gọn
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Default Images - Grid Layout with Add and Delete Only */}
      {getImagesByType("DEFAULT").length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                Ảnh mặc định
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  setEditingImageType("DEFAULT");
                  setIsEditImagesDialogOpen(true);
                }}
              >
                <PencilIcon className="h-4 w-4" />
                Thêm ảnh
              </Button>
            </div>
            <CardDescription>
              Bộ sưu tập ảnh hiển thị trong trang chi tiết địa điểm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getImagesByType("DEFAULT").map((image) => (
                <div key={image.id} className="space-y-2 group relative">
                  <div className="rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                    <Image
                      src={image.url}
                      alt="Ảnh mặc định"
                      className="w-full h-32 object-cover"
                      width={200}
                      height={128}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageToDelete({
                            id: image.id,
                            url: image.url,
                          });
                          setIsDeleteImageDialogOpen(true);
                        }}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Default Images - Empty State */}
      {getImagesByType("DEFAULT").length === 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                Ảnh mặc định
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  setEditingImageType("DEFAULT");
                  setIsEditImagesDialogOpen(true);
                }}
              >
                <PencilIcon className="h-4 w-4" />
                Thêm ảnh
              </Button>
            </div>
            <CardDescription>
              Bộ sưu tập ảnh hiển thị trong trang chi tiết địa điểm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Chưa có ảnh mặc định</p>
              <p className="text-sm text-gray-400 text-center max-w-md">
                Thêm ảnh để hiển thị trong trang chi tiết địa điểm của bạn
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Image Confirmation Dialog */}
      <AlertDialog
        open={isDeleteImageDialogOpen}
        onOpenChange={setIsDeleteImageDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa ảnh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ảnh này không? Thao tác này không thể
              hoàn tác.
              {imageToDelete && (
                <div className="mt-4 flex justify-center">
                  <Image
                    src={imageToDelete.url}
                    alt="Preview"
                    className="max-h-32 rounded-lg border"
                    width={200}
                    height={128}
                  />
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteImage}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Images Dialog */}
      {editingImageType && (
        <EditVenueImagesDialog
          open={isEditImagesDialogOpen}
          onOpenChange={setIsEditImagesDialogOpen}
          imageType={editingImageType}
          venueId={venueId}
          onImageUploaded={onImagesUpdated}
        />
      )}
    </div>
  );
}
