"use client";
import React, { useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CourtSlots, CourtSlotStatus } from "@/types/field";
import { useBookingStore } from "@/stores/useBookingStore";

// Utility functions moved outside component to prevent re-creation
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

/**
 * Efficiently calculates the total price from selected court slots
 * @param selectedCourtSlots - Map of court IDs to their selected time slots
 * @returns The total price of all selected slots
 */
const calculateTotalPrice = (
  selectedCourtSlots: Map<string, CourtSlots[]>
): number => {
  return Array.from(selectedCourtSlots.values())
    .flat()
    .reduce((totalPrice, slot) => totalPrice + (slot.price || 0), 0);
};

/**
 * Checks if a time slot is in the past for today's date
 * @param timeSlot - The time slot to check
 * @param selectedDate - The currently selected date
 * @returns True if the time slot is in the past
 */
const isPastTimeSlot = (timeSlot: CourtSlots, selectedDate: Date): boolean => {
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  if (!isToday) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const slotStartTime = toMinutes(timeSlot.startTime);

  return slotStartTime <= currentTime;
};

export const Booking = () => {
  // Store state
  const fieldDetails = useBookingStore((state) => state.fieldDetails);
  const dateSelection = useBookingStore((state) => state.dateSelection);

  const selectedCourtSlots = useBookingStore(
    (state) => state.selectedCourtSlots
  );
  const setSelectedCourtSlots = useBookingStore(
    (state) => state.setSelectedCourtSlots
  );

  // Memoized calculations for better performance
  const courts = useMemo(() => fieldDetails?.courts || [], [fieldDetails]);

  const baseTimeLine = useMemo(() => {
    if (!fieldDetails) return [];
    return generateTimeLine(
      fieldDetails.openTime,
      fieldDetails.closeTime,
      fieldDetails.minBookingMinutes
    );
  }, [fieldDetails]);

  const totalPrice = useMemo(() => {
    return calculateTotalPrice(selectedCourtSlots);
  }, [selectedCourtSlots]);

  // Optimized click handler with useCallback
  const handleCellClick = useCallback(
    (courtId: string, timeSlot: CourtSlots): void => {
      const newSelected = new Map(selectedCourtSlots);
      const slots = newSelected.get(courtId) || [];
      const exists = slots.some(
        (slot) =>
          slot.startTime === timeSlot.startTime &&
          slot.endTime === timeSlot.endTime
      );

      let updatedSlots: CourtSlots[];
      if (exists) {
        updatedSlots = slots.filter(
          (slot) =>
            !(
              slot.startTime === timeSlot.startTime &&
              slot.endTime === timeSlot.endTime
            )
        );
      } else {
        updatedSlots = [...slots, timeSlot];
      }

      if (updatedSlots.length > 0) {
        newSelected.set(courtId, updatedSlots);
      } else {
        newSelected.delete(courtId);
      }

      setSelectedCourtSlots(newSelected);
    },
    [selectedCourtSlots, setSelectedCourtSlots]
  );

  if (fieldDetails === null) {
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
    <div className="relative overflow-x-auto">
      <Table className="border-separate border-spacing-0 text-center whitespace-nowrap w-full shadow-lg rounded-lg ">
        <TableHeader>
          <TableRow className="bg-cyan-200">
            <TableHead className="  border-gray-300 px-6 py-3 text-center font-semibold text-gray-700"></TableHead>
            {baseTimeLine.map((item, idx) => (
              <TableHead
                key={idx}
                className=" -translate-x-1/2 border-gray-300 px-3 py-3 text-center font-semibold text-gray-700"
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
              <TableCell className="sticky left-0 z-20 bg-cyan-200 border-l  border-t border-b border-gray-300 px-6 py-3 text-center font-medium">
                {court.name}
              </TableCell>
              {court.slots.map((timeSlot, index) => {
                const isSelected = selectedCourtSlots
                  .get(court.id.toString())
                  ?.some(
                    (slot) =>
                      slot.startTime === timeSlot.startTime &&
                      slot.endTime === timeSlot.endTime
                  );
                const isAvailable =
                  timeSlot.status === CourtSlotStatus.AVAILABLE;
                const isPast = isPastTimeSlot(timeSlot, dateSelection);

                const step = Number(fieldDetails?.minBookingMinutes);
                const colspan =
                  (toMinutes(timeSlot.endTime) -
                    toMinutes(timeSlot.startTime)) /
                  step;

                return (
                  <TableCell
                    key={index}
                    onClick={() =>
                      isAvailable &&
                      !isPast &&
                      handleCellClick(court.id.toString(), timeSlot)
                    }
                    colSpan={colspan}
                    className={`border border-gray-300 px-3 py-3 text-center transition-all duration-200 relative ${
                      isPast
                        ? "cursor-not-allowed bg-gray-200 opacity-50"
                        : isAvailable
                        ? isSelected
                          ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                          : "hover:bg-gray-300 cursor-pointer"
                        : timeSlot.status === CourtSlotStatus.LOCK
                        ? "cursor-not-allowed bg-gray-500 hover:bg-gray-400"
                        : "cursor-not-allowed bg-red-500 hover:bg-red-400"
                    }`}
                  >
                    {/* Gray overlay for past time slots */}
                    {isPast && (
                      <div className="absolute inset-0 bg-gray-400 opacity-30 pointer-events-none rounded"></div>
                    )}

                    {/* Past time indicator */}
                    {isPast && (
                      <div className="absolute top-1 left-1 text-xs text-gray-600">
                        <span>⏰</span>
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
