"use client";
import { useGetListBooking } from "@/queries/useBooking";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Search,
  XCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Star,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import reviewApiRequest from "@/apiRequests/review";
import { CreateReviewRequest } from "@/types/review";
import { toast } from "@/hooks/use-toast";

// Booking type definition based on the API response
interface BookingTimeSlot {
  startTime: string;
  endTime: string;
  price: number;
}

interface BookingCourt {
  id: number;
  name: string;
  slots: BookingTimeSlot[];
}

interface BookingService {
  name: string;
  pricePerUnit: number;
  quantity: number;
}

interface BookingDetail {
  date: string;
  totalAmount: number;
  courts: BookingCourt[];
  services?: BookingService[];
}

interface Booking {
  id: string;
  createdAt: string;
  status:
    | "PENDING"
    | "EXPIRED"
    | "CUSTOMER_CANCELED"
    | "OWNER_CANCELED"
    | "CONFIRMED"
    | "COMPLETED";
  customerName: string;
  customerPhoneNumber: string;
  venueName: string;
  venueAddress: string;
  venueId: number;
  detail: BookingDetail;
  isReview: boolean;
}

{
  /* <SelectGroup>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                <SelectItem value="EXPIRED">
                  Huỷ do quá giờ thanh toán
                </SelectItem>
                <SelectItem value="CUSTOMER_CANCELED">Đã huỷ</SelectItem>
                <SelectItem value="OWNER_CANCELED">Bị từ chối</SelectItem>
                <SelectItem value="CONFIRMED">Chờ xác nhận</SelectItem>
                <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
              </SelectGroup> */
}
// Status config for UI presentation with green theme
const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Chờ thanh toán",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: <Clock className="h-4 w-4 mr-1 inline-block" />,
  },
  EXPIRED: {
    label: "Huỷ do quá giờ thanh toán",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: <XCircle className="h-4 w-4 mr-1 inline-block" />,
  },
  CUSTOMER_CANCELED: {
    label: "Đã huỷ",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: <XCircle className="h-4 w-4 mr-1 inline-block" />,
  },
  OWNER_CANCELED: {
    label: "Bị từ chối",
    color: "bg-orange-100 text-orange-700 border-orange-300",
    icon: <XCircle className="h-4 w-4 mr-1 inline-block" />,
  },
  CONFIRMED: {
    label: "Chờ xác nhận",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: <CheckCircle2 className="h-4 w-4 mr-1 inline-block" />,
  },
  COMPLETED: {
    label: "Đã xác nhận",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: <CheckCircle2 className="h-4 w-4 mr-1 inline-block" />,
  },
  UNKNOWN: {
    label: "Không xác định",
    color: "bg-gray-100 text-gray-600 border-gray-300",
    icon: <AlertCircle className="h-4 w-4 mr-1 inline-block" />,
  },
};

export default function BookingHistoryPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetListBooking();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  // Review dialog state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Get current date for calendar defaultMonth
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Format date to locale string
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Format time for display
  const formatTimeRange = (court: BookingCourt) => {
    if (!court.slots || court.slots.length === 0) return "Không có thông tin";

    // Sort slots by startTime
    const sortedSlots = [...court.slots].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    // Get earliest start time and latest end time
    const startTime = sortedSlots[0].startTime;
    const endTime = sortedSlots[sortedSlots.length - 1].endTime;

    return `${startTime} - ${endTime}`;
  };

  // Handle booking details view
  const viewBookingDetails = (bookingId: string) => {
    if (bookingId) {
      router.push(`/booking/history/${bookingId}`);
    }
  };

  // Check if all time slots have passed
  const hasAllTimeSlotsPassed = (booking: Booking) => {
    if (!booking.detail.courts || booking.detail.courts.length === 0) {
      return false;
    }

    const now = new Date();
    const bookingDate = parseISO(booking.detail.date);

    // Get the latest end time across all courts
    let latestEndTime = "";

    booking.detail.courts.forEach((court) => {
      if (court.slots && court.slots.length > 0) {
        court.slots.forEach((slot) => {
          if (slot.endTime > latestEndTime) {
            latestEndTime = slot.endTime;
          }
        });
      }
    });

    if (!latestEndTime) return false;

    // Parse the latest end time
    const [hours, minutes] = latestEndTime.split(":").map(Number);
    const slotEndDateTime = new Date(bookingDate);
    slotEndDateTime.setHours(hours, minutes, 0, 0);

    // Check if the latest slot end time has passed
    return now > slotEndDateTime;
  };

  // Apply all filters and sorting
  useEffect(() => {
    if (!data?.payload?.data) return;

    let filtered = data.payload.data.map((booking: any) => ({
      ...booking,
      status: booking.status as Booking["status"],
    }));

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.venueName.toLowerCase().includes(query) ||
          booking.customerName.toLowerCase().includes(query) ||
          booking.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter) {
      // Format both dates to yyyy-MM-dd in local timezone for comparison
      const filterDateStr = format(dateFilter, "yyyy-MM-dd");
      filtered = filtered.filter((booking) => {
        const bookingDateStr = booking.createdAt.split("T")[0]; // Get only the date part
        return bookingDateStr === filterDateStr;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        filtered = filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "priceHighToLow":
        filtered = filtered.sort(
          (a, b) => b.detail.totalAmount - a.detail.totalAmount
        );
        break;
      case "priceLowToHigh":
        filtered = filtered.sort(
          (a, b) => a.detail.totalAmount - b.detail.totalAmount
        );
        break;
    }

    setFilteredBookings(filtered);
  }, [data, searchQuery, statusFilter, dateFilter, sortBy]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setDateFilter(null);
    setSortBy("newest");
  };

  // Open review dialog
  const openReviewDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewRating(0);
    setHoveredRating(0);
    setReviewComment("");
    setIsReviewDialogOpen(true);
  };

  // Close review dialog
  const closeReviewDialog = () => {
    setIsReviewDialogOpen(false);
    setSelectedBooking(null);
    setReviewRating(0);
    setHoveredRating(0);
    setReviewComment("");
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!selectedBooking) return;
    
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
        venueId: selectedBooking.venueId,
      };
      
      await reviewApiRequest.sCreateReview(payload);
      
      toast({
        title: "Thành công",
        description: "Đánh giá của bạn đã được gửi thành công!",
      });
      closeReviewDialog();
      refetch(); // Refresh booking list to update isReview status
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể gửi đánh giá. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Empty state component with green theme
  const EmptyState = () => (
    <div className="text-center py-10">
      <BookOpen className="h-12 w-12 mx-auto text-green-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-900">
        Không tìm thấy đơn đặt sân nào
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Bạn chưa đặt sân hoặc không có đơn đặt sân nào phù hợp với bộ lọc hiện
        tại.
      </p>
      <div className="mt-6">
        <Button onClick={resetFilters} variant="outline" className="mr-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Xóa bộ lọc
        </Button>
        <Button
          onClick={() => router.push("/booking")}
          className="bg-green-600 hover:bg-green-700"
        >
          Đặt sân ngay
        </Button>
      </div>
    </div>
  );

  // Loading state component
  const LoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Error state component with green theme
  const ErrorState = () => (
    <div className="text-center py-10">
      <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
      <h3 className="text-lg font-medium text-gray-900">
        Không thể tải danh sách đơn đặt sân
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Đã xảy ra lỗi khi tải danh sách đơn đặt sân. Vui lòng thử lại sau.
      </p>
      <Button
        onClick={() => refetch()}
        className="mt-4 bg-green-600 hover:bg-green-700"
      >
        <RefreshCw className="h-4 w-4 mr-2" /> Tải lại
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Lịch sử đặt sân</h1>
        <Button
          onClick={() => router.push("/booking")}
          className="bg-green-600 hover:bg-green-700"
        >
          Đặt sân mới
        </Button>
      </div>

      {/* Filters with green theme */}
      <div className="bg-white rounded-lg shadow-sm border border-green-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên sân, mã đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <Select
            value={statusFilter || "ALL"}
            onValueChange={(value) =>
              setStatusFilter(value === "ALL" ? null : value)
            }
          >
            <SelectTrigger className="w-full md:w-[180px] focus:ring-green-500">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                <SelectItem value="EXPIRED">
                  Huỷ do quá giờ thanh toán
                </SelectItem>
                <SelectItem value="CUSTOMER_CANCELED">Đã huỷ</SelectItem>
                <SelectItem value="OWNER_CANCELED">Bị từ chối</SelectItem>
                <SelectItem value="CONFIRMED">Chờ xác nhận</SelectItem>
                <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={dateFilter ? "default" : "outline"}
                className={cn(
                  "w-full md:w-[200px] justify-start text-left font-normal",
                  !dateFilter && "text-muted-foreground",
                  dateFilter && "bg-green-600 hover:bg-green-700"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                required={true}
                selected={dateFilter || undefined}
                onSelect={(date) => {
                  if (date) {
                    // Set time to noon to avoid timezone issues
                    const adjustedDate = new Date(date);
                    adjustedDate.setHours(12, 0, 0, 0);
                    setDateFilter(adjustedDate);
                  } else {
                    setDateFilter(null);
                  }
                }}
                initialFocus
                defaultMonth={new Date(currentYear, currentMonth)}
                disabled={(date) => {
                  // Disable future dates - only allow today or past
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  return date > today;
                }}
              />
              {dateFilter && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateFilter(null)}
                    className="w-full text-sm"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Xóa ngày đã chọn
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px] focus:ring-green-500">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="priceHighToLow">Giá cao đến thấp</SelectItem>
                <SelectItem value="priceLowToHigh">Giá thấp đến cao</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter || dateFilter) && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="flex items-center w-full md:w-auto hover:bg-green-50 hover:text-green-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Bookings List with green theme */}
      <div className="space-y-4">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : filteredBookings.length === 0 ? (
          <EmptyState />
        ) : (
          filteredBookings.map((booking) => {
            return (
              <Card
                key={booking.id}
                className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-green-500"
              >
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="font-normal text-gray-600 border-gray-300"
                          >
                            Đơn ngày{" "}
                            {format(parseISO(booking.createdAt), "dd/MM/yyyy")}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-normal",
                              statusConfig[booking.status]?.color ??
                                statusConfig.UNKNOWN.color
                            )}
                          >
                            {statusConfig[booking.status]?.icon ??
                              statusConfig.UNKNOWN.icon}
                            {statusConfig[booking.status]?.label ??
                              statusConfig.UNKNOWN.label}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-green-800">
                            {booking.venueName}
                          </h3>
                          {booking.detail.courts.map((court) => (
                            <div
                              key={court.id}
                              className="mb-1 text-sm text-gray-600"
                            >
                              <span className="font-medium text-green-700">
                                {court.name}
                              </span>
                              : {formatTimeRange(court)} (
                              {formatDate(booking.detail.date)})
                            </div>
                          ))}
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <MapPin className="h-4 w-4 mr-1 text-green-600" />
                            {booking.venueAddress}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="text-green-700 font-bold text-lg">
                      Tổng thanh toán:{" "}
                      {formatCurrency(booking.detail.totalAmount)} đ
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => viewBookingDetails(booking.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Xem chi tiết
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem thông tin chi tiết đơn đặt sân</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Show review button for completed bookings if isReview is true */}
                      {booking.isReview && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => openReviewDialog(booking)}
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Đánh giá
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Đánh giá chất lượng sân</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Show rebooking button for completed or cancelled bookings */}
                      {(booking.status === "COMPLETED" ||
                        booking.status === "CUSTOMER_CANCELED" ||
                        booking.status === "OWNER_CANCELED" ||
                        booking.status === "EXPIRED") && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/booking/${booking.id}/rebook`)
                                }
                                className="border-green-600 text-green-600 hover:bg-green-50"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Đặt lại
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Đặt sân với thông tin tương tự</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination (simplified) with green theme */}
      {!isLoading && !error && filteredBookings.length > 0 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-green-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>
          <div className="text-sm text-green-700 font-medium">Trang 1 / 1</div>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-green-200"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-green-800">Đánh giá sân</DialogTitle>
            <DialogDescription>
              {selectedBooking && (
                <span className="font-medium text-green-700">
                  {selectedBooking.venueName}
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
              disabled={isSubmittingReview || reviewRating === 0 || !reviewComment.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
