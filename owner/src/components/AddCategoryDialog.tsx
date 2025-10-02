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
import { CreateCategoryBodyType } from "@/schemaValidations/category.schema";
import { CreateCategoryBody } from "@/schemaValidations/category.schema";
import { useCreateCategoryMutation } from "@/queries/useCategory";

interface AddCategoryDialogProps {
  venueId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded: () => void;
}

export function AddCategoryDialog({
  venueId,
  open,
  onOpenChange,
  onCategoryAdded,
}: AddCategoryDialogProps) {
  const createCategoryMutation = useCreateCategoryMutation();
  const [isMounted, setIsMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<CreateCategoryBodyType>({
    resolver: zodResolver(CreateCategoryBody),
    defaultValues: {
      name: "",
      venueId: venueId,
    },
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted && open) {
      reset({
        name: "",
        venueId: venueId,
      });
    }
  }, [open, venueId, reset, isMounted]);

  const onSubmit = async (data: CreateCategoryBodyType) => {
    try {
      await createCategoryMutation.mutateAsync({
        ...data,
        venueId: venueId,
      });

      toast({
        title: "Thành công",
        description: "Danh mục đã được tạo thành công",
      });

      onCategoryAdded();
      onOpenChange(false);
    } catch (error) {
      setError("name", {
        type: "manual",
        message: "Tên danh mục đã tồn tại",
      });
    }
  };

  if (!isMounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>
              Thêm một danh mục mới cho địa điểm. Nhấn lưu khi hoàn tất.
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
                  disabled={createCategoryMutation.isPending}
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
              disabled={createCategoryMutation.isPending}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createCategoryMutation.isPending ? (
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
