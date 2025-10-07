"use client";

import React, { useState, useMemo } from "react";
import { useGetMyVenuesQuery } from "@/queries/useVenue";
import { useGetFieldsByVenueIdQuery } from "@/queries/useField";
import { useGetCourtSlotsByFieldIdQuery } from "@/queries/useSlot";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BuildingIcon, ChevronDownIcon } from "lucide-react";
import { useAppStore } from "@/components/app-provider";
import { Skeleton } from "@/components/ui/skeleton";
import SlotsTable from "./SlotsTable";

// Utility functions
const generateTimeLine = (
  openTime: string,
  closeTime: string,
  step: number
): { time: string }[] => {
  const times: { time: string }[] = [];
  const openTimeObj = parseTime(openTime);
  const closeTimeObj = parseTime(closeTime);

  let h = openTimeObj.hour;
  let m = openTimeObj.minute;
  const endH = closeTimeObj.hour;
  const endM = closeTimeObj.minute;

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

const parseTime = (timeStr: string | { hour?: number; minute?: number }) => {
  if (
    typeof timeStr === "object" &&
    timeStr !== null &&
    "hour" in timeStr &&
    "minute" in timeStr
  ) {
    return { hour: timeStr.hour || 0, minute: timeStr.minute || 0 };
  }
  const [hour, minute] = (typeof timeStr === "string" ? timeStr : "")
    .split(":")
    .map(Number);
  return { hour: hour || 0, minute: minute || 0 };
};

const formatTime = (timeObj: any): string => {
  if (typeof timeObj === "string") return timeObj;
  if (typeof timeObj === "object" && timeObj !== null) {
    const hour = (timeObj.hour || 0).toString().padStart(2, "0");
    const minute = (timeObj.minute || 0).toString().padStart(2, "0");
    return `${hour}:${minute}`;
  }
  return "00:00";
};

const SlotsPage = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState<Date>(new Date());

  // Fix: Use local date string for API request (YYYY-MM-DD)
  const pad = (n: number) => n.toString().padStart(2, "0");
  const selectedDate = datePickerValue
    ? `${datePickerValue.getFullYear()}-${pad(
        datePickerValue.getMonth() + 1
      )}-${pad(datePickerValue.getDate())}`
    : "";

  const { data: venues, isLoading: venuesLoading } = useGetMyVenuesQuery();
  const { data: fields, isLoading: fieldsLoading } = useGetFieldsByVenueIdQuery(
    selectedVenueId || 0
  );
  const { data: fieldDetails, isLoading: slotsLoading } =
    useGetCourtSlotsByFieldIdQuery(selectedFieldId || 0, selectedDate);

  // Memoized calculations
  const courts = useMemo(() => fieldDetails?.courts || [], [fieldDetails]);

  const baseTimeLine = useMemo(() => {
    if (!fieldDetails) return [];
    const openTime = formatTime(fieldDetails.openTime);
    const closeTime = formatTime(fieldDetails.closeTime);
    return generateTimeLine(
      openTime,
      closeTime,
      fieldDetails.minBookingMinutes || 60
    );
  }, [fieldDetails]);

  const handleVenueSelect = (venueId: number) => {
    setSelectedVenueId(venueId);
    setSelectedFieldId(null); // Reset field selection
  };

  const handleFieldSelect = (fieldId: number) => {
    setSelectedFieldId(fieldId);
  };

  if (venuesLoading) {
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
      <div className="flex items-center gap-4">
        <BuildingIcon className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Quản lý khung giờ</h1>
      </div>

      {/* Date, Venue, and Field Selection */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        {/* Venue Selection */}
        <div className="flex flex-col  w-full max-w-[260px]">
          <label className="block text-sm font-medium mb-2">
            Chọn địa điểm:
          </label>
          <Select
            value={selectedVenueId ? String(selectedVenueId) : ""}
            onValueChange={(val) => handleVenueSelect(Number(val))}
            disabled={!venues || venues.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn địa điểm --" />
            </SelectTrigger>
            <SelectContent>
              {venues?.map((venue) => (
                <SelectItem
                  className="pr-2 mr-2"
                  key={venue.id}
                  value={String(venue.id)}
                >
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Field Selection */}
        {selectedVenueId && !fieldsLoading && (
          <div className="flex flex-col min-w-[160px] w-fit">
            <label className="block text-sm font-medium mb-2">
              Chọn cụm sân:
            </label>
            {fields && fields.length > 0 ? (
              <Select
                value={selectedFieldId ? String(selectedFieldId) : ""}
                onValueChange={(val) => handleFieldSelect(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn field --" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={String(field.id)}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="px-3 py-2 text-gray-500">
                Venue này chưa có field nào
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slots Table */}
      {selectedFieldId && (
        <div>
          <div className="bg-green-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-8">
              {/* Title */}
              <h1 className="text-lg font-semibold">Đặt sân theo khung giờ</h1>

              {/* Status Legend */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white rounded"></div>
                  <span className="text-sm">Trống</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-500 rounded"></div>
                  <span className="text-sm">Đã đặt</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-500 rounded"></div>
                  <span className="text-sm">Khoá</span>
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <div className="bg-green-300 text-gray-800 flex flex-col rounded-lg">
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="bg-green-300 w-48 justify-between font-normal"
                  >
                    {datePickerValue
                      ? datePickerValue.toLocaleDateString()
                      : "Chọn ngày"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={datePickerValue}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (date) setDatePickerValue(date);
                      setDatePickerOpen(false);
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <SlotsTable fieldDetails={fieldDetails} selectedDate={selectedDate} />
        </div>
      )}
    </div>
  );
};

export default SlotsPage;
