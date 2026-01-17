"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetBookingById, useCancelBooking } from "@/queries/useBooking";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Package,
  Star,
  RefreshCw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useBookingStore } from "@/stores/useBookingStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import reviewApiRequest from "@/apiRequests/review";
import { CreateReviewRequest } from "@/types/review";

// Status configuration
const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode; description: string }
> = {
  PENDING: {
    label: "Chờ thanh toán",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: <Clock className="h-5 w-5" />,
    description: "Đơn đặt sân đang chờ thanh toán",
  },
  EXPIRED: {
    label: "Huỷ do quá giờ thanh toán",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: <XCircle className="h-5 w-5" />,
    description: "Đơn đã hết hạn thanh toán",
  },
  CUSTOMER_CANCELED: {
    label: "Đã huỷ",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: <XCircle className="h-5 w-5" />,
    description: "Bạn đã huỷ đơn đặt sân này",
  },
  OWNER_CANCELED: {
    label: "Bị từ chối",
    color: "bg-orange-100 text-orange-700 border-orange-300",
    icon: <XCircle className="h-5 w-5" />,
    description: "Chủ sân đã từ chối đơn đặt này",
  },
  CONFIRMED: {
    label: "Chờ xác nhận",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: <CheckCircle2 className="h-5 w-5" />,
    description: "Đơn đặt sân đang chờ xác nhận từ chủ sân",
  },
  COMPLETED: {
    label: "Đã xác nhận",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: <CheckCircle2 className="h-5 w-5" />,
    description: "Đơn đặt sân đã được xác nhận",
  },
};

export default function BookingHistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const historyId = params.historyId as string;
  const { toast } = useToast();
  const setSelectedCourtSlots = useBookingStore(
    (state) => state.setSelectedCourtSlots
  );

  const {
    data: bookingData,
    isLoading,
    error,
    refetch,
  } = useGetBookingById(historyId);

  const cancelBookingMutation = useCancelBooking();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Review state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Check if all time slots have passed
  const hasAllTimeSlotsPassed = (booking: any) => {
    if (!booking?.detail?.courts || booking.detail.courts.length === 0) {
      return false;
    }

    const now = new Date();
    const bookingDate = parseISO(booking.detail.date);

    let latestEndTime = "";
    booking.detail.courts.forEach((court: any) => {
      if (court.slots && court.slots.length > 0) {
        court.slots.forEach((slot: any) => {
          if (slot.endTime > latestEndTime) {
            latestEndTime = slot.endTime;
          }
        });
      }
    });

    if (!latestEndTime) return false;

    const [hours, minutes] = latestEndTime.split(":").map(Number);
    const slotEndDateTime = new Date(bookingDate);
    slotEndDateTime.setHours(hours, minutes, 0, 0);

    return now > slotEndDateTime;
  };

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!booking?.detail?.fieldId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin sân",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCancelling(true);
      const res = await cancelBookingMutation.mutateAsync(historyId);
      if (res.status === 200) {
        setSelectedCourtSlots(new Map());

        toast({
          title: "Hủy đơn thành công",
          description: "Đơn đặt sân đã được hủy thành công",
        });

        router.push(`/booking/history`);
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
      setShowCancelDialog(false);
    }
  };

  // Review handlers
  const openReviewDialog = () => {
    setReviewRating(0);
    setHoveredRating(0);
    setReviewComment("");
    setIsReviewDialogOpen(true);
  };

  const closeReviewDialog = () => {
    setIsReviewDialogOpen(false);
    setReviewRating(0);
    setHoveredRating(0);
    setReviewComment("");
  };

  const handleSubmitReview = async () => {
    if (!booking) return;

    if (reviewRating === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn số sao đánh giá",
        variant: "destructive",
      });
      return;
    }

    if (!reviewComment.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung đánh giá",
        variant: "destructive",
      });
      return;
    }

    if (reviewComment.length > 1000) {
      toast({
        title: "Lỗi",
        description: "Nội dung đánh giá không được vượt quá 1000 ký tự",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);

    try {
      const payload: CreateReviewRequest = {
        rating: reviewRating,
        comment: reviewComment.trim(),
        venueId: booking.venueId,
      };

      await reviewApiRequest.sCreateReview(payload);

      toast({
        title: "Thành công",
        description: "Đánh giá của bạn đã được gửi thành công!",
      });
      closeReviewDialog();
      refetch(); // Refresh booking details to update isReview status
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Lỗi",
        description:
          error?.message || "Không thể gửi đánh giá. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-5 shadow-md">
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-8 w-64 bg-white/20" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto p-6">
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Không thể tải thông tin đơn đặt
            </h3>
            <p className="text-gray-600 mb-6">
              Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/booking/history")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button
                onClick={() => refetch()}
                className="bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const booking = bookingData?.payload?.data;
  const canReview =
    booking?.status === "COMPLETED" && hasAllTimeSlotsPassed(booking);
  const canRebook = [
    "COMPLETED",
    "CUSTOMER_CANCELED",
    "OWNER_CANCELED",
    "EXPIRED",
  ].includes(booking?.status || "");
  const isPending = booking?.status === "PENDING";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Cancel Booking Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy đặt sân</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn đặt sân này không? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Không</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? "Đang hủy..." : "Có, hủy đơn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-5 shadow-md">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/booking/history")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Chi tiết đơn đặt sân</h1>
              <p className="text-green-100 text-sm mt-1">
                Mã đơn: {booking?.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Status Banner */}
        <Card className="mb-6 overflow-hidden border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  {statusConfig[booking?.status!]?.icon || (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={
                      statusConfig[String(booking?.status || "")]?.color ||
                      "bg-gray-100"
                    }
                  >
                    {statusConfig[booking?.status!]?.label || "Không xác định"}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    {statusConfig[booking?.status!]?.description || ""}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Đặt ngày:{" "}
                    {format(
                      parseISO(booking?.createdAt || ""),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isPending && (
                  <>
                    <Button
                      onClick={() => setShowCancelDialog(true)}
                      variant="outline"
                      disabled={isCancelling}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {isCancelling ? "Đang hủy..." : "Hủy đặt sân"}
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(
                          `/booking/${booking.detail.fieldId}/confirm/${booking.id}`
                        )
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Thanh toán
                    </Button>
                  </>
                )}
                {canReview && (
                  <Button
                    onClick={openReviewDialog}
                    className="bg-amber-500 hover:bg-amber-600 focus:ring-amber-500"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Đánh giá
                  </Button>
                )}
                {canRebook && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/booking/${booking?.detail.fieldId}`)
                    }
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Đặt lại
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Venue Information */}
            <Card className="overflow-hidden shadow-lg">
              <div className="bg-green-600 text-white p-4">
                <h2 className="font-bold text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Thông tin sân
                </h2>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  {booking?.venueName}
                </h3>
                <div className="flex items-start text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-green-600" />
                  <p className="text-sm">{booking?.venueAddress}</p>
                </div>
                <Separator className="my-4" />

                {/* Courts and Time Slots */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    Ngày đặt: {formatDate(booking?.detail?.date || "")}
                  </h4>

                  {booking?.detail?.courts?.map((court: any) => (
                    <div key={court.id} className="bg-green-50 p-4 rounded-lg">
                      <div className="font-semibold text-green-800 mb-3">
                        {court.name}
                      </div>
                      <div className="space-y-2">
                        {court.slots?.map((slot: any) => (
                          <div
                            key={slot.startTime}
                            className="flex justify-between items-center bg-white p-3 rounded-md"
                          >
                            <div className="flex items-center text-gray-700">
                              <Clock className="h-4 w-4 mr-2 text-green-600" />
                              <span>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <span className="font-semibold text-green-700">
                              {formatCurrency(slot.price)} đ
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Services */}
                {booking?.detail?.services &&
                  booking.detail.services.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center">
                          <Package className="h-4 w-4 mr-2 text-green-600" />
                          Dịch vụ
                        </h4>
                        {booking.detail.services.map(
                          (service: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-green-50 p-3 rounded-md"
                            >
                              <div>
                                <span className="font-medium text-gray-800">
                                  {service.name}
                                </span>
                                <span className="text-gray-600 text-sm ml-2">
                                  x{service.quantity}
                                </span>
                              </div>
                              <span className="font-semibold text-green-700">
                                {formatCurrency(
                                  service.pricePerUnit * service.quantity
                                )}{" "}
                                đ
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
              </CardContent>
            </Card>

            {/* Payment Proof (if available) */}
            {booking?.imageUrl && (
              <Card className="overflow-hidden shadow-lg">
                <div className="bg-green-600 text-white p-4">
                  <h2 className="font-bold text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Ảnh chứng từ thanh toán
                  </h2>
                </div>
                <CardContent className="p-6">
                  <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
                    <Image
                      src={booking.imageUrl}
                      alt="Ảnh chứng từ thanh toán"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">
                    Ảnh chứng từ thanh toán đã được gửi đến chủ sân
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Customer & Payment Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="overflow-hidden shadow-lg">
              <div className="bg-green-600 text-white p-4">
                <h2 className="font-bold flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Thông tin khách hàng
                </h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3 flex-shrink-0">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Tên người đặt</div>
                    <div className="font-medium text-gray-800">
                      {booking?.customerName}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3 flex-shrink-0">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Số điện thoại</div>
                    <div className="font-medium text-gray-800">
                      {booking?.customerPhoneNumber}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="overflow-hidden shadow-lg border-t-4 border-t-green-500">
              <div className="bg-green-600 text-white p-4">
                <h2 className="font-bold flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Thanh toán
                </h2>
              </div>
              <CardContent className="p-6 space-y-4">
                {/* Court costs */}
                <div>
                  <div className="text-sm text-gray-600 mb-2">Chi phí sân</div>
                  {booking?.detail?.courts?.map((court: any) => {
                    const courtTotal = court.slots?.reduce(
                      (sum: number, slot: any) => sum + slot.price,
                      0
                    );
                    return (
                      <div
                        key={court.id}
                        className="flex justify-between text-sm mb-1"
                      >
                        <span className="text-gray-700">{court.name}</span>
                        <span className="font-medium">
                          {formatCurrency(courtTotal)} đ
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Service costs */}
                {booking?.detail?.services &&
                  booking.detail.services.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">
                        Chi phí dịch vụ
                      </div>
                      {booking.detail.services.map(
                        (service: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm mb-1"
                          >
                            <span className="text-gray-700">
                              {service.name} x{service.quantity}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(
                                service.pricePerUnit * service.quantity
                              )}{" "}
                              đ
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg">
                  <span className="font-bold text-gray-800">
                    Tổng thanh toán
                  </span>
                  <span className="text-xl font-bold text-green-700">
                    {formatCurrency(booking?.detail?.totalAmount || 0)} đ
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Bank Info (if available) */}
            {booking?.venueBankNumber && (
              <Card className="overflow-hidden shadow-lg">
                <div className="bg-green-600 text-white p-4">
                  <h2 className="font-bold flex items-center text-sm">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Thông tin chuyển khoản
                  </h2>
                </div>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-medium">{booking.venueBankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số TK:</span>
                    <span className="font-medium">
                      {booking.venueBankNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chủ TK:</span>
                    <span className="font-medium">
                      {booking.venueBankHolderName}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-green-800">Đánh giá sân</DialogTitle>
            <DialogDescription>
              {booking && (
                <span className="font-medium text-green-700">
                  {booking.venueName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Đánh giá của bạn <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || reviewRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {reviewRating > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    {reviewRating} sao
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nhận xét <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Chia sẻ trải nghiệm của bạn về sân..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="min-h-[120px] resize-none focus:ring-green-500 focus:border-green-500"
                maxLength={1000}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Tối đa 1000 ký tự</span>
                <span>{reviewComment.length}/1000</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeReviewDialog}
              disabled={isSubmittingReview}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSubmitReview}
              disabled={
                isSubmittingReview || reviewRating === 0 || !reviewComment.trim()
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
