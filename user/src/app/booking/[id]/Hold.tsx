import { useBookingStore } from "@/stores/useBookingStore";
import { CourtSlotsByField, FieldById } from "@/types/field";
import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import bookingApiRequest from "@/apiRequests/booking";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGetVenueDetail } from "@/queries/useVenue";
import { CreateBookingRequest } from "@/types/booking";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/components/app-provider";
import { formatDateToYMD } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useHoldBooking } from "@/queries/useBooking";
import { useRouter } from "next/navigation";

// Validation schema for the booking form
const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  phone: z.string().min(9, { message: "Số điện thoại không hợp lệ" }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function Hold({
  fieldInfo,
  courts,
  setOpenHold,
}: {
  fieldInfo: FieldById | undefined;
  courts: CourtSlotsByField | undefined;
  setOpenHold: (open: boolean) => void;
}) {
  const selectedCourtSlots = useBookingStore(
    (state) => state.selectedCourtSlots
  );
  const router = useRouter();
  const { data: venue } = useGetVenueDetail(fieldInfo?.venueId || 0);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dateSelection = useBookingStore((state) => state.dateSelection);
  const totalPrice = useBookingStore((state) => state.totalPrice);
  const phoneNumber = useAppStore((state) => state.phoneNumber);
  const name = useAppStore((state) => state.name);

  const queryClient = useQueryClient();
  const holdBookingMutation = useHoldBooking();

  // Initialize form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: name || "",
      phone: phoneNumber || "",
      notes: "",
    },
  });

  const onSubmit = async (data: BookingFormValues) => {
    try {
      setIsSubmitting(true);
      // Create the payload for the API
      const payload: CreateBookingRequest = {
        fieldId: fieldInfo?.id || 0,
        date: formatDateToYMD(dateSelection),
        customerName: data.name,
        customerPhone: data.phone,
        note: data.notes || "",
        courts: Array.from(selectedCourtSlots.entries()).map(([key, slot]) => {
          return {
            courtId: Number(key),
            timeSlots: slot.map((s) => ({
              id: s.id,
              startTime: s.startTime,
              endTime: s.endTime,
            })),
          };
        }),
      };

      const response = await holdBookingMutation.mutateAsync(payload);

      if (response.status === 200) {
        router.push(
          `/booking/${fieldInfo?.id}/confirm/${response.payload.data}`
        );
      } else {
        toast({
          title: "Lỗi",
          description:
            "Bạn đã giữ sân thất bại có người đã giữ trước bạn. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi đặt sân",
        variant: "destructive",
      });
    } finally {
      queryClient.invalidateQueries({
        queryKey: [
          "getCourtSlotsByFieldId",
          fieldInfo?.id,
          formatDateToYMD(dateSelection),
        ],
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // TODO: Thêm logic huỷ đặt sân nếu cần (ví dụ: gọi API hoặc reset form)
    form.reset();
    setOpenHold(false);
  };

  const calculateTotalHour = () => {
    let totalHours = 0;
    Array.from(selectedCourtSlots.values()).forEach((slots) => {
      slots.forEach((slot) => {
        const [sh, sm] = slot.startTime.split(":").map(Number);
        const [eh, em] = slot.endTime.split(":").map(Number);
        const startTime = sh + sm / 60;
        const endTime = eh + em / 60;
        totalHours += endTime - startTime;
      });
    });
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    totalHours = hours + (minutes > 0 ? minutes / 60 : 0);
    if (minutes > 0) {
      return `${hours}h${minutes}p`;
    }
    return `${hours}h`;
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Field Information */}
          <Card className="mb-6">
            <CardHeader className="bg-green-700 text-white p-2 flex flex-row items-center space-y-0 rounded-t-lg">
              <div className="bg-white text-green-700 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
              </div>
              <CardTitle className="text-xl font-bold text-white">
                Thông tin sân
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <p>
                <span>Tên CLB: </span>
                <span className="font-bold text-gray-700">
                  {venue?.payload?.data?.name || "3CE"}
                </span>
              </p>
              <p>
                <span>Địa chỉ: </span>
                <span className="font-bold text-gray-700">
                  {venue?.payload?.data?.address ||
                    "85 Tôn Đức Thắng - phường Văn Miếu - Quốc Tử Giám - Hà Nội"}
                </span>
              </p>
              <p>
                <span>SĐT: </span>
                <span className="font-bold text-gray-700">
                  {venue?.payload?.data?.phoneNumber || "0945462222"}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card className="mb-6">
            <CardHeader className="bg-green-700 text-white p-2 flex flex-row items-center space-y-0 rounded-t-lg">
              <div className="bg-white text-green-700 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
              </div>
              <CardTitle className="text-xl font-bold text-white">
                Thông tin lịch đặt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-5 border-b border-gray-100">
                <p>
                  <span>Ngày: </span>
                  <span className="font-bold text-gray-700">
                    {dateSelection.toLocaleDateString()}
                  </span>
                </p>
                <div className="mt-2">
                  {Array.from(selectedCourtSlots.entries()).map(
                    ([courtId, slots]) => {
                      const court = courts?.courts.find(
                        (c) => c.id === Number(courtId)
                      );
                      return (
                        <div key={courtId} className="mb-2">
                          <div className="font-semibold text-gray-700">
                            - {court?.name || `Sân ${courtId}`}
                          </div>
                          <ul className="ml-4 list-disc ml-8">
                            {slots.map((slot) => (
                              <li key={slot.id} className="text-gray-700">
                                {slot.startTime} - {slot.endTime} |{" "}
                                <span className="text-yellow-500">
                                  {slot.price} đ
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                  )}
                </div>
                <p>
                  <span>Tổng giờ: </span>
                  <span className="font-bold text-gray-700">
                    {calculateTotalHour()}
                  </span>
                </p>
              </div>

              {/* <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <div className="font-medium">Ưu đãi</div>
                <Button
                  variant="ghost"
                  className="text-green-700 hover:text-green-800 hover:bg-green-50 p-0"
                >
                  Chọn ưu đãi áp dụng <FaPlus className="ml-2" />
                </Button>
              </div> */}

              <div className="p-5 flex justify-between items-center bg-green-50">
                <div className="font-medium text-base text-green-700">
                  Số tiền cần thanh toán
                </div>
                <div className="font-bold text-xl text-green-700">
                  {totalPrice} đ
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Services */}
          <div className="py-4">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 border-green-700 text-green-700 hover:bg-green-50"
            >
              Thêm dịch vụ
            </Button>
          </div>

          {/* User Information */}
          <div className="py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-base text-green-700">
                    Tên của bạn
                  </FormLabel>
                  <div className="relative mb-1 flex items-center">
                    <FormControl>
                      <Input {...field} className="p-3 h-auto" />
                    </FormControl>
                    {field.value && (
                      <button
                        type="button"
                        className="absolute right-3 text-gray-500"
                        onClick={() => form.setValue("name", "")}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel className="font-bold text-base text-green-700">
                    Số điện thoại
                  </FormLabel>
                  <div className="relative mb-1 flex items-center">
                    <FormControl>
                      <Input {...field} className="rounded-l-none p-3 h-auto" />
                    </FormControl>
                    {field.value && (
                      <button
                        type="button"
                        className="absolute right-3  text-gray-500"
                        onClick={() => form.setValue("phone", "")}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel className="font-bold text-base text-green-700">
                    Ghi chú cho chủ sân
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nhập ghi chú"
                      className="w-full p-3 border rounded-lg h-24 resize-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Confirmation & Cancel Buttons */}
          <div className="py-4 flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-6 h-auto border-red-500 text-red-600 hover:bg-red-50 font-bold"
              disabled={isSubmitting}
              onClick={handleCancel}
            >
              HUỶ ĐẶT SÂN
            </Button>
            <Button
              type="submit"
              className="flex-1 py-6 h-auto bg-yellow-500 hover:bg-yellow-600 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN & THANH TOÁN"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
