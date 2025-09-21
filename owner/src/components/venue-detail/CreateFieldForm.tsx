"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useGetAllSportTypesQuery } from "@/queries/useSportType";
import { CreateFieldRequest } from "@/types/field";
import { useCreateFieldMutation } from "@/queries/useField";

// Define the schema for field validation
const fieldSchema = z
  .object({
    name: z.string().min(1, "Tên cụm sân không được để trống"),
    sportTypeId: z.number().min(1, "Vui lòng chọn loại môn thể thao"),
    monthLimit: z.number().min(1, "Giới hạn tháng phải lớn hơn 0"),
    minBookingMinutes: z
      .number()
      .min(30, "Thời gian đặt tối thiểu phải ít nhất 30 phút"),
    defaultOpenTime: z.string().min(1, "Giờ mở cửa không được để trống"),
    defaultCloseTime: z.string().min(1, "Giờ đóng cửa không được để trống"),
    openingHours: z
      .array(
        z.object({
          dayOfWeek: z.string(),
          openTime: z.string().min(1, "Giờ mở cửa không được để trống"),
          closeTime: z.string().min(1, "Giờ đóng cửa không được để trống"),
        })
      )
      .min(1, "Cần có ít nhất một khung giờ mở cửa"),
  })
  .refine(
    (data) => {
      // Validate that default open time is before close time
      const [openHours, openMinutes] = data.defaultOpenTime
        .split(":")
        .map(Number);
      const [closeHours, closeMinutes] = data.defaultCloseTime
        .split(":")
        .map(Number);
      const openTimeInMinutes = openHours * 60 + openMinutes;
      const closeTimeInMinutes = closeHours * 60 + closeMinutes;
      return openTimeInMinutes < closeTimeInMinutes;
    },
    {
      message: "Giờ mở cửa phải trước giờ đóng cửa",
      path: ["defaultOpenTime"],
    }
  )
  .refine(
    (data) => {
      // Validate that all opening hours have open time before close time
      return data.openingHours.every((hour) => {
        const [openHours, openMinutes] = hour.openTime.split(":").map(Number);
        const [closeHours, closeMinutes] = hour.closeTime
          .split(":")
          .map(Number);
        const openTimeInMinutes = openHours * 60 + openMinutes;
        const closeTimeInMinutes = closeHours * 60 + closeMinutes;
        return openTimeInMinutes < closeTimeInMinutes;
      });
    },
    {
      message: "Giờ mở cửa phải trước giờ đóng cửa",
      path: ["openingHours"],
    }
  );

type FieldFormData = z.infer<typeof fieldSchema>;

interface CreateFieldFormProps {
  venueId: number;
  onCreateSuccess: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function CreateFieldForm({
  venueId,
  onCreateSuccess,
  onCancel,
  isPending,
}: CreateFieldFormProps) {
  const { data: sportTypesData, isLoading: isSportTypesLoading } =
    useGetAllSportTypesQuery();
  const createFieldMutation = useCreateFieldMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: "",
      sportTypeId: 0,
      monthLimit: 1,
      minBookingMinutes: 30,
      defaultOpenTime: "06:00",
      defaultCloseTime: "22:00",
      openingHours: [
        { dayOfWeek: "MONDAY", openTime: "06:00", closeTime: "22:00" },
        { dayOfWeek: "TUESDAY", openTime: "06:00", closeTime: "22:00" },
        { dayOfWeek: "WEDNESDAY", openTime: "06:00", closeTime: "22:00" },
        { dayOfWeek: "THURSDAY", openTime: "06:00", closeTime: "22:00" },
        { dayOfWeek: "FRIDAY", openTime: "06:00", closeTime: "22:00" },
        { dayOfWeek: "SATURDAY", openTime: "06:00", closeTime: "22:00" },
        { dayOfWeek: "SUNDAY", openTime: "06:00", closeTime: "22:00" },
      ],
    },
  });

  const {
    fields: openingHoursFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "openingHours",
  });

  // Initialize opening hours for each day of the week
  const daysOfWeek = [
    { id: "MONDAY", name: "Thứ Hai" },
    { id: "TUESDAY", name: "Thứ Ba" },
    { id: "WEDNESDAY", name: "Thứ Tư" },
    { id: "THURSDAY", name: "Thứ Năm" },
    { id: "FRIDAY", name: "Thứ Sáu" },
    { id: "SATURDAY", name: "Thứ Bảy" },
    { id: "SUNDAY", name: "Chủ Nhật" },
  ];

  const onSubmit = async (data: FieldFormData) => {
    console.log("Form data submitted:", data);

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

    // Prepare the create request body
    const createData: CreateFieldRequest = {
      name: data.name,
      sportTypeId: data.sportTypeId,
      monthLimit: data.monthLimit,
      minBookingMinutes: data.minBookingMinutes,
      venueId: venueId,
      defaultOpenTime: formatTime(data.defaultOpenTime),
      defaultCloseTime: formatTime(data.defaultCloseTime),
      openingHours: data.openingHours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: formatTime(hour.openTime),
        closeTime: formatTime(hour.closeTime),
      })),
    };

    console.log("Create field request data:", createData);

    try {
      await createFieldMutation.mutateAsync(createData);
      console.log("Field created successfully");
      onCreateSuccess();
    } catch (error) {
      console.error("Error creating field:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Thêm cụm sân mới
        </h2>
        <p className="text-gray-600">
          Điền thông tin cụm sân mới vào form dưới đây
        </p>
      </div>

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
                    placeholder="Nhập tên cụm sân"
                    disabled={isPending}
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.name && (
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
                  {isSportTypesLoading ? (
                    <div className="h-10 flex items-center">
                      <div className="animate-pulse bg-gray-200 rounded w-full h-10"></div>
                    </div>
                  ) : (
                    <select
                      {...register("sportTypeId", { valueAsNumber: true })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isPending}
                    >
                      <option value="0">Chọn loại môn thể thao</option>
                      {sportTypesData?.map((sportType) => (
                        <option key={sportType.id} value={sportType.id}>
                          {sportType.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.sportTypeId && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.sportTypeId.message}
                    </p>
                  )}
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
                    placeholder="Nhập giới hạn tháng"
                    disabled={isPending}
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.monthLimit && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.monthLimit.message}
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
                    {...register("minBookingMinutes", { valueAsNumber: true })}
                    placeholder="Nhập thời gian đặt tối thiểu"
                    disabled={isPending}
                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.minBookingMinutes && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.minBookingMinutes.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Opening Hours Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <h3 className="text-lg font-semibold text-gray-800">
                Giờ mở cửa theo từng ngày
              </h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {openingHoursFields.map((field, index) => {
                const dayInfo = daysOfWeek.find(
                  (day) => day.id === field.dayOfWeek
                );
                return (
                  <div
                    key={field.id}
                    className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-800">
                        {dayInfo?.name || field.dayOfWeek}
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
                          disabled={isPending}
                        />
                        {errors.openingHours?.[index]?.openTime && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.openingHours[index]?.openTime?.message}
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
                          disabled={isPending}
                        />
                        {errors.openingHours?.[index]?.closeTime && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.openingHours[index]?.closeTime?.message}
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

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="border-gray-300 hover:bg-gray-100"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? (
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
              Đang tạo...
            </span>
          ) : (
            "Tạo cụm sân"
          )}
        </Button>
      </div>
    </form>
  );
}
