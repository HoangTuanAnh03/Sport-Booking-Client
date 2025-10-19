"use client";
import React, { useRef } from "react";
import {
  FaCopy,
  FaArrowLeft,
  FaCreditCard,
  FaCalendarAlt,
  FaUserAlt,
  FaPhoneAlt,
  FaHashtag,
  FaWallet,
  FaExclamationTriangle,
  FaSpinner,
  FaExchangeAlt,
} from "react-icons/fa";
import { Camera } from "lucide-react";

import {
  useGetBookingById,
  useCancelBooking,
  useConfirmBooking,
} from "@/queries/useBooking";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useUploadVenueImageMutation } from "@/queries/useVenue";
import { useBookingStore } from "@/stores/useBookingStore";
import { ConfirmBookingRequest } from "@/types/booking";

const CountdownTimer = ({
  expiryTime,
  onExpire,
}: {
  expiryTime: Date;
  onExpire: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState("00:00");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Get current time
      const now = new Date();

      const difference = expiryTime.getTime() - now.getTime();

      if (difference <= 0) {
        if (!isExpired) {
          setIsExpired(true);
          onExpire();
        }
        return "00:00";
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, onExpire, isExpired]);

  return (
    <div className="font-mono font-bold text-center text-3xl md:text-4xl bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4 shadow-lg">
      {timeLeft}
    </div>
  );
};

export default function ConfirmBookingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const fieldId = params.id as string;
  const { data: bookingData, isLoading, error } = useGetBookingById(bookingId);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadVenueImageMutation();
  const setSelectedCourtSlots = useBookingStore(
    (state) => state.setSelectedCourtSlots
  );
  const cancelBookingMutation = useCancelBooking();
  const confirmBookingMutation = useConfirmBooking();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Payment image states
  const [paymentImage, setPaymentImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State for expired payment dialog
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);

  // Calculate expiry time based on booking createdAt + 5 minutes
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);

  // Handle booking status check and expiry time calculation
  useEffect(() => {
    if (bookingData?.payload?.data) {
      const booking = bookingData.payload.data;

      // Check if booking status is not PENDING, redirect to booking page
      if (booking.status && booking.status !== "PENDING") {
        toast({
          title: "Thông báo",
          description: "Đơn đặt này không còn ở trạng thái chờ thanh toán.",
          variant: "default",
        });
        router.push(`/booking/${fieldId}`);
        return;
      }

      // Calculate expiry time if status is PENDING
      if (booking.createdAt) {
        const createdAtTime = new Date(booking.createdAt);
        const expiryTime = new Date(createdAtTime);
        expiryTime.setMinutes(createdAtTime.getMinutes() + 5);

        // If already expired, show dialog immediately
        if (expiryTime < new Date()) {
          setShowExpiredDialog(true);
        }

        setExpiryTime(expiryTime);
      }
    }
  }, [bookingData, fieldId, router, toast]);

  // Handle expiry
  const handleExpiry = () => {
    setShowExpiredDialog(true);
  };

  // Handle redirect back to booking page
  const handleRedirectToBooking = () => {
    router.push(`/booking/${fieldId}`);
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Sao chép thành công",
      description: "Số tài khoản đã được sao chép vào clipboard",
    });
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một tệp hình ảnh hợp lệ",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước ảnh không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Upload image
      const imageUrl = await uploadImageMutation.mutateAsync(file);

      if (imageUrl) {
        setPaymentImage(imageUrl);
        toast({
          title: "Thành công",
          description: "Tải lên ảnh thanh toán thành công",
        });
      } else {
        throw new Error("Không thể tải lên ảnh");
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải lên ảnh thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    try {
      setIsCancelling(true);
      const res = await cancelBookingMutation.mutateAsync(bookingId);
      if (res.status === 200) {
        setSelectedCourtSlots(new Map());

        toast({
          title: "Hủy đơn thành công",
          description: "Đơn đặt sân đã được hủy thành công",
        });

        router.push(`/booking/${fieldId}`);
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể hủy đơn đặt sân. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.message || "Không thể hủy đơn đặt sân. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!paymentImage) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng tải lên ảnh thanh toán để xác nhận đặt sân",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConfirming(true);
      await confirmBookingMutation.mutateAsync({
        bookingId,
        paymentProofUrl: paymentImage,
      } as ConfirmBookingRequest);

      // Clear selected slots
      setSelectedCourtSlots(new Map());

      toast({
        title: "Xác nhận thành công",
        description: "Đơn đặt sân đã được xác nhận thành công",
      });

      // Redirect to booking success page or dashboard
      router.push(`/booking/${fieldId}`);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.message || "Không thể xác nhận đơn đặt sân. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-16 w-full mb-6 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <Skeleton className="h-32 w-full mt-6 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Đã xảy ra lỗi
          </h3>
          <p className="text-gray-600">
            Không thể tải thông tin đặt sân. Vui lòng thử lại sau.
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const booking = bookingData?.payload?.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Payment Expired Dialog */}
      <Dialog
        open={showExpiredDialog}
        onOpenChange={(open) => {
          setShowExpiredDialog(open);
          if (!open) {
            handleRedirectToBooking();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 gap-2">
              <FaExclamationTriangle /> Hết hạn thanh toán
            </DialogTitle>
            <DialogDescription>
              Thời gian thanh toán đã hết. Bạn cần đặt lại để tiếp tục.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleRedirectToBooking}
              className="w-full bg-gradient-to-r from-green-600 to-green-700"
            >
              Đặt sân lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center">
          <Link
            href={`/booking/${fieldId}`}
            className="mr-4 bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all"
          >
            <FaArrowLeft size={18} />
          </Link>
          <h1 className="text-center flex-1 font-bold text-xl md:text-2xl">
            Xác nhận Thanh toán
          </h1>
        </div>
      </div>

      <div className="p-5 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            {/* Bank Account Info - Improved */}
            <Card className="mb-6 overflow-hidden shadow-lg border-t-4 border-green-500 ">
              <div className="p-5">
                <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center">
                  <FaCreditCard className="mr-2" />
                  Thông tin thanh toán
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center bg-green-50 p-3 rounded-md">
                        <div>
                          <p className="text-xs text-gray-500">Tên tài khoản</p>
                          <p className="font-semibold text-green-800">
                            {booking?.venueBankHolderName ||
                              "Không có thông tin"}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-green-50 p-3 rounded-md mt-2">
                        <div>
                          <p className="text-xs text-gray-500">Số tài khoản</p>
                          <p className="font-semibold text-green-800">
                            {booking?.venueBankNumber || "Không có thông tin"}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500 text-green-600"
                          onClick={() =>
                            copyToClipboard(booking?.venueBankNumber || "")
                          }
                        >
                          <FaCopy className="mr-1" /> Sao chép
                        </Button>
                      </div>

                      <div className="flex justify-between items-center bg-green-50 p-3 rounded-md mt-2">
                        <div>
                          <p className="text-xs text-gray-500">Ngân hàng</p>
                          <p className="font-semibold text-green-800">
                            {booking?.venueBankName || "Không có thông tin"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center items-center">
                    <div className="w-40 h-40 md:w-48 md:h-48 bg-white p-3 rounded-lg shadow-inner">
                      {booking?.venueBankName && booking?.venueBankNumber ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={`https://img.vietqr.io/image/${booking.venueBankName}-${booking.venueBankNumber}-qr_only.png`}
                            alt="QR chuyển khoản"
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Không có QR
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-center font-medium">
                    Vui lòng chuyển khoản{" "}
                    <span className="font-bold text-green-700">
                      {formatCurrency(booking?.detail.totalAmount || 300000)} đ
                    </span>{" "}
                    và gửi ảnh vào ô bên dưới để hoàn tất đặt lịch
                  </p>
                </div>

                {/* Hidden file input for image upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />

                {/* Upload Image Area */}
                {paymentImage ? (
                  // Display uploaded image with hover effect
                  <div className="relative mt-4 border rounded-lg overflow-hidden h-60 group">
                    <Image
                      src={paymentImage}
                      alt="Payment proof"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        onClick={triggerFileInput}
                        className="bg-white text-green-700 hover:bg-gray-200"
                        disabled={isUploading}
                      >
                        <FaExchangeAlt className="mr-2" /> Thay đổi ảnh
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Upload button
                  <div
                    onClick={!isUploading ? triggerFileInput : undefined}
                    className={`border-2 border-dashed border-green-300 rounded-lg cursor-pointer 
                      hover:bg-green-50 transition-colors flex flex-col items-center justify-center p-5 h-40 mt-4
                      ${isUploading ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isUploading ? (
                      <>
                        <FaSpinner
                          className="text-green-500 mb-2 animate-spin"
                          size={32}
                        />
                        <span className="text-sm font-medium text-green-600 text-center">
                          Đang tải lên...
                        </span>
                      </>
                    ) : (
                      <>
                        <Camera className="text-green-500 mb-2" size={32} />
                        <span className="text-sm font-medium text-green-600 text-center">
                          Tải ảnh thanh toán (*)
                        </span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-center mt-4 gap-3">
                  <Button
                    variant="outline"
                    className="w-1/3 bg-white text-red-600 border-red-400 hover:bg-red-50 hover:text-red-700 font-bold py-3 h-auto rounded-xl transition-all"
                    disabled={isCancelling || isConfirming || isUploading}
                    onClick={handleCancelBooking}
                  >
                    {isCancelling ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" />
                        ĐANG HỦY...
                      </>
                    ) : (
                      "HỦY ĐẶT SÂN"
                    )}
                  </Button>

                  <Button
                    className="w-2/3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-lg font-bold py-3 h-auto rounded-xl shadow-lg transition-all"
                    disabled={
                      !paymentImage ||
                      isConfirming ||
                      isUploading ||
                      isCancelling
                    }
                    onClick={handleConfirmBooking}
                  >
                    {isConfirming ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" />
                        ĐANG XÁC NHẬN...
                      </>
                    ) : (
                      "XÁC NHẬN ĐẶT SÂN"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div>
            {/* Countdown Timer - Enhanced */}
            <div className="mb-6 bg-white p-5 rounded-lg shadow-lg text-center border border-green-100">
              <div className="text-sm text-gray-600 mb-3">
                Đơn của bạn còn được giữ chỗ trong
              </div>
              {expiryTime && (
                <CountdownTimer
                  expiryTime={expiryTime}
                  onExpire={handleExpiry}
                />
              )}
              <div className="text-sm text-gray-600 mt-3">
                {`Sau khi gửi ảnh, vui lòng kiểm tra trạng thái lịch đặt tại tab "Tài khoản" tới khi chủ sân xác nhận đơn.`}
              </div>
            </div>
            {/* Booking Info - Redesigned */}
            <Card className="mb-6 overflow-hidden shadow-lg">
              <div className="bg-green-600 text-white p-4">
                <h3 className="font-bold flex items-center">
                  <FaCalendarAlt className="mr-2" /> Chi tiết đặt sân
                </h3>
              </div>
              <div className="p-5 divide-y divide-gray-100">
                <div className="py-3 flex items-start">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                    <FaUserAlt className="text-green-600" size={14} />
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs text-gray-500">Tên người đặt</div>
                    <div className="font-medium">
                      {booking?.customerName || "Không có thông tin"}
                    </div>
                  </div>
                </div>

                <div className="py-3 flex items-start">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                    <FaPhoneAlt className="text-green-600" size={14} />
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs text-gray-500">Số điện thoại</div>
                    <div className="font-medium">
                      {booking?.customerPhoneNumber || "Không có thông tin"}
                    </div>
                  </div>
                </div>

                <div className="py-3 flex items-start">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                    <FaHashtag className="text-green-600" size={14} />
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs text-gray-500">Mã đơn</div>
                    <div className="font-medium">
                      {booking?.id || "Không có thông tin"}
                    </div>
                  </div>
                </div>

                <div className="py-3 flex items-start">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                    <FaCalendarAlt className="text-green-600" size={14} />
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs text-gray-500">Thời gian</div>
                    <div className="font-medium">
                      {booking?.detail.date
                        ? new Date(booking.detail.date).toLocaleDateString(
                            "vi-VN",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Không có thông tin"}
                    </div>
                    {booking?.detail.courts &&
                      booking.detail.courts.length > 0 &&
                      booking.detail.courts.map((court) => {
                        const courtId = court.id;
                        const slots = court.slots || [];
                        return (
                          <div key={courtId} className="mb-2">
                            <div className="font-semibold text-gray-700">
                              - {court?.name || `Sân ${courtId}`}
                            </div>
                            <ul className=" list-disc ml-8">
                              {slots.map((slot) => (
                                <li
                                  key={slot.startTime}
                                  className="text-gray-700"
                                >
                                  <span className="w-28 inline-block">
                                    {slot.startTime} - {slot.endTime}{" "}
                                  </span>
                                  |
                                  <span className="ml-2 text-yellow-500">
                                    {slot.price} đ
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                  </div>
                </div>
                {booking?.detail.services &&
                  booking.detail.services.length > 0 && (
                    <div className="py-3 flex items-start">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                        <FaCalendarAlt className="text-green-600" size={14} />
                      </div>
                      <div className="flex-grow">
                        <div className="text-xs text-gray-500">Dịch vụ</div>
                        {booking.detail.services.map((service) => {
                          return (
                            <div key={service.name} className="mb-2">
                              <span className="mr-2">- {service?.name}</span>|
                              <span className="ml-2 text-yellow-500">
                                {service?.pricePerUnit} đ
                              </span>
                              <span> x {service?.quantity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                <div className="py-3 flex items-start">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                    <FaWallet className="text-green-600" size={14} />
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs text-gray-500">Thành tiền</div>
                    <div className="font-bold text-lg text-green-700">
                      {formatCurrency(booking?.detail.totalAmount || 300000)} đ
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
