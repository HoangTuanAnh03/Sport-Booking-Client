"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, PencilIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { FieldOwnerResponse, UpdateFieldRequest } from "@/types/field";
import { useUpdateFieldMutation } from "@/queries/useField";
import { useGetAllSportTypesQuery } from "@/queries/useSportType";
import { SportTypeResponse } from "@/types/sport-type";

// Define the schema for field validation
const fieldSchema = z.object({
  name: z.string().min(1, "Tên cụm sân không được để trống"),
  // sportTypeId is removed from validation since it's not editable
  monthLimit: z.number().min(1, "Giới hạn tháng phải lớn hơn 0"),
  // minBookingMinutes is removed from validation since it's not editable
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

interface FieldDetailsProps {
  field: FieldOwnerResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
  onSuccess?: () => void;
}

export function FieldDetails({
  field,
  open,
  onOpenChange,
  mode,
  onSuccess,
}: FieldDetailsProps) {
  const isEditMode = mode === "edit";
  const updateFieldMutation = useUpdateFieldMutation();
  const {
    data: sportTypesData,
    isLoading: isSportTypesLoading,
    isError,
    error,
  } = useGetAllSportTypesQuery();

  // Log for debugging
  useEffect(() => {
    if (sportTypesData) {
      console.log("Sport types data loaded:", sportTypesData);
    }
    if (isError) {
      console.error("Error loading sport types:", error);
    }
  }, [sportTypesData, isError, error]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: field.name,
      // sportTypeId is removed since it's not editable
      monthLimit: field.monthLimit,
      // minBookingMinutes is removed since it's not editable
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
        // sportTypeId is removed since it's not editable
        monthLimit: field.monthLimit,
        // minBookingMinutes is removed since it's not editable
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

  const onSubmit = async (data: FieldFormData) => {
    // Helper function to ensure time string is in HH:mm:ss format
    const formatTime = (timeString: string) => {
      // If time is in HH:mm format, add :00 for seconds
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return `${timeString}:00`;
      }
      // If already in HH:mm:ss format, return as is
      if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return timeString;
      }
      // Default to adding :00 seconds
      return `${timeString}:00`;
    };

    // Prepare the update request body
    const updateData: UpdateFieldRequest = {
      name: data.name,
      // Note: sportTypeId is not included in the update request to prevent changing it
      monthLimit: data.monthLimit,
      // Note: minBookingMinutes is not included in the update request to prevent changing it
      status: data.status,
      // Use the first opening hour as default open/close times
      defaultOpenTime:
        data.openingHours.length > 0
          ? formatTime(data.openingHours[0].openTime)
          : "06:00:00",
      defaultCloseTime:
        data.openingHours.length > 0
          ? formatTime(data.openingHours[0].closeTime)
          : "22:00:00",
      openingHours: data.openingHours.map((hour) => ({
        ...hour,
        openTime: formatTime(hour.openTime),
        closeTime: formatTime(hour.closeTime),
      })),
    };

    try {
      await updateFieldMutation.mutateAsync({
        fieldId: field.id,
        body: updateData,
      });

      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[1200px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {isEditMode ? (
                <>
                  <PencilIcon className="h-6 w-6 text-blue-600" />
                  Chỉnh sửa cụm sân
                </>
              ) : (
                <>
                  <EyeIcon className="h-6 w-6 text-blue-600" />
                  Chi tiết cụm sân
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Chỉnh sửa thông tin cụm sân"
                : "Thông tin chi tiết về cụm sân"}
            </DialogDescription>
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
                      <Label className="text-gray-600 w-32 font-medium">
                        Tên cụm sân:
                      </Label>
                      <div className="flex-1">
                        <Input
                          {...register("name")}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          disabled={
                            !isEditMode || updateFieldMutation.isPending
                          }
                        />
                        {isEditMode && errors.name && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 w-32 font-medium">
                        Loại môn thể thao:
                      </Label>
                      <div className="flex-1">
                        <Input
                          value={field.sportTypeName}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 w-32 font-medium">
                        Giới hạn tháng:
                      </Label>
                      <div className="flex-1">
                        <Input
                          type="number"
                          {...register("monthLimit", { valueAsNumber: true })}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          disabled={
                            !isEditMode || updateFieldMutation.isPending
                          }
                        />
                        {isEditMode && errors.monthLimit && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.monthLimit.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 w-32 font-medium">
                        Trạng thái:
                      </Label>
                      <div className="flex-1">
                        <select
                          {...register("status")}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={
                            !isEditMode || updateFieldMutation.isPending
                          }
                        >
                          <option value="ENABLE">Hoạt động</option>
                          <option value="UNABLE">Tạm dừng</option>
                          <option value="DELETED">Đã xóa</option>
                        </select>
                        {isEditMode && errors.status && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.status.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 w-32 font-medium">
                        Thời gian đặt tối thiểu:
                      </Label>
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={field.minBookingMinutes}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          disabled
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
                    {openingHoursFields.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-800">
                            {item.dayOfWeek}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm text-gray-600 mb-1 block">
                              Giờ mở cửa
                            </Label>
                            <Input
                              type="time"
                              {...register(`openingHours.${index}.openTime`)}
                              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              disabled={
                                !isEditMode || updateFieldMutation.isPending
                              }
                            />
                            {isEditMode &&
                              errors.openingHours?.[index]?.openTime && (
                                <p className="text-sm text-red-600 mt-1">
                                  {
                                    errors.openingHours[index]?.openTime
                                      ?.message
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
                              {...register(`openingHours.${index}.closeTime`)}
                              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              disabled={
                                !isEditMode || updateFieldMutation.isPending
                              }
                            />
                            {isEditMode &&
                              errors.openingHours?.[index]?.closeTime && (
                                <p className="text-sm text-red-600 mt-1">
                                  {
                                    errors.openingHours[index]?.closeTime
                                      ?.message
                                  }
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
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
              disabled={updateFieldMutation.isPending}
              className="border-gray-300 hover:bg-gray-100"
            >
              {isEditMode ? "Hủy" : "Đóng"}
            </Button>
            {isEditMode && (
              <Button
                type="submit"
                disabled={updateFieldMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateFieldMutation.isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang lưu...
                  </span>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
