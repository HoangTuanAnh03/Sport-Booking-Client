"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CourtSlots, CourtSlotStatus } from "@/types/field";
import {
  useGetCourtSlotsByFieldId,
  useMergeCourtSlotsMutation,
  useLockCourtSlotsMutation,
} from "@/queries/useField";
import { Lock, GitMerge } from "lucide-react";

// Utility functions
const generateTimeLine = (
  openTime: string,
  closeTime: string,
  step: number
): { time: string }[] => {
  const times: { time: string }[] = [];
  let [h, m] = openTime.split(":").map(Number);
  const [endH, endM] = closeTime.split(":").map(Number);

  while (h < endH || (h === endH && m <= endM)) {
    const timeStr = `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}`;
    times.push({ time: timeStr });
    m += step;
    if (m >= 60) {
      h += 1;
      m = m % 60;
    }
  }
  return times;
};

const toMinutes = (str: string): number => {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
};

export const CourtSlotsTable = ({ fieldId }: { fieldId: number }) => {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const { data, isLoading } = useGetCourtSlotsByFieldId(fieldId.toString(), dateString);

  const mergeSlotsMutation = useMergeCourtSlotsMutation();
  const lockSlotsMutation = useLockCourtSlotsMutation();

  const courts = useMemo(() => data?.payload?.data?.courts || [], [data]);

  const baseTimeLine = useMemo(() => {
    if (!data?.payload?.data) return [];
    return generateTimeLine(
      data.payload.data.openTime,
      data.payload.data.closeTime,
      data.payload.data.minBookingMinutes
    );
  }, [data]);

  const handleSlotClick = useCallback((courtId: number, startTime: string) => {
    const slotKey = `${courtId}-${startTime}`;
    console.log("Clicking slot:", slotKey); // Debug log
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotKey)) {
        newSet.delete(slotKey);
        console.log("Removed slot:", slotKey); // Debug log
      } else {
        newSet.add(slotKey);
        console.log("Added slot:", slotKey); // Debug log
      }
      console.log("New selected slots:", Array.from(newSet)); // Debug log
      return newSet;
    });
  }, []);

  const getSlotIdsByKeys = useCallback(
    (slotKeys: string[]) => {
      const slotPayloads: any[] = [];
      if (!courts) return slotPayloads;

      const formatLocalTime = (timeStr: string) => {
        const [hour, minute] = timeStr.split(":").map(Number);
        return { hour, minute, second: 0 };
      };
      // Safely get date if present in data
      const slotDate =
        data?.payload?.data && "date" in data.payload.data
          ? (data.payload.data as any).date
          : null;
      slotKeys.forEach((key) => {
        const [courtIdStr, startTime] = key.split("-");
        const courtId = parseInt(courtIdStr);
        const court = courts.find((c) => c.id === courtId);
        if (court) {
          const slot = court.slots.find((s) => s.startTime === startTime);
          if (slot) {
            slotPayloads.push({
              id: slot.id,
              startTime: formatLocalTime(slot.startTime),
              endTime: formatLocalTime(slot.endTime),
              date: slotDate,
              courtId: court.id,
              fieldId: fieldId,
              status: slot.status,
            });
          }
        }
      });

      return slotPayloads;
    },
    [courts, fieldId, data?.payload?.data]
  );

  const handleMergeSlots = useCallback(async () => {
    if (selectedSlots.size === 0) return;

    const slotPayloads = getSlotIdsByKeys(Array.from(selectedSlots));
    if (slotPayloads.length === 0) {
      console.error("No valid slot payloads found");
      return;
    }

    try {
      // Transform slotPayloads to the required structure
      type MergeCourt = { id: number; timeSlot: any[] };
      type MergePayload = {
        date: string;
        fieldId: number;
        court: MergeCourt[];
      };
      const mergePayload: MergePayload = {
        date: slotPayloads[0]?.date ?? "",
        fieldId: fieldId,
        court: [],
      };

      // Group slots by courtId
      const courtMap: Record<number, MergeCourt> = {};
      slotPayloads.forEach((slot) => {
        if (!courtMap[slot.courtId]) {
          courtMap[slot.courtId] = { id: slot.courtId, timeSlot: [] };
        }
        courtMap[slot.courtId].timeSlot.push({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      });
      mergePayload.court = Object.values(courtMap);

      await mergeSlotsMutation.mutateAsync(mergePayload);
      setSelectedSlots(new Set());
    } catch (error) {
      console.error("Error merging slots:", error);
    }
  }, [selectedSlots, mergeSlotsMutation, getSlotIdsByKeys]);

  const handleLockSlots = useCallback(async () => {
    if (selectedSlots.size === 0) return;

    const slotPayloads = getSlotIdsByKeys(Array.from(selectedSlots));
    if (slotPayloads.length === 0) {
      console.error("No valid slot payloads found");
      return;
    }

    try {
      await lockSlotsMutation.mutateAsync(slotPayloads);
      setSelectedSlots(new Set());
    } catch (error) {
      console.error("Error locking slots:", error);
    }
  }, [selectedSlots, lockSlotsMutation, getSlotIdsByKeys]);

  if (isLoading || !data?.payload?.data) {
    return (
      <div className="relative overflow-x-auto">
        <Table className="border-separate border-spacing-0 text-center whitespace-nowrap w-full shadow-lg rounded-lg">
          <TableHeader>
            <TableRow className="bg-cyan-200">
              <TableHead className="border-gray-300 px-6 py-3 text-center font-semibold text-gray-700"></TableHead>
              {Array.from({ length: 12 }, (_, idx) => (
                <TableHead
                  key={idx}
                  className="border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 w-24"
                >
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-full"></div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }, (_, rowIdx) => (
              <TableRow key={rowIdx}>
                <TableCell className="sticky left-0 z-20 bg-cyan-200 border-l border-t border-b border-gray-300 px-6 py-3 text-center font-medium w-32">
                  <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                {Array.from({ length: 12 }, (_, colIdx) => (
                  <TableCell
                    key={colIdx}
                    className="border border-gray-300 px-6 py-3 text-center w-24"
                  >
                    <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date picker */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <label className="text-sm font-medium">Chọn ngày:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "dd/MM/yyyy", { locale: vi })
              ) : (
                <span>Chọn ngày</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setSelectedSlots(new Set()); // Clear selection when date changes
                }
              }}
              disabled={(date) => date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Action buttons */}
      {selectedSlots.size > 0 && (
        <div className="flex gap-2 p-4 bg-blue-50 rounded-lg">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Đã chọn {selectedSlots.size} khung giờ
            </p>
          </div>
          <Button
            onClick={handleMergeSlots}
            disabled={selectedSlots.size < 2 || mergeSlotsMutation.isPending}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <GitMerge className="h-4 w-4" />
            Gộp khung giờ
          </Button>
          <Button
            onClick={handleLockSlots}
            disabled={lockSlotsMutation.isPending}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Khóa khung giờ
          </Button>
        </div>
      )}

      <div className="relative overflow-x-auto">
        <Table className="border-separate border-spacing-0 text-center whitespace-nowrap w-full shadow-lg rounded-lg">
          <TableHeader>
            <TableRow className="bg-cyan-200">
              <TableHead className="border-gray-300 px-6 py-3 text-center font-semibold text-gray-700"></TableHead>
              {baseTimeLine.map((item, idx) => (
                <TableHead
                  key={idx}
                  className="-translate-x-1/2 border-gray-300 px-3 py-3 text-center font-semibold text-gray-700"
                >
                  {item.time}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.map((court) => (
              <TableRow
                key={court.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="sticky left-0 z-20 bg-cyan-200 border-l border-t border-b border-gray-300 px-6 py-3 text-center font-medium">
                  {court.name}
                </TableCell>
                {court.slots.map((timeSlot, index) => {
                  const isLocked = timeSlot.status === CourtSlotStatus.LOCK;
                  const slotKey = `${court.id}-${timeSlot.startTime}`;
                  const isSelected = selectedSlots.has(slotKey);

                  const start = toMinutes(timeSlot.startTime);
                  const end = toMinutes(timeSlot.endTime);
                  const step = data?.payload?.data?.minBookingMinutes ?? 15;
                  const colspan = (end - start) / step;

                  return (
                    <TableCell
                      key={`${court.id}-${timeSlot.startTime}-${index}`}
                      colSpan={colspan}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLocked) {
                          handleSlotClick(court.id, timeSlot.startTime);
                        }
                      }}
                      className={`border border-gray-300 px-3 py-3 text-center transition-all duration-200 relative 
                      ${
                        isLocked
                          ? "bg-red-100 cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-500 text-white cursor-pointer"
                          : "cursor-pointer hover:bg-gray-100"
                      }`}
                    >
                      {isLocked && (
                        <span className="text-xs text-red-600">Đã đặt</span>
                      )}
                      {isSelected && !isLocked && (
                        <span className="text-xs">✓</span>
                      )}
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
