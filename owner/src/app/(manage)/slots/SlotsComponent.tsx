"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCourtSlotsByFieldId,
  useMergeCourtSlotsMutation,
  useLockCourtSlotsMutation,
} from "@/queries/useField";
import { CourtSlotStatus } from "@/types/field";

// Helper function to convert time string to minutes
const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to format date to YYYY-MM-DD
const formatDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface SlotsComponentProps {
  fieldId: number;
}

export const SlotsComponent = ({ fieldId }: SlotsComponentProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  const dateString = formatDateToYMD(selectedDate);
  const { data, isLoading, error } = useGetCourtSlotsByFieldId(
    fieldId.toString(),
    dateString
  );
  const mergeSlotsMutation = useMergeCourtSlotsMutation();
  const lockSlotsMutation = useLockCourtSlotsMutation();

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setSelectedSlots(new Set()); // Clear selection when date changes
    }
  };

  const handleSlotClick = (courtId: number, slotId: number) => {
    if (!isSelecting) return;

    const slotKey = `${courtId}-${slotId}`;
    const newSelectedSlots = new Set(selectedSlots);

    if (newSelectedSlots.has(slotKey)) {
      newSelectedSlots.delete(slotKey);
    } else {
      newSelectedSlots.add(slotKey);
    }

    setSelectedSlots(newSelectedSlots);
  };

  const handleMergeSlots = () => {
    if (selectedSlots.size < 2) {
      alert("Vui lòng chọn ít nhất 2 slot để merge");
      return;
    }

    // Group selected slots by court
    const slotsByCourtId = new Map<number, number[]>();
    selectedSlots.forEach((slotKey) => {
      const [courtId, slotId] = slotKey.split("-").map(Number);
      if (!slotsByCourtId.has(courtId)) {
        slotsByCourtId.set(courtId, []);
      }
      slotsByCourtId.get(courtId)!.push(slotId);
    });

    // Validate that only one court is selected
    if (slotsByCourtId.size > 1) {
      alert("Chỉ có thể merge các slot trong cùng một sân");
      return;
    }

    const courts = data?.payload?.data?.courts || [];
    const [courtId, slotIds] = Array.from(slotsByCourtId.entries())[0];

    // Find the court to get slot details
    const court = courts.find((c) => c.id === courtId);
    if (!court) {
      alert("Không tìm thấy thông tin sân");
      return;
    }

    // Get selected slots with their indices and validate they are consecutive
    const selectedSlotsWithIndices = slotIds
      .map((slotId) => {
        const slotIndex = court.slots.findIndex((s) => s.id === slotId);
        return { slotId, index: slotIndex };
      })
      .filter((item) => item.index !== -1);

    selectedSlotsWithIndices.sort((a, b) => a.index - b.index);

    // Check if slots are consecutive
    for (let i = 1; i < selectedSlotsWithIndices.length; i++) {
      if (
        selectedSlotsWithIndices[i].index !==
        selectedSlotsWithIndices[i - 1].index + 1
      ) {
        alert("Chỉ có thể merge các slot liên tiếp nhau");
        return;
      }
    }

    // Call merge API with slot IDs array
    mergeSlotsMutation.mutate(slotIds, {
      onSuccess: () => {
        setSelectedSlots(new Set());
        setIsSelecting(false);
      },
    });
  };

  const handleLockSlots = () => {
    const slotIds: number[] = [];
    selectedSlots.forEach((slotKey) => {
      const [, slotId] = slotKey.split("-").map(Number);
      slotIds.push(slotId);
    });

    lockSlotsMutation.mutate(slotIds, {
      onSuccess: () => {
        setSelectedSlots(new Set());
        setIsSelecting(false);
      },
    });
  };

  const clearSelection = () => {
    setSelectedSlots(new Set());
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !data?.payload?.data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Không thể tải thông tin khung giờ
          </h2>
          <p className="text-muted-foreground">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  const courts = data.payload.data.courts;

  // Generate base timeline for table headers
  const baseTimeLine: { time: string }[] = [];
  const field = data.payload.data;
  if (field.openTime && field.closeTime) {
    const openMinutes = toMinutes(field.openTime);
    const closeMinutes = toMinutes(field.closeTime);
    const step = field.minBookingMinutes || 30;

    for (let i = openMinutes; i < closeMinutes; i += step) {
      const hours = Math.floor(i / 60);
      const minutes = i % 60;
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      baseTimeLine.push({ time: timeStr });
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Date picker and control buttons */}
      <div className="space-y-4">
        {/* Date picker */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <label className="text-sm font-medium">Chọn ngày:</label>
          <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-white">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              locale={vi}
              className="outline-none text-sm"
              minDate={new Date()}
            />
          </div>
          <span className="text-sm text-gray-600">
            {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi })}
          </span>
        </div>

        {/* Control buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setIsSelecting(!isSelecting)}
            variant={isSelecting ? "default" : "outline"}
          >
            {isSelecting ? "Thoát chế độ chọn" : "Chế độ chọn"}
          </Button>
          {selectedSlots.size > 0 && (
            <>
              <Button
                onClick={handleMergeSlots}
                variant="secondary"
                disabled={
                  mergeSlotsMutation.isPending || selectedSlots.size < 2
                }
              >
                {mergeSlotsMutation.isPending
                  ? "Đang gộp..."
                  : `Gộp khung giờ (${selectedSlots.size} slots)`}
              </Button>
              <Button
                onClick={handleLockSlots}
                variant="destructive"
                disabled={lockSlotsMutation.isPending}
              >
                {lockSlotsMutation.isPending
                  ? "Đang khóa..."
                  : `Khóa (${selectedSlots.size} slots)`}
              </Button>
              <Button onClick={clearSelection} variant="ghost">
                Bỏ chọn tất cả
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Slots table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-white border-r w-32">
                Sân
              </TableHead>
              {baseTimeLine.map((timeline, index) => (
                <TableHead
                  key={index}
                  className="border-r text-center min-w-[100px]"
                >
                  {timeline.time}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.map((court) => (
              <TableRow key={court.id} className="hover:bg-gray-50">
                <TableCell className="sticky left-0 z-20 bg-white border-r font-medium">
                  {court.name}
                </TableCell>
                {court.slots.map((timeSlot) => {
                  const isLocked = timeSlot.status === CourtSlotStatus.LOCK;
                  const slotKey = `${court.id}-${timeSlot.id}`;
                  const isSelected = selectedSlots.has(slotKey);

                  const start = toMinutes(timeSlot.startTime);
                  const end = toMinutes(timeSlot.endTime);
                  const step = field.minBookingMinutes || 30;
                  const colspan = (end - start) / step;

                  return (
                    <TableCell
                      key={timeSlot.id}
                      colSpan={colspan}
                      className={`border border-gray-300 px-6 py-3 text-center cursor-pointer ${
                        isLocked
                          ? "bg-red-100 cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-200"
                          : isSelecting
                          ? "hover:bg-gray-100"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        if (!isLocked) {
                          handleSlotClick(court.id, timeSlot.id);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {isLocked ? (
                          <span className="text-xs text-red-600 font-semibold">
                            Đã khóa
                          </span>
                        ) : isSelected ? (
                          <span className="text-xs text-blue-600 font-semibold">
                            Đã chọn
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">
                            {timeSlot.price.toLocaleString("vi-VN")} đ
                          </span>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
