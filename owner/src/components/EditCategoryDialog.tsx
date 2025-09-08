"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { UpdateCategoryBodyType } from "@/schemaValidations/category.schema";
import { UpdateCategoryBody } from "@/schemaValidations/category.schema";
import { useUpdateCategoryMutation } from "@/queries/useCategory";
import { Category } from "@/types/venue";

interface EditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryUpdated: () => void;
}

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
  onCategoryUpdated,
}: EditCategoryDialogProps) {
  const updateCategoryMutation = useUpdateCategoryMutation();
  const [isMounted, setIsMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateCategoryBodyType>({
    resolver: zodResolver(UpdateCategoryBody),
    defaultValues: {
      name: category.name,
    },
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted && open) {
      reset({
        name: category.name,
      });
    }
  }, [open, category, reset, isMounted]);

  const onSubmit = async (data: UpdateCategoryBodyType) => {
    try {
      await updateCategoryMutation.mutateAsync({
        categoryId: category.id,
        body: data,
      });

      toast({
        title: "Thành công",
        description: "Danh mục đã được cập nhật thành công",
      });

      onCategoryUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật danh mục. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (!isMounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin danh mục ở đây. Nhấn lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên danh mục
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Nhập tên danh mục"
                  disabled={updateCategoryMutation.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateCategoryMutation.isPending}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={updateCategoryMutation.isPending}>
              {updateCategoryMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
