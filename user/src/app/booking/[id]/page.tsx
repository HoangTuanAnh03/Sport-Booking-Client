"use client";
import type React from "react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { Booking } from "./Booking";
import { addMonths, endOfMonth } from "date-fns";
import { useBookingStore } from "@/stores/useBookingStore";
import { useGetCourtSlotsByFieldId } from "@/queries/useField";
import { CalendarSearch } from "lucide-react";

function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingPage() {
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const setFieldDetails = useBookingStore((state) => state.setFieldDetails);
  const dateSelection = useBookingStore((state) => state.dateSelection);
  const setDateSelection = useBookingStore((state) => state.setDateSelection);
  const totalPrice = useBookingStore((state) => state.totalPrice);
  const params = useParams();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const { data } = useGetCourtSlotsByFieldId(
    id,
    formatDateToYMD(dateSelection)
  );

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setDateSelection(date);
    }
  };

  useEffect(() => {
    if (data) {
      setFieldDetails(data.payload.data ?? null);
    }
  }, [data, setFieldDetails]);

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
        <div className="bg-green-300 rounded-md p-2 px-4 flex items-center space-x-2 ">
          <DatePicker
            selected={dateSelection}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            className=" py-2 text-gray-800 border-0 outline-none bg-transparent w-32 text-left"
            minDate={new Date()}
            maxDate={endOfMonth(
              addMonths(new Date(), (data?.payload.data?.monthLimit || 2) - 1)
            )}
          />
          <CalendarSearch color="black" className="mr-6" />
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
        <button
          className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
            totalPrice > 0
              ? "bg-white text-green-700 hover:bg-green-50 hover:shadow-xl border-2 border-white"
              : "bg-gray-400 text-white cursor-not-allowed opacity-50"
          }`}
          // onClick={handleCheckout}
          disabled={totalPrice === 0}
        >
          <div className="flex items-center space-x-2">
            <span>🏃‍♂️</span>
            <span>Thanh toán ngay</span>
          </div>
        </button>
      </div>
    </div>
  );
}
