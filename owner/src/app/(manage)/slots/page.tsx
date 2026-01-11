"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useGetMyVenuesQuery } from "@/queries/useVenue";
import { useGetFieldsByVenueIdQuery } from "@/queries/useField";
import { useGetCourtSlotsByFieldIdQuery } from "@/queries/useSlot";
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
import { Centrifuge } from "centrifuge";
import envConfig from "@/config";
import { getAccessTokenFormLocalStorage } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const SlotsPage = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  const centrifugeRef = useRef<Centrifuge | null>(null);

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

  const handleVenueSelect = (venueId: number) => {
    setSelectedVenueId(venueId);
    setSelectedFieldId(null); // Reset field selection
  };

  const handleFieldSelect = (fieldId: number) => {
    setSelectedFieldId(fieldId);
  };

  // Centrifugo WebSocket connection for court slots real-time updates
  useEffect(() => {
    if (!selectedFieldId || !selectedDate) return;

    console.log("Initializing Centrifugo for court slots:", { fieldId: selectedFieldId, date: selectedDate });

    const centrifuge = new Centrifuge(envConfig.NEXT_PUBLIC_CENTRIFUGO_URL, {
      getToken: async () => {
        const token = getAccessTokenFormLocalStorage();
        return token || "";
      }
    });
    centrifugeRef.current = centrifuge;

    centrifuge
      .on("connecting", function (ctx) {
        console.log(`Court slots WS connecting: ${ctx.code}, ${ctx.reason}`);
      })
      .on("connected", function (ctx) {
        console.log(`Court slots WS connected over ${ctx.transport}`);
      })
      .on("disconnected", function (ctx) {
        console.log(`Court slots WS disconnected: ${ctx.code}, ${ctx.reason}`);
      })
      .connect();

    // Subscribe to court slots channel
    const channel = `field:${selectedFieldId}-date:${selectedDate}#courtslot`;
    const sub = centrifuge.newSubscription(channel);

    sub
      .on("publication", function (ctx) {
        console.log(`Court slots update received:`, ctx.data);
        
        // Replace the entire court slots data with new data from WebSocket
        queryClient.setQueryData(
          ["court-slots", "field", selectedFieldId, selectedDate],
          () => {
            // Replace with new data from WebSocket
            return ctx.data;
          }
        );
      })
      .on("subscribing", function (ctx) {
        console.log(`Subscribing to ${channel}: ${ctx.code}, ${ctx.reason}`);
      })
      .on("subscribed", function (ctx) {
        console.log(`Subscribed to ${channel}`, ctx);
      })
      .on("unsubscribed", function (ctx) {
        console.log(`Unsubscribed from ${channel}: ${ctx.code}, ${ctx.reason}`);
      })
      .subscribe();

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log("Cleaning up court slots Centrifugo connection");
      sub.unsubscribe();
      centrifuge.disconnect();
    };
  }, [selectedFieldId, selectedDate, queryClient]);

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
