"use client";

import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { PlusIcon, TrashIcon } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldOwnerResponse, CreateCourtRequest } from "@/types/field";
import { CourtDailyPricingSection } from "@/components/venue-detail/CourtDailyPricingSection";
import { formatTimeToHHmm } from "@/utils/time-utils";

// Define the schema for court validation
const createCourtSchema = (
  openingHours: { dayOfWeek: string; openTime: string; closeTime: string }[],
  minBookingMinutes?: number // Keep minBookingMinutes parameter
) =>
  z
    .object({
      name: z.string().min(1, "Tên sân không được để trống"),
      defaultPrice: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
      status: z.enum(["ENABLE", "UNABLE"]),
      // Add daily pricing validation with support for multiple prices per day
      dailyPricing: z.array(
        z.object({
          dayOfWeek: z.string(),
          prices: z
            .array(
              z
                .object({
                  startTime: z.string(),
                  endTime: z.string(),
                  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
                })
                .superRefine((data, ctx) => {
                  // Validate that startTime is before endTime
                  const [startHours, startMinutes] = data.startTime
                    .split(":")
                    .map(Number);
                  const [endHours, endMinutes] = data.endTime
                    .split(":")
                    .map(Number);
                  const startTotalMinutes = startHours * 60 + startMinutes;
                  const endTotalMinutes = endHours * 60 + endMinutes;

                  if (startTotalMinutes >= endTotalMinutes) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: "Giờ bắt đầu phải trước giờ kết thúc",
                      path: ["endTime"],
                    });
                  }

                  // Validate that duration is divisible by minBookingMinutes if provided
                  if (minBookingMinutes && minBookingMinutes > 0) {
                    const durationInMinutes =
                      endTotalMinutes - startTotalMinutes;
                    if (durationInMinutes % minBookingMinutes !== 0) {
                      ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Thời gian khung giờ phải chia hết cho ${minBookingMinutes} phút`,
                        path: ["endTime"],
                      });
                    }
                  }
                })
                .superRefine((data, ctx) => {
                  // Validate that time slot is within opening hours
                  // Note: We can't access dayOfWeek here directly, so we'll validate this at form level
                })
            )
            .min(1, "Phải có ít nhất một mức giá"),
        })
      ),
    })
    .superRefine((data, ctx) => {
      // Validate that all time slots are within opening hours
      data.dailyPricing.forEach((dayPricing, dayIndex) => {
        const openingHour = openingHours.find(
          (hour) => hour.dayOfWeek === dayPricing.dayOfWeek
        );
        if (!openingHour) return;

        const [openHours, openMinutes] = openingHour.openTime
          .split(":")
          .map(Number);
        const [closeHours, closeMinutes] = openingHour.closeTime
          .split(":")
          .map(Number);
        const openTotalMinutes = openHours * 60 + openMinutes;
        const closeTotalMinutes = closeHours * 60 + closeMinutes;

        // Check for overlapping time slots within the same day
        for (let i = 0; i < dayPricing.prices.length; i++) {
          const price1 = dayPricing.prices[i];
          const [start1Hours, start1Minutes] = price1.startTime
            .split(":")
            .map(Number);
          const [end1Hours, end1Minutes] = price1.endTime
            .split(":")
            .map(Number);
          const start1TotalMinutes = start1Hours * 60 + start1Minutes;
          const end1TotalMinutes = end1Hours * 60 + end1Minutes;

          // Check if current time slot is within opening hours
          if (start1TotalMinutes < openTotalMinutes) {
            const formattedOpenTime = formatTimeToHHmm(openingHour.openTime);
            const formattedCloseTime = formatTimeToHHmm(openingHour.closeTime);
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Giờ bắt đầu phải nằm trong khoảng ${formattedOpenTime} - ${formattedCloseTime}`,
              path: [`dailyPricing`, dayIndex, `prices`, i, `startTime`],
            });
          }

          if (end1TotalMinutes > closeTotalMinutes) {
            const formattedOpenTime = formatTimeToHHmm(openingHour.openTime);
            const formattedCloseTime = formatTimeToHHmm(openingHour.closeTime);
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Giờ kết thúc phải nằm trong khoảng ${formattedOpenTime} - ${formattedCloseTime}`,
              path: [`dailyPricing`, dayIndex, `prices`, i, `endTime`],
            });
          }

          if (start1TotalMinutes >= end1TotalMinutes) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Giờ bắt đầu phải trước giờ kết thúc",
              path: [`dailyPricing`, dayIndex, `prices`, i, `endTime`],
            });
          }

          // Check for overlaps with other time slots in the same day
          for (let j = i + 1; j < dayPricing.prices.length; j++) {
            const price2 = dayPricing.prices[j];
            const [start2Hours, start2Minutes] = price2.startTime
              .split(":")
              .map(Number);
            const [end2Hours, end2Minutes] = price2.endTime
              .split(":")
              .map(Number);
            const start2TotalMinutes = start2Hours * 60 + start2Minutes;
            const end2TotalMinutes = end2Hours * 60 + end2Minutes;

            // Check if time slots overlap
            // Overlap occurs when: max(start1, start2) < min(end1, end2)
            const maxStart = Math.max(start1TotalMinutes, start2TotalMinutes);
            const minEnd = Math.min(end1TotalMinutes, end2TotalMinutes);

            if (maxStart < minEnd) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Các khung giờ không được chồng chéo nhau",
                path: [`dailyPricing`, dayIndex, `prices`, j, `startTime`],
              });
            }
          }

          // NEW VALIDATION: Check if startTime aligns with opening time based on minBookingMinutes
          if (minBookingMinutes && minBookingMinutes > 0) {
            // Calculate the difference between startTime and openingTime
            const startDiffMinutes = start1TotalMinutes - openTotalMinutes;

            // Check if the difference is divisible by minBookingMinutes
            if (startDiffMinutes % minBookingMinutes !== 0) {
              const formattedOpenTime = formatTimeToHHmm(openingHour.openTime);
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Giờ bắt đầu phải chia hết cho ${minBookingMinutes} phút tính từ giờ mở cửa`,
                path: [`dailyPricing`, dayIndex, `prices`, i, `startTime`],
              });
            }
          }
        }
      });
    });

type CourtFormData = z.infer<ReturnType<typeof createCourtSchema>>;

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

interface AddCourtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addingCourtField: FieldOwnerResponse | null;
  createCourtMutation: any;
  refetch: () => void;
}

export function AddCourtDialog({
  open,
  onOpenChange,
  addingCourtField,
  createCourtMutation,
  refetch,
}: AddCourtDialogProps) {
  const [showDaySelection, setShowDaySelection] = useState(false);
  // State to preserve price data when adding/removing days
  const [preservedPriceData, setPreservedPriceData] = useState<
    Record<string, number>
  >({});

  const defaultFormValues: CourtFormData = {
    name: "",
    defaultPrice: 0,
    status: "ENABLE",
    dailyPricing: [],
  };

  const {
    register: registerCourt,
    handleSubmit: handleSubmitCourt,
    formState: { errors: courtErrors },
    reset: resetCourt,
    control: controlCourt,
    watch,
    setValue,
    setError,
  } = useForm<CourtFormData>({
    resolver: zodResolver(
      createCourtSchema(
        addingCourtField?.openingHours || [],
        addingCourtField?.minBookingMinutes
      )
    ),
    defaultValues: defaultFormValues,
    mode: "onChange", // Validate on change for real-time validation
    shouldUnregister: false,
  });

  // Field arrays for daily pricing
  const { fields: dailyPricingFields, append } = useFieldArray({
    control: controlCourt,
    name: "dailyPricing",
  });

  const onSubmitAddCourt = async (data: CourtFormData) => {
    if (!addingCourtField) return;

    // Create a schema with the current opening hours and minBookingMinutes
    const schemaWithOpeningHours = createCourtSchema(
      addingCourtField.openingHours,
      addingCourtField.minBookingMinutes
    );

    // Sort prices by start time before validation
    const sortedData = {
      ...data,
      dailyPricing: data.dailyPricing.map((day) => ({
        ...day,
        prices: day.prices.sort((a, b) => {
          // Convert time strings to minutes for comparison
          const [aHours, aMinutes] = a.startTime.split(":").map(Number);
          const [bHours, bMinutes] = b.startTime.split(":").map(Number);
          const aTotalMinutes = aHours * 60 + aMinutes;
          const bTotalMinutes = bHours * 60 + bMinutes;
          return aTotalMinutes - bTotalMinutes;
        }),
      })),
    };

    // Validate the data with the schema that includes opening hours validation
    try {
      await schemaWithOpeningHours.parseAsync(sortedData);
    } catch (error) {
      // If validation fails, the errors will be displayed by the form
      return;
    }

    // Prepare the create request body
    const createData: CreateCourtRequest = {
      name: sortedData.name,
      fieldId: addingCourtField.id,
      defaultPrice: sortedData.defaultPrice,
      dailyPricing: sortedData.dailyPricing,
    };

    try {
      await createCourtMutation.mutateAsync(createData);
      onOpenChange(false);
      setShowDaySelection(false); // Reset day selection state
      resetCourt({
        name: "",
        defaultPrice: 0,
        status: "ENABLE",
        dailyPricing: [],
      });
      refetch();
    } catch (error: any) {
      setError("name", {
        type: "manual",
        message: "Tên sân đã tồn tại trong cụm sân này",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          resetCourt(defaultFormValues);
          setShowDaySelection(false); // Reset day selection state when closing dialog
        }
      }}
    >
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmitCourt(onSubmitAddCourt)}>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <PlusIcon className="h-6 w-6 text-blue-600" />
              Thêm sân
            </DialogTitle>
            <DialogDescription>
              Thêm sân mới vào cụm sân. Nhấn lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Thông tin cơ bản
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Label className="text-gray-600 w-32 font-medium flex items-center h-8">
                        Tên sân:
                      </Label>
                      <div className="flex-1">
                        <Input
                          id="courtName"
                          {...registerCourt("name")}
                          placeholder="Nhập tên sân"
                          disabled={createCourtMutation.isPending}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {courtErrors.name && (
                          <p className="text-sm text-red-600 mt-1">
                            {courtErrors.name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 w-32 font-medium flex items-center h-8">
                        Giá mặc định:
                      </Label>
                      <div className="flex-1">
                        <Input
                          id="defaultPrice"
                          type="number"
                          {...registerCourt("defaultPrice", {
                            valueAsNumber: true,
                          })}
                          placeholder="Nhập giá mặc định"
                          disabled={createCourtMutation.isPending}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {courtErrors.defaultPrice && (
                          <p className="text-sm text-red-600 mt-1">
                            {courtErrors.defaultPrice.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 w-32 font-medium flex items-center h-8">
                        Trạng thái:
                      </Label>
                      <div className="flex-1 flex items-center gap-2 h-8">
                        <Switch
                          id="courtStatus"
                          // {...registerCourt("status")}
                          checked={false}
                          // onCheckedChange={(checked) => {
                          // resetCourt({
                          //   ...watch(),
                          //   status: checked ? "ENABLE" : "UNABLE",
                          // });
                          // setValue("status", checked ? "ENABLE" : "UNABLE");
                          // }}
                          disabled
                        />
                        <span className="text-sm font-medium">
                          {watch("status") === "ENABLE"
                            ? "Hoạt động"
                            : "Tạm dừng"}
                        </span>
                        {courtErrors.status && (
                          <p className="text-sm text-red-600 mt-1">
                            {courtErrors.status.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Pricing Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Bảng giá theo ngày
                    </h3>
                  </div>

                  {showDaySelection ? (
                    <div className="space-y-4">
                      <p className="text-gray-600 text-sm">
                        Chọn ngày trong tuần để thêm cấu hình giá:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {addingCourtField?.openingHours
                          .filter(
                            (hour) =>
                              !dailyPricingFields.some(
                                (field) => field.dayOfWeek === hour.dayOfWeek
                              )
                          )
                          .sort(
                            (a, b) =>
                              daysOfWeekOrder[a.dayOfWeek] -
                              daysOfWeekOrder[b.dayOfWeek]
                          )
                          .map((hour) => (
                            <Button
                              key={hour.dayOfWeek}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Preserve current price data before adding new day
                                const currentPriceData = {
                                  ...preservedPriceData,
                                };

                                append({
                                  dayOfWeek: hour.dayOfWeek,
                                  prices: [
                                    {
                                      startTime: hour.openTime,
                                      endTime: hour.closeTime,
                                      price: watch("defaultPrice") ?? 0,
                                    },
                                  ],
                                });

                                // Close the day selection interface after selecting a day
                                setShowDaySelection(false);
                              }}
                              className="border-gray-300 hover:bg-gray-100"
                            >
                              {daysOfWeekMap[hour.dayOfWeek]}
                            </Button>
                          ))}
                      </div>
                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDaySelection(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : dailyPricingFields.length > 0 ? (
                    <div className="space-y-6   pr-2">
                      {dailyPricingFields
                        .slice()
                        .sort(
                          (a, b) =>
                            daysOfWeekOrder[a.dayOfWeek] -
                            daysOfWeekOrder[b.dayOfWeek]
                        )
                        .map((field, index) => {
                          const originalIndex = dailyPricingFields.findIndex(
                            (f) => f.id === field.id
                          );
                          // Find the corresponding opening hour for this day
                          const openingHour =
                            addingCourtField?.openingHours.find(
                              (hour) => hour.dayOfWeek === field.dayOfWeek
                            );

                          return openingHour ? (
                            <div key={field.id} className="relative">
                              <CourtDailyPricingSection
                                dayIndex={originalIndex}
                                dayOfWeek={field.dayOfWeek}
                                openTime={openingHour.openTime}
                                closeTime={openingHour.closeTime}
                                control={controlCourt}
                                register={registerCourt}
                                errors={courtErrors}
                                disabled={createCourtMutation.isPending}
                                daysOfWeekMap={daysOfWeekMap}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Preserve current price data before removing day
                                  const currentPriceData = {
                                    ...preservedPriceData,
                                  };
                                  dailyPricingFields.forEach(
                                    (field: any, i: number) => {
                                      if (
                                        i !== index &&
                                        field.prices &&
                                        field.prices.length > 0
                                      ) {
                                        currentPriceData[field.dayOfWeek] =
                                          field.prices[0].price;
                                      }
                                    }
                                  );

                                  // Remove this day from daily pricing
                                  const newDailyPricing = dailyPricingFields
                                    .filter((_, i) => i !== index)
                                    .map((field) => ({
                                      dayOfWeek: field.dayOfWeek,
                                      prices: field.prices,
                                    }));

                                  // Preserve existing form values when removing a day
                                  const currentValues = watch();
                                  resetCourt(
                                    {
                                      name: currentValues.name || "",
                                      defaultPrice:
                                        currentValues.defaultPrice || 0,
                                      status: currentValues.status || "ENABLE",
                                      dailyPricing: newDailyPricing,
                                    },
                                    {
                                      keepValues: false,
                                      keepDirty: false,
                                      keepTouched: false,
                                      keepErrors: false,
                                      keepIsValid: false,
                                      keepSubmitCount: false,
                                    }
                                  );

                                  // Update preserved price data
                                  setPreservedPriceData(currentPriceData);
                                }}
                                disabled={createCourtMutation.isPending}
                                className="absolute top-6 right-6 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      {/* Button to add more days */}
                      <div className="flex justify-center pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowDaySelection(true)}
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Thêm ngày khác
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDaySelection(true)}
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Thêm giá theo ngày
                      </Button>
                      <p className="text-gray-600 text-sm mt-2 text-center">
                        Nhấn để thêm cấu hình giá cho từng ngày trong tuần
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCourtMutation.isPending}
              className="border-gray-300 hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createCourtMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createCourtMutation.isPending ? (
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
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
