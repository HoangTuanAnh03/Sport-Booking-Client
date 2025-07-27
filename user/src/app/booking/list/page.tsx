"use client";
import { useGetListBooking } from "@/queries/useBooking";
import type React from "react";
import { useState, useEffect } from "react";
import type { Booking } from "@/types/booking";

export default function BookingListPage() {
  const [listBooking, setListBooking] = useState<Booking[]>([]);
  const { data, isLoading } = useGetListBooking();

  useEffect(() => {
    if (Array.isArray(data?.payload?.data)) {
      setListBooking(data.payload.data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white p-6">
        <div className="flex justify-center items-center w-full text-2xl font-bold text-[#009966] mb-6">
          Danh sách sân đã đặt
        </div>
        <div className="animate-pulse">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex flex-row justify-between gap-4 border-b border-gray-200 mb-4 pb-4"
            >
              <div className="w-full">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 ml-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 ml-3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
              </div>
              <div className="pt-4 pr-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <div className="flex justify-center items-center w-full text-2xl font-bold text-[#009966] mb-6">
        Danh sách sân đã đặt
      </div>
      {listBooking.length === 0 && <div>Không có đơn nào.</div>}
      {listBooking.map((booking) => (
        <div
          key={booking.booking_id}
          className="flex flex-row justify-between gap-4 border-b border-gray-200 mb-4 pb-4"
        >
          <div>
            <div className="text-[#F15A24] font-semibold text-lg mb-1">
              {booking.venue_name}
            </div>
            <div className="text-gray-900 mb-0.5">
              <div className="font-medium">Chi tiết:</div>
              {booking.court_slots.map((slot, idx) => (
                <div key={slot.court_id + idx} className="ml-3">
                  {slot.court_name}: {slot.start_time} - {slot.end_time} | Ngày{" "}
                  {slot.date}
                </div>
              ))}
            </div>
            <div className="text-gray-900 mb-0.5">
              Địa chỉ:{" "}
              <span className="font-medium">{booking.venue_address}</span>
            </div>
          </div>
          <div className="pt-4 pr-4">
            <span
              className={`flex items-center gap-2 font-semibold mr-2 ${
                booking.status === "Đã hủy"
                  ? "text-red-500"
                  : booking.status === "Đã xác nhận"
                  ? "text-green-600"
                  : booking.status === "Chờ thanh toán"
                  ? "text-orange-500"
                  : booking.status === "Chờ chủ sân xác nhận"
                  ? "text-blue-500"
                  : "text-gray-500"
              }`}
            >
              {booking.status === "Đã hủy" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {booking.status === "Đã xác nhận" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {booking.status === "Chờ thanh toán" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {booking.status === "Chờ chủ sân xác nhận" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {booking.status === "Hủy do quá thời gian" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              )}
              {booking.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
