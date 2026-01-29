"use client";

import React, { useState, useEffect } from "react";
import {
  useGetListBookingQuery,
  useConfirmBookingMutation,
  useCancelBookingMutation,
  useGetBookingByIdQuery,
} from "@/queries/useBooking";
import { useGetMyVenuesQuery } from "@/queries/useVenue";
import { useGetFieldsByVenueIdQuery } from "@/queries/useField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  WalletIcon,
  BadgeCheckIcon,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BookingOwnerResponse, BookingStatus } from "@/types/booking";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  CONFIRMED: "bg-green-500",
  CANCELLED: "bg-red-500",
  COMPLETED: "bg-blue-500",
  EXPIRED: "bg-gray-500",
  CUSTOMER_CANCELED: "bg-red-400",
  OWNER_CANCELED: "bg-red-500",
};

// PENDING,
//     EXPIRED,
//     CUSTOMER_CANCELED,
//     OWNER_CANCELED,
//     CONFIRMED,
//     COMPLETED,

const statusLabels: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Chờ xác nhận",
  EXPIRED: "Quá hạn thanh toán",
  OWNER_CANCELED: "Đã hủy",
  CUSTOMER_CANCELED: "Khách hủy",
  COMPLETED: "Hoàn thành",
};

export default function BookingsPage() {
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [venueId, setVenueId] = useState<number | undefined>(undefined);
  const [fieldId, setFieldId] = useState<number | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingOwnerResponse | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingIdFromUrl = searchParams.get("id");

  const { data: bookingFromUrl, isSuccess: isBookingFromUrlSuccess } =
    useGetBookingByIdQuery(bookingIdFromUrl);

  useEffect(() => {
    if (isBookingFromUrlSuccess && bookingFromUrl) {
      setSelectedBooking(bookingFromUrl);
      setDetailDialogOpen(true);
    }
  }, [isBookingFromUrlSuccess, bookingFromUrl]);

  const handleDialogClose = (open: boolean) => {
    setDetailDialogOpen(open);
    if (!open && bookingIdFromUrl) {
      router.replace("/bookings", { scroll: false });
    }
  };

  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateString = date
    ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    : undefined;

  const { data: bookingsData, isLoading } = useGetListBookingQuery({
    pageNo,
    pageSize,
    search: search || undefined,
    status: status || undefined,
    venueId,
    fieldId,
    date: dateString,
  });

  const { data: venues } = useGetMyVenuesQuery();
  const { data: fields } = useGetFieldsByVenueIdQuery(venueId || 0);

  const confirmMutation = useConfirmBookingMutation();
  const cancelMutation = useCancelBookingMutation();

  const handleConfirm = (bookingId: string) => {
    confirmMutation.mutate(bookingId);
  };

  const handleCancel = (bookingId: string) => {
    cancelMutation.mutate(bookingId);
  };

  const handleViewDetail = (booking: BookingOwnerResponse) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleVenueChange = (value: string) => {
    if (value === "all") {
      setVenueId(undefined);
      setFieldId(undefined);
    } else {
      setVenueId(Number(value));
      setFieldId(undefined);
    }
  };

  const handleFieldChange = (value: string) => {
    if (value === "all") {
      setFieldId(undefined);
    } else {
      setFieldId(Number(value));
    }
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "all" ? "" : value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPageNo(0);
  };

  const totalPages = bookingsData?.totalPages || 0;
  const bookings = bookingsData?.content || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
          <CalendarIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-green-700">Quản lý đặt sân</h1>
          <p className="text-muted-foreground">
            Danh sách các booking từ khách hàng
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-green-200 shadow-md">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-700">Bộ lọc & Tìm kiếm</CardTitle>
          <CardDescription>
            Sử dụng các bộ lọc để tìm kiếm booking nhanh hơn
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* All filters on same line */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tên khách hàng, SĐT..."
                    value={search}
                    onChange={handleSearchChange}
                    className="pl-10 border-green-200 focus:border-green-500 h-9"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <Select
                  value={status || "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500 h-9">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                    <SelectItem value="CONFIRMED">Chờ xác nhận</SelectItem>
                    <SelectItem value="EXPIRED">Quá hạn thanh toán</SelectItem>
                    <SelectItem value="OWNER_CANCELED">Đã hủy</SelectItem>
                    <SelectItem value="CUSTOMER_CANCELED">Khách hủy</SelectItem>
                    <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Venue Filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Địa điểm
                </label>
                <Select
                  value={venueId ? String(venueId) : "all"}
                  onValueChange={handleVenueChange}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500 h-9">
                    <SelectValue placeholder="Tất cả địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả địa điểm</SelectItem>
                    {venues?.map((venue) => (
                      <SelectItem key={venue.id} value={String(venue.id)}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Field Filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Cụm sân
                </label>
                <Select
                  value={fieldId ? String(fieldId) : "all"}
                  onValueChange={handleFieldChange}
                  disabled={!venueId}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500 h-9">
                    <SelectValue placeholder="Tất cả cụm sân" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả cụm sân</SelectItem>
                    {fields?.map((field) => (
                      <SelectItem key={field.id} value={String(field.id)}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Ngày đặt
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-green-200 focus:border-green-500 h-9"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        format(date, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span className="text-muted-foreground">Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                    {date && (
                      <div className="p-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setDate(undefined)}
                        >
                          Xóa bộ lọc ngày
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table Card */}
      <Card className="border-green-200 shadow-md">
        <CardHeader className="bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-green-700">
                Danh sách booking
              </CardTitle>
              <CardDescription>
                Tổng số {bookingsData?.totalElements || 0} booking
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {bookings.length > 0 ? (
            <>
              <div className="rounded-md border border-green-200">
                <Table className="px-2">
                  <TableHeader>
                    <TableRow className="bg-green-50">
                      <TableHead className="font-semibold text-green-700 pl-4">
                        Khách hàng
                      </TableHead>
                      <TableHead className="font-semibold text-green-700">
                        Địa điểm
                      </TableHead>
                      <TableHead className="font-semibold text-green-700 text-center">
                        Ngày đặt
                      </TableHead>
                      <TableHead className="font-semibold text-green-700 text-center">
                        Tổng tiền
                      </TableHead>
                      <TableHead className="font-semibold text-green-700 text-center">
                        Trạng thái
                      </TableHead>
                      <TableHead className="font-semibold text-green-700 text-center">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        className="hover:bg-green-50/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {booking.customerName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {booking.customerPhoneNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {booking.venueName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Field #{booking.fieldId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {format(new Date(booking.detail.date), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600 text-center">
                          {booking.detail.totalAmount.toLocaleString("vi-VN")}đ
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`${
                              statusColors[booking.status]
                            } text-white`}
                          >
                            {statusLabels[booking.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Left side - Action buttons */}
                            <div className="flex gap-2">
                              {booking.status === BookingStatus.PENDING && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancel(booking.id)}
                                  disabled={cancelMutation.isPending}
                                >
                                  <XCircleIcon className="h-4 w-4 mr-1" />
                                  Hủy
                                </Button>
                              )}
                              {booking.status === BookingStatus.CONFIRMED && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleConfirm(booking.id)}
                                    disabled={confirmMutation.isPending}
                                  >
                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                    Xác nhận
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleCancel(booking.id)}
                                    disabled={cancelMutation.isPending}
                                  >
                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                    Hủy
                                  </Button>
                                </>
                              )}
                            </div>

                            {/* Right side - Detail button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => handleViewDetail(booking)}
                            >
                              Chi tiết
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Trang {pageNo + 1} / {totalPages > 0 ? totalPages : 1}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNo((prev) => Math.max(0, prev - 1))}
                    disabled={pageNo === 0}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPageNo((prev) => Math.min(totalPages - 1, prev + 1))
                    }
                    disabled={pageNo >= totalPages - 1 || totalPages === 0}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    Sau
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <CalendarIcon className="h-16 w-16 mb-4 text-green-300" />
              <p className="text-lg">Không có booking nào</p>
              <p className="text-sm">Thử thay đổi bộ lọc để tìm kiếm</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 relative">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-2xl text-green-700 flex items-center gap-2 flex-1">
                <CalendarIcon className="h-6 w-6" />
                Chi tiết booking
              </DialogTitle>
              {selectedBooking && (
                <Badge
                  className={`${
                    statusColors[selectedBooking.status]
                  } text-white px-3 py-1.5 text-sm font-medium whitespace-nowrap mr-8 absolute right-0 top-4`}
                >
                  {statusLabels[selectedBooking.status]}
                </Badge>
              )}
            </div>
            <DialogDescription className="mt-2">
              Thông tin chi tiết về booking #{selectedBooking?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Payment Image */}
              <div className="space-y-4">
                {/* Payment Image Card */}
                <Card className="border-green-200 overflow-hidden shadow-lg">
                  <CardHeader className="bg-green-600 text-white p-4">
                    <CardTitle className="text-lg font-bold">
                      Ảnh thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {selectedBooking.imageUrl ? (
                      <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={selectedBooking.imageUrl}
                          alt="Payment proof"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <CalendarIcon className="h-16 w-16 mx-auto mb-2 text-gray-300" />
                          <p>Chưa có ảnh thanh toán</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons - Show for PENDING or CONFIRMED status */}
                {selectedBooking.status === BookingStatus.PENDING && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white text-red-600 border-red-400 hover:bg-red-50 hover:text-red-700 font-bold py-6 rounded-xl transition-all"
                      onClick={() => {
                        handleCancel(selectedBooking.id);
                        setDetailDialogOpen(false);
                      }}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Đang từ chối...
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-5 w-5 mr-2" />
                          TỪ CHỐI
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {selectedBooking.status === BookingStatus.CONFIRMED && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white text-red-600 border-red-400 hover:bg-red-50 hover:text-red-700 font-bold py-6 rounded-xl transition-all"
                      onClick={() => {
                        handleCancel(selectedBooking.id);
                        setDetailDialogOpen(false);
                      }}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Đang từ chối...
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-5 w-5 mr-2" />
                          TỪ CHỐI
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-[2] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-6 rounded-xl shadow-lg transition-all"
                      onClick={() => {
                        handleConfirm(selectedBooking.id);
                        setDetailDialogOpen(false);
                      }}
                      disabled={confirmMutation.isPending}
                    >
                      {confirmMutation.isPending ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          ĐANG XÁC NHẬN...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          XÁC NHẬN ĐẶT SÂN
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column - Booking Information */}
              <div className="space-y-4">
                {/* Booking Info Card */}
                <Card className="border-green-200 overflow-hidden shadow-lg">
                  <CardHeader className="bg-green-600 text-white p-4">
                    <CardTitle className="text-lg font-bold flex items-center">
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      Chi tiết đặt sân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 divide-y divide-gray-100">
                    {/* Venue Name */}
                    <div className="py-3 flex items-start">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                        <MapPinIcon className="text-green-600 h-4 w-4" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-xs text-gray-500">Tên sân</div>
                        <div className="font-medium">
                          {selectedBooking.venueName}
                        </div>
                      </div>
                    </div>

                    {/* Venue Address */}
                    <div className="py-3 flex items-start">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                        <MapPinIcon className="text-green-600 h-4 w-4" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-xs text-gray-500">Địa chỉ sân</div>
                        <div className="font-medium">
                          {selectedBooking.venueAddress}
                        </div>
                      </div>
                    </div>

                    {/* Customer Name */}
                    <div className="py-3 flex items-start">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                        <UserIcon className="text-green-600 h-4 w-4" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-xs text-gray-500">
                          Tên người đặt
                        </div>
                        <div className="font-medium">
                          {selectedBooking.customerName}
                        </div>
                      </div>
                    </div>

                    {/* Customer Phone */}
                    <div className="py-3 flex items-start">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                        <PhoneIcon className="text-green-600 h-4 w-4" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-xs text-gray-500">
                          Số điện thoại
                        </div>
                        <div className="font-medium">
                          {selectedBooking.customerPhoneNumber}
                        </div>
                      </div>
                    </div>

                    {/* Customer Email */}
                    <div className="py-3 flex items-start">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                        <UserIcon className="text-green-600 h-4 w-4" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="font-medium">
                          {selectedBooking.userEmail}
                        </div>
                      </div>
                    </div>

                    {/* Booking ID */}
                    <div className="py-3 flex items-start">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                        <span className="text-green-600 font-bold text-xs">
                          #
                        </span>
                      </div>
                      <div className="flex-grow">
                        <div className="text-xs text-gray-500">Mã đơn</div>
                        <div className="font-medium font-mono text-sm">
                          {selectedBooking.id}
                        </div>
                      </div>
                    </div>

                    {/* Date and Time Slots */}
                    <div className="py-3 flex items-start">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                        <CalendarIcon className="text-green-600 h-4 w-4" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-xs text-gray-500">Thời gian</div>
                        <div className="font-medium mb-2">
                          {format(
                            new Date(selectedBooking.detail.date),
                            "EEEE, dd/MM/yyyy",
                            { locale: vi }
                          )}
                        </div>
                        {selectedBooking.detail.courts.map((court) => (
                          <div key={court.id} className="mb-2">
                            <div className="font-semibold text-gray-700">
                              - {court.name}
                            </div>
                            <ul className="list-disc ml-8">
                              {court.slots.map((slot) => (
                                <li
                                  key={slot.startTime}
                                  className="text-gray-700 text-sm"
                                >
                                  <span className="w-28 inline-block">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  |
                                  <span className="ml-2 text-yellow-600 font-medium">
                                    {slot.price.toLocaleString("vi-VN")} đ
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Services */}
                    {selectedBooking.detail.services &&
                      selectedBooking.detail.services.length > 0 && (
                        <div className="py-3 flex items-start">
                          <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                            <ClockIcon className="text-green-600 h-4 w-4" />
                          </div>
                          <div className="flex-grow">
                            <div className="text-xs text-gray-500">Dịch vụ</div>
                            {selectedBooking.detail.services.map((service) => (
                              <div key={service.name} className="mb-1 text-sm">
                                <span className="mr-2">- {service.name}</span>|
                                <span className="ml-2 text-yellow-600 font-medium">
                                  {service.pricePerUnit.toLocaleString("vi-VN")}{" "}
                                  đ
                                </span>
                                <span> x {service.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Note */}
                    {selectedBooking.note && (
                      <div className="py-3 flex items-start">
                        <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                          <span className="text-green-600 font-bold text-xs">
                            📝
                          </span>
                        </div>
                        <div className="flex-grow">
                          <div className="text-xs text-gray-500">Ghi chú</div>
                          <div className="font-medium">
                            {selectedBooking.note}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total Amount */}
                    <div className="py-3 flex items-start">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0 mr-3">
                        <WalletIcon className="text-green-600 h-4 w-4" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-xs text-gray-500">Thành tiền</div>
                        <div className="font-bold text-lg text-green-700">
                          {selectedBooking.detail.totalAmount.toLocaleString(
                            "vi-VN"
                          )}{" "}
                          đ
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
