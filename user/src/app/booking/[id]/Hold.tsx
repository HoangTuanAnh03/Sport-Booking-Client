import { useBookingStore } from "@/stores/useBookingStore";
import { CourtSlotsByField, FieldById } from "@/types/field";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useHoldBooking } from "@/queries/useBooking";
import { useRouter } from "next/navigation";
import { useGetServiceByVenueId } from "@/queries/useService";
import { Service } from "@/types/service";
import ServiceSelectionDialog from "./components/ServiceSelectionDialog";

// Validation schema for the booking form
const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  phone: z.string().min(9, { message: "Số điện thoại không hợp lệ" }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

// Service item interface
interface ServiceItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

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
  const setSelectedCourtSlots = useBookingStore(
    (state) => state.setSelectedCourtSlots
  );
  const router = useRouter();
  const { data: venue } = useGetVenueDetail(fieldInfo?.venueId || 0);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dateSelection = useBookingStore((state) => state.dateSelection);
  const totalPrice = useBookingStore((state) => state.totalPrice);
  const phoneNumber = useAppStore((state) => state.phoneNumber);
  const name = useAppStore((state) => state.name);

  // New states for service selection
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);

  // Fetch services from the venue
  const { data: servicesData, isLoading: isLoadingServices } =
    useGetServiceByVenueId(venue?.payload?.data?.id || 0);
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

  // Calculate total service price
  const calculateServiceTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + service.price * service.quantity;
    }, 0);
  };

  // Calculate grand total (courts + services)
  const calculateGrandTotal = () => {
    return totalPrice + calculateServiceTotal();
  };

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
        services: selectedServices.map((service) => ({
          id: service.id,
          quantity: service.quantity,
        })),
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
        setSelectedCourtSlots(new Map());
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
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedCourtSlots(new Map());
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

  // Function to handle quantity change
  const handleQuantityChange = (service: Service, newQuantity: number) => {
    if (newQuantity < 0) return;

    setSelectedServices((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === service.id);

      if (existingIndex >= 0) {
        const updated = [...prev];
        if (newQuantity === 0) {
          // Remove the service if quantity is 0
          updated.splice(existingIndex, 1);
        } else {
          // Update the quantity
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQuantity,
          };
        }
        return updated;
      } else if (newQuantity > 0) {
        // Add new service
        return [
          ...prev,
          {
            id: service.id,
            name: service.name,
            price: service.price,
            quantity: newQuantity,
            unit: service.units,
          },
        ];
      }
      return prev;
    });
  };

  // Function to get current quantity
  const getServiceQuantity = (serviceId: number) => {
    const service = selectedServices.find((s) => s.id === serviceId);
    return service ? service.quantity : 0;
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
                          <ul className=" list-disc ml-8">
                            {slots.map((slot) => (
                              <li key={slot.id} className="text-gray-700">
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

              {/* Display selected services */}
              {selectedServices.length > 0 && (
                <div className="p-5 border-b border-gray-100">
                  <div className="font-medium mb-2">Dịch vụ:</div>
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-center mb-2 text-gray-700"
                    >
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-700 mr-2">
                          - {service.name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-sm">
                          {service.price} đ
                        </span>
                        <span className="mx-4">
                          x {service.quantity} {service.unit}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            handleQuantityChange(
                              {
                                id: service.id,
                                name: service.name,
                                price: service.price,
                              } as Service,
                              0
                            )
                          }
                        >
                          <FaTimes className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center mt-2 font-medium">
                    <span>Tổng tiền dịch vụ:</span>
                    <span className="text-yellow-500">
                      {calculateServiceTotal()} đ
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5 flex justify-between items-center bg-green-50">
                <div className="font-medium text-base text-green-700">
                  Số tiền cần thanh toán
                </div>
                <div className="font-bold text-xl text-green-700">
                  {calculateGrandTotal()} đ
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Services Button */}
          <div className="py-4">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 border-green-700 text-green-700 hover:bg-green-50"
              onClick={() => setServiceDialogOpen(true)}
            >
              Thêm dịch vụ{" "}
              {selectedServices.length > 0 && `(${selectedServices.length})`}
            </Button>
          </div>

          {/* Service Selection Dialog Component */}
          <ServiceSelectionDialog
            open={serviceDialogOpen}
            onOpenChange={setServiceDialogOpen}
            servicesData={servicesData}
            isLoadingServices={isLoadingServices}
            selectedServices={selectedServices}
            handleQuantityChange={handleQuantityChange}
            getServiceQuantity={getServiceQuantity}
            calculateServiceTotal={calculateServiceTotal}
          />

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
          <div className="mb-4">
            <div className="rounded-lg overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-green-900 to-green-700 text-white p-4">
                <div className="flex items-start flex-col">
                  <div className="mr-3">
                    <span className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-200 text-green-900 font-semibold px-2 py-1 rounded">
                      Lưu ý:
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Việc thanh toán được thực hiện trực tiếp giữa bạn và chủ
                        sân.
                      </li>
                      <li>
                        SportBooking đóng vai trò kết nối, hỗ trợ bạn tìm và đặt
                        sân dễ dàng hơn.
                      </li>
                      <li>
                        Mỗi sân có thể có quy định và chính sách riêng, hãy dành
                        chút thời gian đọc kỹ để đảm bảo quyền lợi cho bạn nhé!
                      </li>
                    </ul>
                    <p className="mt-2 text-sm">
                      Bằng việc bấm{" "}
                      <span className="font-semibold">
                        Xác nhận và Thanh toán
                      </span>
                      , bạn xác nhận đã đọc và đồng ý với{" "}
                      <a
                        className="underline text-yellow-300"
                        href="/terms"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Điều khoản đặt sân
                      </a>{" "}
                      và{" "}
                      <a
                        className="underline text-yellow-300"
                        href="/refund-policy"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Chính sách hoàn tiền và huỷ lịch
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="py-4 flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-6 h-auto border-red-500 text-red-600 hover:bg-red-50 font-bold"
              disabled={isSubmitting}
              onClick={handleCancel}
            >
              HUỶ GIỮ SÂN
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
