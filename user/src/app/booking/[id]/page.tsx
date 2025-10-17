"use client";
import type React from "react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Booking } from "./Booking";
import { useBookingStore } from "@/stores/useBookingStore";
import { useGetCourtSlotsByFieldId, useGetFieldById } from "@/queries/useField";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Hold from "@/app/booking/[id]/Hold";
import { formatDateToYMD } from "@/lib/utils";

export default function BookingPage() {
  const setFieldDetails = useBookingStore((state) => state.setFieldDetails);
  const dateSelection = useBookingStore((state) => state.dateSelection);
  const setDateSelection = useBookingStore((state) => state.setDateSelection);
  const totalPrice = useBookingStore((state) => state.totalPrice);
  const params = useParams();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [openHold, setOpenHold] = useState(false);

  const { data } = useGetCourtSlotsByFieldId(
    id,
    formatDateToYMD(dateSelection)
  );

  const { data: fieldInfo } = useGetFieldById(Number(id));

  useEffect(() => {
    if (data) {
      setFieldDetails(data.payload.data ?? null);
    }
  }, [data, setFieldDetails]);

  if (openHold) {
    return (
      <Hold
        fieldInfo={fieldInfo?.payload.data}
        courts={data?.payload.data}
        setOpenHold={setOpenHold}
      />
    );
  }

  function handleHold(): void {
    setOpenHold(true);
  }

  return (
    <div className="relative h-[calc(100vh-65px)] w-full overflow-hidden z-[1000]">
      {/* Green Header with Title, Legend and Date Picker */}
      <div className="bg-green-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          {/* Title */}
          <h1 className="text-lg font-semibold">Đặt sân theo khung giờ</h1>

          {/* Status Legend */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white rounded"></div>
              <span className="text-sm">Trống</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="text-sm">Đã đặt</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-500 rounded"></div>
              <span className="text-sm">Khoá</span>
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <div className="bg-green-300 text-gray-800 flex flex-col rounded-lg">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="bg-green-300 w-48 justify-between font-normal"
              >
                {dateSelection
                  ? dateSelection.toLocaleDateString()
                  : "Chọn ngày"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={dateSelection}
                captionLayout="dropdown"
                onSelect={(date) => {
                  if (date) setDateSelection(date);
                  setDatePickerOpen(false);
                }}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Booking Content */}
      <div className="">
        <Booking />
      </div>

      {/* Enhanced Payment Footer */}
      <div
        className={`fixed left-0 w-full bg-gradient-to-r from-green-600 to-green-700 border-t-4 border-green-500 p-6 flex justify-between items-center transition-all duration-300 ease-in-out shadow-2xl ${
          totalPrice > 0
            ? "bottom-0 translate-y-0 opacity-100"
            : "bottom-0 translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col">
          <span className="text-sm text-green-100 font-medium mb-1">
            Tổng chi phí
          </span>
          <div className="text-2xl font-bold text-white flex items-center">
            <span className="mr-2">💰</span>
            {totalPrice.toLocaleString("vi-VN")} VND
          </div>
        </div>
        <Button
          className={`px-8 py-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
            totalPrice > 0
              ? "bg-white text-green-700 hover:bg-green-50 hover:shadow-xl border-2 border-white"
              : "bg-gray-400 text-white cursor-not-allowed opacity-50"
          }`}
          onClick={handleHold}
          disabled={totalPrice === 0}
        >
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏃‍♂️</span>
            <span>Thanh toán ngay</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
