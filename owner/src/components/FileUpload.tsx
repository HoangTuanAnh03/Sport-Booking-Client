import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  previewUrl?: string | null;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      onFileSelect,
      accept = "image/*",
      maxSize = 10,
      className = "",
      previewUrl = null,
    },
    ref
  ) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(previewUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Expose the internal ref through useImperativeHandle
    useImperativeHandle(ref, () => fileInputRef.current as HTMLInputElement);

    const validateFile = (file: File): boolean => {
      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Lỗi",
          description: "Chỉ hỗ trợ các định dạng ảnh: JPEG, JPG, PNG, WEBP",
          variant: "destructive",
        });
        return false;
      }

      // Check file size
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast({
          title: "Lỗi",
          description: `Kích thước ảnh không được vượt quá ${maxSize}MB`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (!validateFile(selectedFile)) {
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setFile(selectedFile);
      onFileSelect(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    };

    const handleRemove = () => {
      setFile(null);
      setPreview(null);
      onFileSelect(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files?.[0];
      if (!droppedFile) return;

      // Set the file input value
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
      }

      if (!validateFile(droppedFile)) return;

      setFile(droppedFile);
      onFileSelect(droppedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    };

    return (
      <div className={`space-y-4 ${className}`}>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="mx-auto max-h-48 rounded-lg object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-600">
                Kéo và thả ảnh vào đây hoặc nhấp để chọn tệp
              </p>
              <p className="text-xs text-gray-500">
                Hỗ trợ: JPEG, JPG, PNG, WEBP (tối đa {maxSize}MB)
              </p>
            </div>
          )}
        </div>

        {file && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm truncate">{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
