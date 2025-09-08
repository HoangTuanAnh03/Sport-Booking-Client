import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateVenueImagesMutation } from "@/queries/useVenue";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EditVenueImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageType: "AVATAR" | "THUMBNAIL" | "DEFAULT";
  venueId: number;
  onImageUploaded: () => void;
}

export function EditVenueImagesDialog({
  open,
  onOpenChange,
  imageType,
  venueId,
  onImageUploaded,
}: EditVenueImagesDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const createImagesMutation = useCreateVenueImagesMutation();
  const fileUploadRef = useRef<HTMLInputElement>(null);

  const getTitle = () => {
    switch (imageType) {
      case "AVATAR":
        return "Thay đổi ảnh đại diện";
      case "THUMBNAIL":
        return "Thay đổi ảnh thumbnail";
      case "DEFAULT":
        return "Thêm ảnh mặc định";
      default:
        return "Chỉnh sửa ảnh";
    }
  };

  const getDescription = () => {
    switch (imageType) {
      case "AVATAR":
        return "Tải lên ảnh đại diện mới cho địa điểm của bạn. Ảnh này sẽ được hiển thị trong kết quả tìm kiếm và trang chi tiết.";
      case "THUMBNAIL":
        return "Tải lên ảnh thumbnail mới cho địa điểm của bạn. Ảnh này sẽ được hiển thị trên bản đồ và danh sách thu gọn.";
      case "DEFAULT":
        return "Thêm ảnh mới vào bộ sưu tập ảnh của địa điểm. Những ảnh này sẽ được hiển thị trong trang chi tiết địa điểm.";
      default:
        return "Tải lên ảnh cho địa điểm của bạn.";
    }
  };

  const getPreviewDimensions = () => {
    switch (imageType) {
      case "AVATAR":
        return "w-48 h-48 rounded-xl";
      case "THUMBNAIL":
        return "w-64 h-40 rounded-xl";
      case "DEFAULT":
        return "w-full h-32 rounded-lg";
      default:
        return "w-full h-32 rounded-lg";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một ảnh để tải lên",
        variant: "destructive",
      });
      return;
    }

    try {
      await createImagesMutation.mutateAsync({
        venueId,
        imageType,
        files: [file],
      });
      toast({
        title: "Thành công",
        description: "Ảnh đã được tải lên thành công",
      });
      onImageUploaded();
      onOpenChange(false);
      // Reset file state
      setFile(null);
    } catch (error) {
      // Error is handled by the mutation's onError
      console.error("Upload error:", error);
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <FileUpload
            ref={fileUploadRef}
            onFileSelect={handleFileSelect}
            accept="image/*"
            maxSize={10}
          />

          {/* Preview container with appropriate dimensions */}
          {file && (
            <div className="mt-4 flex justify-center">
              <div
                className={`${getPreviewDimensions()} overflow-hidden border-2 border-dashed border-gray-300`}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createImagesMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || createImagesMutation.isPending}
          >
            {createImagesMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Tải lên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
