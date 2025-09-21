import {
  useFieldArray,
  UseFormRegister,
  Control,
  useWatch,
  useController,
} from "react-hook-form";
import { TrashIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatTimeToHHmm } from "@/utils/time-utils";

// Separate component for each price field to avoid hook rules violation
function PriceField({
  dayIndex,
  priceIndex,
  openTime,
  closeTime,
  control,
  errors,
  disabled,
  prices,
}: {
  dayIndex: number;
  priceIndex: number;
  openTime: string;
  closeTime: string;
  control: Control<any>;
  errors: any;
  disabled?: boolean;
  prices: any[];
}) {
  // Use controllers for start and end time to have more control over their behavior
  const { field: startTimeField } = useController({
    name: `dailyPricing.${dayIndex}.prices.${priceIndex}.startTime`,
    control,
  });

  const { field: endTimeField } = useController({
    name: `dailyPricing.${dayIndex}.prices.${priceIndex}.endTime`,
    control,
  });

  const { field: priceFieldControl } = useController({
    name: `dailyPricing.${dayIndex}.prices.${priceIndex}.price`,
    control,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
      <div className="md:col-span-4">
        <Label className="text-sm text-gray-600 mb-1 block">Giờ bắt đầu</Label>
        <Input
          type="time"
          min={openTime}
          max={closeTime}
          {...startTimeField}
          onChange={(e) => {
            // Get the current end time for this price slot
            const currentEndTime = prices?.[priceIndex]?.endTime || closeTime;

            // Parse start time and end time
            const [startHours, startMinutes] = e.target.value
              .split(":")
              .map(Number);
            const [endHours, endMinutes] = currentEndTime
              .split(":")
              .map(Number);
            const startTotalMinutes = startHours * 60 + startMinutes;
            const endTotalMinutes = endHours * 60 + endMinutes;

            // If start time is greater than end time, clear the end time
            if (startTotalMinutes > endTotalMinutes) {
              endTimeField.onChange("");
            }

            // Call the original field onChange
            startTimeField.onChange(e);
          }}
          disabled={disabled}
          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
        />
        <div className="h-5 mt-1">
          {errors.dailyPricing?.[dayIndex]?.prices?.[priceIndex]?.startTime && (
            <p className="text-sm text-red-600">
              {
                errors.dailyPricing[dayIndex]?.prices?.[priceIndex]?.startTime
                  ?.message
              }
            </p>
          )}
        </div>
      </div>
      <div className="md:col-span-4">
        <Label className="text-sm text-gray-600 mb-1 block">Giờ kết thúc</Label>
        <Input
          type="time"
          min={openTime}
          max={closeTime}
          {...endTimeField}
          disabled={disabled}
          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
        />
        <div className="h-5 mt-1">
          {errors.dailyPricing?.[dayIndex]?.prices?.[priceIndex]?.endTime && (
            <p className="text-sm text-red-600">
              {
                errors.dailyPricing[dayIndex]?.prices?.[priceIndex]?.endTime
                  ?.message
              }
            </p>
          )}
        </div>
      </div>
      <div className="md:col-span-3">
        <Label className="text-sm text-gray-600 mb-1 block">Giá (VND)</Label>
        <Input
          type="number"
          {...priceFieldControl}
          onChange={(e) => {
            // Use valueAsNumber to ensure we get a numeric value
            const numericValue = e.target.valueAsNumber;
            // Check if the value is a valid number
            if (!isNaN(numericValue)) {
              priceFieldControl.onChange(numericValue);
            } else if (e.target.value === "") {
              // Allow empty string for clearing the field
              priceFieldControl.onChange("");
            }
          }}
          placeholder="Nhập giá"
          disabled={disabled}
          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
        />
        <div className="h-5 mt-1">
          {errors.dailyPricing?.[dayIndex]?.prices?.[priceIndex]?.price && (
            <p className="text-sm text-red-600">
              {
                errors.dailyPricing[dayIndex]?.prices?.[priceIndex]?.price
                  ?.message
              }
            </p>
          )}
        </div>
      </div>
      <div className="md:col-span-1 flex items-center pb-1">
        {/* We'll handle the remove button in the parent component */}
      </div>
    </div>
  );
}

interface CourtDailyPricingSectionProps {
  dayIndex: number;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: any;
  disabled?: boolean;
  daysOfWeekMap: Record<string, string>;
}

export function CourtDailyPricingSection({
  dayIndex,
  dayOfWeek,
  openTime,
  closeTime,
  control,
  register,
  errors,
  disabled = false,
  daysOfWeekMap,
}: CourtDailyPricingSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dailyPricing.${dayIndex}.prices`,
  });

  // Watch the current prices for this day
  const prices = useWatch({
    control,
    name: `dailyPricing.${dayIndex}.prices`,
    defaultValue: [],
  });

  // Helper function to get error message
  const getErrorMessage = (fieldPath: string) => {
    const error = errors.dailyPricing?.[dayIndex]?.prices?.[0]?.[fieldPath];
    return error ? error.message : null;
  };

  return (
    <div className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-3 p-2 bg-gray-50 rounded-md">
        <span className="font-semibold text-gray-800 min-w-fit">
          {daysOfWeekMap[dayOfWeek] || dayOfWeek}
        </span>
        <span className="text-sm text-gray-500">|</span>
        <span className="text-sm text-gray-500 min-w-fit">
          Giờ mở cửa theo ngày
        </span>
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {formatTimeToHHmm(openTime)} - {formatTimeToHHmm(closeTime)}
        </span>
      </div>

      <div className="space-y-6">
        {fields.map((priceField, priceIndex) => (
          <div key={priceField.id} className="relative">
            <PriceField
              dayIndex={dayIndex}
              priceIndex={priceIndex}
              openTime={openTime}
              closeTime={closeTime}
              control={control}
              errors={errors}
              disabled={disabled}
              prices={prices}
            />
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(priceIndex)}
                disabled={disabled}
                className="absolute top-6 right-0 h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            // Get the end time of the last time slot if there are existing slots
            let startTime = openTime;
            let price = 0;

            if (prices && prices.length > 0) {
              // Get the end time of the last slot
              const lastSlot = prices[prices.length - 1];
              if (lastSlot && lastSlot.endTime) {
                startTime = lastSlot.endTime;
              }

              // Use the price of the last slot
              if (lastSlot && lastSlot.price !== undefined) {
                price = lastSlot.price;
              }
            }

            append({
              startTime: startTime,
              endTime: closeTime,
              price: price,
            });
          }}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Thêm khung giờ
        </Button>
      </div>
    </div>
  );
}
