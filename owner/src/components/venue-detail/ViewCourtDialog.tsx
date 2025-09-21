"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon } from "lucide-react";
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
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { CourtResponse } from "@/types/field";

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

// Define the schema for court validation
const courtSchema = z.object({
  name: z.string().min(1, "Tên sân không được để trống"),
  defaultPrice: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  status: z.enum(["ENABLE", "UNABLE", "DELETED"]),
});

type CourtFormData = z.infer<typeof courtSchema>;

interface ViewCourtDialogProps {
  court: CourtResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewCourtDialog({
  court,
  open,
  onOpenChange,
}: ViewCourtDialogProps) {
  const {
    register,
    formState: { errors },
    reset,
  } = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: court.name,
      defaultPrice: court.defaultPrice,
      status: court.status,
    },
  });

  useEffect(() => {
    if (court) {
      reset({
        name: court.name,
        defaultPrice: court.defaultPrice,
        status: court.status,
      });
    }
  }, [court, reset]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ENABLE":
        return "Hoạt động";
      case "UNABLE":
        return "Tạm dừng";
      case "DELETED":
        return "Đã xóa";
      default:
        return status;
    }
  };

  // Determine if the switch should be checked (ENABLE status)
  const isCourtEnabled = court.status === "ENABLE";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <EyeIcon className="h-6 w-6 text-blue-600" />
              Thông tin sân con
            </DialogTitle>
            <DialogDescription>Thông tin chi tiết về sân con</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm">
              <div className="grid grid-cols-1 gap-8">
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
                        Tên sân:
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
                      <Label className="text-gray-600 w-32 font-medium">
                        Giá mặc định:
                      </Label>
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={formatPrice(court.defaultPrice)}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          contentEditable={false}
                        />
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Label className="text-gray-600 w-32 font-medium">
                        Trạng thái:
                      </Label>
                      <div className="flex-1 flex items-center gap-2">
                        <Switch
                          checked={isCourtEnabled}
                          disabled // Make it read-only since this is a view dialog
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                        />
                        <span className="text-sm font-medium">
                          {getStatusLabel(court.status)}
                        </span>
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

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {court.dailyPricing
                      .slice()
                      .sort((a, b) => {
                        const daysOrder: Record<string, number> = {
                          MONDAY: 1,
                          TUESDAY: 2,
                          WEDNESDAY: 3,
                          THURSDAY: 4,
                          FRIDAY: 5,
                          SATURDAY: 6,
                          SUNDAY: 7,
                        };
                        return daysOrder[a.dayOfWeek] - daysOrder[b.dayOfWeek];
                      })
                      .map((dayPricing, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 bg-white shadow-sm"
                        >
                          <h4 className="font-medium text-gray-800 mb-3">
                            {daysOfWeekMap[dayPricing.dayOfWeek]}
                          </h4>
                          <div className="space-y-2">
                            {dayPricing.prices
                              .slice()
                              .sort((a, b) => {
                                // Convert time strings to minutes for comparison
                                const [aHours, aMinutes] = a.startTime
                                  .split(":")
                                  .map(Number);
                                const [bHours, bMinutes] = b.startTime
                                  .split(":")
                                  .map(Number);
                                const aTotalMinutes = aHours * 60 + aMinutes;
                                const bTotalMinutes = bHours * 60 + bMinutes;
                                return aTotalMinutes - bTotalMinutes;
                              })
                              .map((price, priceIndex) => (
                                <div
                                  key={priceIndex}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <span className="text-sm text-gray-600">
                                    {price.startTime} - {price.endTime}
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {formatPrice(price.price)}
                                  </span>
                                </div>
                              ))}
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
              contentEditable={false}
              className="border-gray-300 hover:bg-gray-100"
            >
              Đóng
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
