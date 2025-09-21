"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, ViewIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FieldOwnerResponse } from "@/types/field";
import { useGetAllSportTypesQuery } from "@/queries/useSportType";

// Define the schema for field validation
const fieldSchema = z.object({
  name: z.string().min(1, "Tên cụm sân không được để trống"),
  monthLimit: z.number().min(1, "Giới hạn tháng phải lớn hơn 0"),
  status: z.enum(["ENABLE", "UNABLE", "DELETED"]),
  openingHours: z.array(
    z.object({
      dayOfWeek: z.string(),
      openTime: z.string().min(1, "Giờ mở cửa không được để trống"),
      closeTime: z.string().min(1, "Giờ đóng cửa không được để trống"),
    })
  ),
});

type FieldFormData = z.infer<typeof fieldSchema>;

interface ViewFieldDialogProps {
  field: FieldOwnerResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ViewFieldDialog({
  field,
  open,
  onOpenChange,
  onSuccess,
}: ViewFieldDialogProps) {
  const {
    data: sportTypesData,
    isLoading: isSportTypesLoading,
    isError,
    error,
  } = useGetAllSportTypesQuery();

  const {
    register,
    control,
    formState: { errors },
    reset,
  } = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: field.name,
      monthLimit: field.monthLimit,
      status: field.status,
      openingHours: field.openingHours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
      })),
    },
  });

  const { fields: openingHoursFields } = useFieldArray({
    control,
    name: "openingHours",
  });

  useEffect(() => {
    if (field) {
      reset({
        name: field.name,
        monthLimit: field.monthLimit,
        status: field.status,
        openingHours: field.openingHours.map((hour) => ({
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        })),
      });
    }
  }, [field, reset]);

  const formatTime = (timeString: string) => {
    // Assuming timeString is in format "HH:mm:ss"
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  // Days of week mapping for display
  const daysOfWeekMap: Record<string, string> = {
    MONDAY: "Thứ Hai",
    TUESDAY: "Thứ Ba",
    WEDNESDAY: "Thứ Tư",
    THURSDAY: "Thứ Năm",
    FRIDAY: "Thứ Sáu",
    SATURDAY: "Thứ Bảy",
    SUNDAY: "Chủ Nhật",
  };

  // Days of week order for sorting (Monday first, Sunday last)
  const daysOfWeekOrder: Record<string, number> = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[1200px]">
        <form>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <EyeIcon className="h-6 w-6 text-blue-600" />
              Thông tin cụm sân
            </DialogTitle>
            <DialogDescription>Thông tin chi tiết về cụm sân</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Thông tin cơ bản
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Label className="text-gray-600 leading-[1.3] w-32 font-medium">
                        Tên cụm sân:
                      </Label>
                      <div className="flex-1">
                        <Input
                          {...register("name")}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          contentEditable={false}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 leading-[1.3] w-32 font-medium line-h">
                        Loại môn thể thao:
                      </Label>
                      <div className="flex-1">
                        <Input
                          value={field.sportTypeName}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          contentEditable={false}
                        />
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 leading-[1.3] w-32 font-medium leading-[1.3]">
                        Số tháng được phép đặt trước:
                      </Label>
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={field.monthLimit}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          contentEditable={false}
                        />
                        {errors.monthLimit && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.monthLimit.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 leading-[1.3] w-32 font-medium">
                        Trạng thái:
                      </Label>
                      <div className="flex-1 flex items-center gap-2">
                        <Switch
                          id="fieldStatus"
                          checked={field.status === "ENABLE"}
                          disabled
                        />
                        <span className="text-sm font-medium">
                          {field.status === "ENABLE" ? "Hoạt động" : "Tạm dừng"}
                        </span>
                        {errors.status && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.status.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 leading-[1.3] w-32 font-medium">
                        Thời gian đặt tối thiểu:
                      </Label>
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={field.minBookingMinutes}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          contentEditable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opening Hours Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Giờ mở cửa
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {openingHoursFields
                      .slice()
                      .sort(
                        (a, b) =>
                          daysOfWeekOrder[a.dayOfWeek] -
                          daysOfWeekOrder[b.dayOfWeek]
                      )
                      .map((item, sortedIndex) => {
                        // Find the original index to maintain correct data mapping
                        const originalIndex = openingHoursFields.findIndex(
                          (field) => field.id === item.id
                        );

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-semibold text-gray-800">
                                {daysOfWeekMap[item.dayOfWeek] ||
                                  item.dayOfWeek}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm text-gray-600 mb-1 block">
                                  Giờ mở cửa
                                </Label>
                                <Input
                                  type="time"
                                  {...register(
                                    `openingHours.${originalIndex}.openTime`
                                  )}
                                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  contentEditable={false}
                                />
                                {errors.openingHours?.[originalIndex]
                                  ?.openTime && (
                                  <p className="text-sm text-red-600 mt-1">
                                    {
                                      errors.openingHours[originalIndex]
                                        ?.openTime?.message
                                    }
                                  </p>
                                )}
                              </div>
                              <div>
                                <Label className="text-sm text-gray-600 mb-1 block">
                                  Giờ đóng cửa
                                </Label>
                                <Input
                                  type="time"
                                  {...register(
                                    `openingHours.${originalIndex}.closeTime`
                                  )}
                                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  contentEditable={false}
                                />
                                {errors.openingHours?.[originalIndex]
                                  ?.closeTime && (
                                  <p className="text-sm text-red-600 mt-1">
                                    {
                                      errors.openingHours[originalIndex]
                                        ?.closeTime?.message
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              contentEditable={false}
              className="border-gray-300 hover:bg-gray-100"
            >
              Hủy
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
