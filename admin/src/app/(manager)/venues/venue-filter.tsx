"use client";

import React from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VenueStatus } from "@/types/venue";

const statusLabels: Record<VenueStatus, string> = {
  PENDING: "Chờ duyệt",
  ENABLE: "Hoạt động",
  UNABLE: "Chưa hoạt động",
  LOCK: "Khóa",
  UNPAID: "Chưa thanh toán",
  DELETED: "Đã xóa",
  REJECTED: "Bị từ chối",
};

export interface VenueFilterProps {
  statusFilter: VenueStatus | "ALL";
  isPaidFilter: boolean | "ALL";
  typesFilter: number[];
  sportTypes: Array<{ id: number; name: string }>;
  onStatusFilterChange: (value: VenueStatus | "ALL") => void;
  onPaidFilterChange: (value: boolean | "ALL") => void;
  onTypesFilterChange: (selectedTypes: number[]) => void;
  onClearAllFilters: () => void;
}

export function VenueFilter({
  statusFilter,
  isPaidFilter,
  typesFilter,
  sportTypes,
  onStatusFilterChange,
  onPaidFilterChange,
  onTypesFilterChange,
  onClearAllFilters,
}: VenueFilterProps) {
  const hasActiveFilters =
    statusFilter !== "ALL" || isPaidFilter !== "ALL" || typesFilter.length > 0;

  const getActiveBadges = () => {
    const badges = [];

    // Status badge - Blue color
    if (statusFilter !== "ALL") {
      badges.push({
        type: "status",
        label: `Trạng thái: ${statusLabels[statusFilter]}`,
        onRemove: () => onStatusFilterChange("ALL"),
        variant: "default" as const,
        className:
          "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
      });
    }

    // Payment badge - Green color
    if (isPaidFilter !== "ALL") {
      badges.push({
        type: "payment",
        label: `Thanh toán: ${
          isPaidFilter ? "Đã thanh toán" : "Chưa thanh toán"
        }`,
        onRemove: () => onPaidFilterChange("ALL"),
        variant: "secondary" as const,
        className:
          "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
      });
    }

    // Sport types badges - Purple color
    if (typesFilter.length > 0) {
      if (typesFilter.length === 1) {
        const sportType = sportTypes.find((type) => type.id === typesFilter[0]);
        badges.push({
          type: "sport",
          label: `Môn thể thao: ${sportType?.name || "Không xác định"}`,
          onRemove: () => onTypesFilterChange([]),
          variant: "outline" as const,
          className:
            "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300",
        });
      } else {
        badges.push({
          type: "sport",
          label: `Môn thể thao: ${typesFilter.length} đã chọn`,
          onRemove: () => onTypesFilterChange([]),
          variant: "outline" as const,
          className:
            "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300",
        });
      }
    }

    return badges;
  };

  return (
    <div className="space-y-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`justify-between ${
              hasActiveFilters ? "border-primary text-primary" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Bộ lọc</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveBadges().length}
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Bộ lọc địa điểm</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Xóa tất cả
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  onStatusFilterChange(value as VenueStatus | "ALL")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Trạng thái thanh toán
              </label>
              <Select
                value={isPaidFilter === "ALL" ? "ALL" : isPaidFilter.toString()}
                onValueChange={(value) => {
                  if (value === "ALL") {
                    onPaidFilterChange("ALL");
                  } else {
                    onPaidFilterChange(value === "true");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="true">Đã thanh toán</SelectItem>
                  <SelectItem value="false">Chưa thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sport Types Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Môn thể thao</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="truncate">
                      {typesFilter.length === 0
                        ? "Chọn môn thể thao"
                        : typesFilter.length === 1
                        ? sportTypes.find((type) => type.id === typesFilter[0])
                            ?.name
                        : `Đã chọn ${typesFilter.length} môn`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full" align="start">
                  <DropdownMenuLabel>Chọn môn thể thao</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Array.isArray(sportTypes) &&
                    sportTypes.map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type.id}
                        checked={
                          Array.isArray(typesFilter) &&
                          typesFilter.includes(type.id)
                        }
                        onCheckedChange={(checked) => {
                          const safeTypesFilter = Array.isArray(typesFilter)
                            ? typesFilter
                            : [];
                          if (checked) {
                            onTypesFilterChange([...safeTypesFilter, type.id]);
                          } else {
                            onTypesFilterChange(
                              safeTypesFilter.filter((id) => id !== type.id)
                            );
                          }
                        }}
                      >
                        {type.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  {Array.isArray(typesFilter) && typesFilter.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onTypesFilterChange([])}
                        className="text-muted-foreground"
                      >
                        Xóa tất cả
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {getActiveBadges().map((badge, index) => (
            <Badge
              key={`${badge.type}-${index}`}
              variant={badge.variant}
              className={`flex items-center gap-1 pr-1 ${badge.className}`}
            >
              <span className="text-xs">{badge.label}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={badge.onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
