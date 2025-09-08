"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { CreateServiceBodyType } from "@/schemaValidations/service.schema";
import { CreateServiceBody } from "@/schemaValidations/service.schema";
import { useCreateServiceMutation } from "@/queries/useService";

interface AddServiceDialogProps {
  categoryId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceAdded: () => void;
}

export function AddServiceDialog({
  categoryId,
  open,
  onOpenChange,
  onServiceAdded,
}: AddServiceDialogProps) {
  const createServiceMutation = useCreateServiceMutation();
  const [isMounted, setIsMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateServiceBodyType>({
    resolver: zodResolver(CreateServiceBody),
    defaultValues: {
      name: "",
      price: 0,
      units: "",
      isAvailable: true,
      categoryId: categoryId,
    },
  });

  const isAvailable = watch("isAvailable");

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted && open) {
      reset({
        name: "",
        price: 0,
        units: "",
        isAvailable: true,
        categoryId: categoryId,
      });
    }
  }, [open, categoryId, reset, isMounted]);

  const onSubmit = async (data: CreateServiceBodyType) => {
    try {
      await createServiceMutation.mutateAsync(data);

      toast({
        title: "Thành công",
        description: "Dịch vụ đã được tạo thành công",
      });

      onServiceAdded();
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo dịch vụ. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (!isMounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Thêm dịch vụ mới</DialogTitle>
            <DialogDescription>
              Thêm thông tin dịch vụ mới ở đây. Nhấn lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên dịch vụ
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Nhập tên dịch vụ"
                  disabled={createServiceMutation.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Giá
              </Label>
              <div className="col-span-3">
                <Input
                  id="price"
                  type="number"
                  step="1000"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="Nhập giá dịch vụ"
                  disabled={createServiceMutation.isPending}
                />
                {errors.price && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="units" className="text-right">
                Đơn vị
              </Label>
              <div className="col-span-3">
                <Input
                  id="units"
                  {...register("units")}
                  placeholder="Nhập đơn vị tính"
                  disabled={createServiceMutation.isPending}
                />
                {errors.units && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.units.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isAvailable" className="text-right">
                Trạng thái
              </Label>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    checked={isAvailable}
                    onCheckedChange={(checked) =>
                      setValue("isAvailable", checked)
                    }
                    disabled={createServiceMutation.isPending}
                  />
                  <span>{isAvailable ? "Có sẵn" : "Hết hàng"}</span>
                </div>
                {errors.isAvailable && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.isAvailable.message}
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
              disabled={createServiceMutation.isPending}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={createServiceMutation.isPending}>
              {createServiceMutation.isPending ? (
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
