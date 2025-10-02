"use client";

import { CourtSlotsTable } from "./CourtSlotsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMyVenuesQuery } from "@/queries/useVenue";
import { useGetFieldsByVenueIdQuery } from "@/queries/useField";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CalendarClock } from "lucide-react";
import { FieldOwnerResponse } from "@/types/field";
import { VenueDetail } from "@/types/venue";

const fieldStatusLabel: Record<FieldOwnerResponse["status"], string> = {
  ENABLE: "Đang hoạt động",
  UNABLE: "Tạm dừng",
  DELETED: "Đã xóa",
};

// Component chính
export default function SlotsPage() {
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const { data: venueData } = useGetMyVenuesQuery();
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const { data: venueDetail } = useGetFieldsByVenueIdQuery(
    selectedVenueId ?? 0
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý lịch sân</h1>

      <div className="mb-4 space-y-4">
        {/* Chọn Venue */}
        <Select
          value={selectedVenueId?.toString()}
          onValueChange={(value) => {
            setSelectedVenueId(Number(value));
            setSelectedFieldId(null);
          }}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Chọn cơ sở" />
          </SelectTrigger>
          <SelectContent>
            {venueData?.map((venue) => (
              <SelectItem key={venue.id} value={venue.id.toString()}>
                {venue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Chọn Field */}
        {selectedVenueId && (
          <Select
            value={selectedFieldId?.toString()}
            onValueChange={(value) => setSelectedFieldId(Number(value))}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Chọn sân" />
            </SelectTrigger>
            <SelectContent>
              {venueDetail?.map((field) => (
                <SelectItem key={field.id} value={field.id.toString()}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedFieldId ? (
        <CourtSlotsTable fieldId={selectedFieldId} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          Vui lòng chọn sân để xem lịch
        </div>
      )}
    </div>
  );
}

const fieldStatusVariant: Record<
  FieldOwnerResponse["status"],
  "default" | "secondary" | "destructive"
> = {
  ENABLE: "default",
  UNABLE: "secondary",
  DELETED: "destructive",
};

const dayOfWeekMap: Record<string, string> = {
  MONDAY: "Thứ Hai",
  TUESDAY: "Thứ Ba",
  WEDNESDAY: "Thứ Tư",
  THURSDAY: "Thứ Năm",
  FRIDAY: "Thứ Sáu",
  SATURDAY: "Thứ Bảy",
  SUNDAY: "Chủ nhật",
};

const dayOfWeekOrder: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

type VenueDetailWithFields = VenueDetail & {
  fields?: FieldOwnerResponse[];
};

const formatTime = (time?: string) => {
  if (!time) return "--:--";
  return time.slice(0, 5);
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") {
    return "--";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// export default function SlotsPage() {
//   const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
//   const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

//   const {
//     data: venues,
//     isLoading: isVenuesLoading,
//     error: venuesError,
//   } = useGetMyVenuesQuery();

//   const {
//     data: venueDetail,
//     isLoading: isVenueDetailLoading,
//     error: venueDetailError,
//   } = useGetFieldsByVenueIdQuery(selectedVenueId ?? 0);

//   const fields = selectedVenueId ? venueDetail ?? [] : [];

//   useEffect(() => {
//     console.log("🚀 ~ SlotsPage ~ fields:", fields);

//     if (
//       selectedFieldId &&
//       !fields.some((field) => field.id === selectedFieldId)
//     ) {
//       setSelectedFieldId(null);
//     }
//   }, [fields, selectedFieldId]);

//   const selectedField = fields.find((field) => field.id === selectedFieldId);

//   const sortedOpeningHours = selectedField
//     ? [...(selectedField.openingHours ?? [])].sort(
//         (a, b) =>
//           (dayOfWeekOrder[a.dayOfWeek] ?? 10) -
//           (dayOfWeekOrder[b.dayOfWeek] ?? 10)
//       )
//     : [];

//   const courts = selectedField?.courts ?? [];

//   const hasVenues = (venues?.length ?? 0) > 0;
//   const shouldShowFieldPlaceholder =
//     selectedVenueId !== null && fields.length > 0 && !selectedField;

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="flex items-center gap-3 text-3xl font-bold">
//           <CalendarClock className="h-8 w-8 text-blue-600" />
//           Quản lý khung giờ
//         </h1>
//         <p className="mt-1 text-sm text-muted-foreground">
//           Chọn địa điểm và sân để xem thông tin cấu hình chi tiết.
//         </p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Chọn địa điểm</CardTitle>
//           <CardDescription>
//             Danh sách các địa điểm mà bạn đang quản lý.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isVenuesLoading ? (
//             <Skeleton className="h-10 w-full md:w-80" />
//           ) : venuesError ? (
//             <div className="flex items-center gap-2 text-sm text-destructive">
//               <AlertCircle className="h-4 w-4" />
//               <span>Không thể tải danh sách địa điểm. Vui lòng thử lại.</span>
//             </div>
//           ) : hasVenues ? (
//             <Select
//               value={
//                 selectedVenueId !== null
//                   ? selectedVenueId.toString()
//                   : undefined
//               }
//               onValueChange={(value) => {
//                 const id = Number(value);
//                 setSelectedVenueId(Number.isNaN(id) ? null : id);
//                 setSelectedFieldId(null);
//               }}
//             >
//               <SelectTrigger className="w-full md:w-80">
//                 <SelectValue placeholder="Chọn địa điểm" />
//               </SelectTrigger>
//               <SelectContent>
//                 {venues?.map((venue) => (
//                   <SelectItem key={venue.id} value={venue.id.toString()}>
//                     {venue.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           ) : (
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <AlertCircle className="h-4 w-4" />
//               <span>Chưa có địa điểm nào. Thêm địa điểm để bắt đầu.</span>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Chọn sân</CardTitle>
//           <CardDescription>
//             Chỉ hiển thị khi bạn đã chọn một địa điểm cụ thể.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {selectedVenueId === null ? (
//             <div className="text-sm text-muted-foreground">
//               Vui lòng chọn địa điểm trước.
//             </div>
//           ) : isVenueDetailLoading ? (
//             <Skeleton className="h-10 w-full md:w-80" />
//           ) : venueDetailError ? (
//             <div className="flex items-center gap-2 text-sm text-destructive">
//               <AlertCircle className="h-4 w-4" />
//               <span>Không thể tải thông tin địa điểm. Vui lòng thử lại.</span>
//             </div>
//           ) : fields.length > 0 ? (
//             <Select
//               value={
//                 selectedFieldId !== null
//                   ? selectedFieldId.toString()
//                   : undefined
//               }
//               onValueChange={(value) => {
//                 const id = Number(value);
//                 setSelectedFieldId(Number.isNaN(id) ? null : id);
//               }}
//             >
//               <SelectTrigger className="w-full md:w-80">
//                 <SelectValue placeholder="Chọn sân" />
//               </SelectTrigger>
//               <SelectContent>
//                 {fields.map((field) => (
//                   <SelectItem key={field.id} value={field.id.toString()}>
//                     {field.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           ) : (
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <AlertCircle className="h-4 w-4" />
//               <span>Địa điểm này chưa có sân nào.</span>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {shouldShowFieldPlaceholder && (
//         <Card>
//           <CardContent className="py-8 text-center text-sm text-muted-foreground">
//             Vui lòng chọn một sân để xem thông tin chi tiết.
//           </CardContent>
//         </Card>
//       )}

//       {selectedField && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex flex-wrap items-center gap-3">
//               <span>{selectedField.name}</span>
//               <Badge variant={fieldStatusVariant[selectedField.status]}>
//                 {fieldStatusLabel[selectedField.status]}
//               </Badge>
//             </CardTitle>
//             <CardDescription>
//               Thể thao: {selectedField.sportTypeName}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="rounded-lg border p-4">
//                 <p className="text-sm text-muted-foreground">
//                   Thời lượng đặt tối thiểu
//                 </p>
//                 <p className="mt-1 text-lg font-semibold">
//                   {selectedField.minBookingMinutes} phút
//                 </p>
//               </div>
//               <div className="rounded-lg border p-4">
//                 <p className="text-sm text-muted-foreground">
//                   Giới hạn đặt trước theo tháng
//                 </p>
//                 <p className="mt-1 text-lg font-semibold">
//                   {selectedField.monthLimit} lượt
//                 </p>
//               </div>
//               <div className="rounded-lg border p-4">
//                 <p className="text-sm text-muted-foreground">Số sân con</p>
//                 <p className="mt-1 text-lg font-semibold">{courts.length}</p>
//               </div>
//               <div className="rounded-lg border p-4">
//                 <p className="text-sm text-muted-foreground">
//                   Số phút tối thiểu mỗi lượt đặt
//                 </p>
//                 <p className="mt-1 text-lg font-semibold">
//                   {selectedField.minBookingMinutes} phút
//                 </p>
//               </div>
//             </div>

//             <div>
//               <h3 className="text-sm font-semibold uppercase text-muted-foreground">
//                 Giờ mở cửa
//               </h3>
//               {sortedOpeningHours.length > 0 ? (
//                 <div className="mt-3 grid gap-3 sm:grid-cols-2">
//                   {sortedOpeningHours.map((entry) => (
//                     <div
//                       key={entry.dayOfWeek}
//                       className="rounded-lg border p-3"
//                     >
//                       <p className="font-semibold">
//                         {dayOfWeekMap[entry.dayOfWeek] ?? entry.dayOfWeek}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {formatTime(entry.openTime)} -{" "}
//                         {formatTime(entry.closeTime)}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="mt-3 text-sm text-muted-foreground">
//                   Chưa cấu hình giờ mở cửa.
//                 </p>
//               )}
//             </div>

//             <div>
//               <h3 className="text-sm font-semibold uppercase text-muted-foreground">
//                 Danh sách sân
//               </h3>
//               {courts.length > 0 ? (
//                 <div className="mt-3 space-y-3">
//                   {courts.map((court) => (
//                     <div
//                       key={court.id}
//                       className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
//                     >
//                       <div>
//                         <p className="font-semibold">{court.name}</p>
//                         <p className="text-sm text-muted-foreground">
//                           Giá mặc định: {formatCurrency(court.defaultPrice)}
//                         </p>
//                       </div>
//                       <Badge variant={fieldStatusVariant[court.status]}>
//                         {fieldStatusLabel[court.status]}
//                       </Badge>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="mt-3 text-sm text-muted-foreground">
//                   Chưa có sân con được tạo.
//                 </p>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
