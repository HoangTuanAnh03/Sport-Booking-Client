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
import { UpdateServiceBodyType } from "@/schemaValidations/service.schema";
import { UpdateServiceBody } from "@/schemaValidations/service.schema";
import { useUpdateServiceMutation } from "@/queries/useService";
import { Service } from "@/types/venue";

interface EditServiceDialogProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceUpdated: () => void;
}

export function EditServiceDialog({
  service,
  open,
  onOpenChange,
  onServiceUpdated,
}: EditServiceDialogProps) {
  const updateServiceMutation = useUpdateServiceMutation();
  const [isMounted, setIsMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateServiceBodyType>({
    resolver: zodResolver(UpdateServiceBody),
    defaultValues: {
      name: service.name,
      price: service.price,
      units: service.units,
      isAvailable: service.isAvailable,
      categoryId:
        service.categoryId && service.categoryId > 0 ? service.categoryId : 1, // Default to 1 if not valid
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
        name: service.name,
        price: service.price,
        units: service.units,
        isAvailable: service.isAvailable,
        categoryId:
          service.categoryId && service.categoryId > 0 ? service.categoryId : 1, // Default to 1 if not valid
      });
    }
  }, [open, service, reset, isMounted]);

  const onSubmit = async (data: UpdateServiceBodyType) => {
    try {
      // Ensure categoryId is valid
      if (!data.categoryId || data.categoryId <= 0) {
        toast({
          title: "Lỗi",
          description: "Danh mục không hợp lệ",
          variant: "destructive",
        });
        return;
      }

      await updateServiceMutation.mutateAsync({
        serviceId: service.id,
        body: data,
      });

      toast({
        title: "Thành công",
        description: "Dịch vụ đã được cập nhật thành công",
      });

      onServiceUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật dịch vụ. Vui lòng thử lại.",
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
            <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin dịch vụ ở đây. Nhấn lưu khi hoàn tất.
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
                  disabled={updateServiceMutation.isPending}
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
                  disabled={updateServiceMutation.isPending}
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
                  disabled={updateServiceMutation.isPending}
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
                    disabled={updateServiceMutation.isPending}
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
              disabled={updateServiceMutation.isPending}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={updateServiceMutation.isPending}>
              {updateServiceMutation.isPending ? (
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
