"use client";
import type React from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { Booking } from "@/app/booking/Booking";
import { BookingInfoModal } from "@/app/booking/components/BookingInfoModal";
import PaymentModal from "@/app/booking/components/PaymentModal";
import {
  useConfirmBooking,
  useCreateBookingMutation,
} from "@/queries/useCourt";
import { PaymentInf } from "@/types/court";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingComponent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const fieldId = searchParams.get("fieldid");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeslots, setSelectedTimeslots] = useState<
    Map<
      string,
      {
        start_time: string;
        end_time: string;
      }[]
    >
  >(new Map());
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [showBookingInfoModal, setShowBookingInfoModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInf, setPaymentInf] = useState<PaymentInf>();
  const [resetSignal, setResetSignal] = useState(0);
  const { toast } = useToast();

  const createBookingMutation = useCreateBookingMutation();
  const confirmBooking = useConfirmBooking();

  if (!fieldId) {
    return <div>Field ID không tồn tại</div>;
  }

  const handleSelectionChange = (data: {
    selectedTimeslots: Map<string, { start_time: string; end_time: string }[]>;
    totalPrice: number;
  }) => {
    setSelectedTimeslots(data.selectedTimeslots);
    setTotalPrice(data.totalPrice);
  };

  const handleCheckout = () => {
    setShowBookingInfoModal(true);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirmPayment = (bookingId?: string) => {
    if (bookingId) {
      confirmBooking.mutate(bookingId, {
        onSuccess: (data) => {
          setShowPaymentModal(false);
          if (data.status == 200) {
            toast({
              // variant: "destructive",
              title: "Đặt sân thành công",
            });
            console.log("Đặt sân thành công");
          }
        },
      });
    }
  };

  const reset = () => {
    setTotalPrice(0);
    setSelectedTimeslots(() => new Map());
    setResetSignal((prev) => prev + 1);
    queryClient.invalidateQueries({
      queryKey: [
        "getCourtTimeByFieldId",
        fieldId,
        formatDateToYMD(selectedDate),
      ],
    });
  };
  const handleModalConfirm = (info: { name: string; phone: string }) => {
    const bookingDetail = {
      field_id: fieldId,
      customer_name: info.name,
      customer_phone: info.phone,
      booking_date: formatDateToYMD(selectedDate),
      court: Object.fromEntries(selectedTimeslots),
    };

    createBookingMutation.mutate(bookingDetail, {
      onSuccess: (data) => {
        setPaymentInf(data?.payload.data);
        setShowPaymentModal(true);
        setShowBookingInfoModal(false);
        reset();
      },
    });
  };

  return (
    <div className="relative h-[calc(100vh-65px)] w-full overflow-hidden z-[1000]">
      <div className="absolute top-4 right-4 rounded-md bg-white p-2">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          className="px-4 py-2 border rounded  shadow-lg"
          placeholderText="Select a date"
          minDate={new Date()}
        />
      </div>
      <div className="pt-20">
        <Booking
          fieldId={fieldId}
          date={formatDateToYMD(selectedDate)}
          onSelectionChange={handleSelectionChange}
          resetSignal={resetSignal}
        />
        <BookingInfoModal
          open={showBookingInfoModal}
          onClose={() => setShowBookingInfoModal(false)}
          onConfirm={handleModalConfirm}
        />
        <PaymentModal
          paymentInfo={paymentInf}
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleConfirmPayment}
        />
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-between items-center">
        <div className="text-lg font-semibold">
          Tổng tiền: {totalPrice.toLocaleString()} VND
        </div>
        {totalPrice != 0 ? (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            onClick={handleCheckout}
          >
            Thanh toán
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-400 text-white px-6 py-2 rounded cursor-not-allowed"
          >
            Thanh toán
          </button>
        )}
      </div>
    </div>
  );
}
