"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { getSportTypeOptions, DISTANCE_OPTIONS } from "@/lib/sport-types";

export interface VenueSearchFilters {
  search: string;
  sportTypes: number[];
  maxDistance?: number;
}

interface VenueSearchFilterProps {
  onFiltersChange: (filters: VenueSearchFilters) => void;
  className?: string;
  debounceDelay?: number;
}

export default function VenueSearchFilter({
  onFiltersChange,
  className = "",
  debounceDelay = 500,
}: VenueSearchFilterProps) {
  const [searchName, setSearchName] = useState("");
  const [selectedSportTypes, setSelectedSportTypes] = useState<number[]>([]);
  const [selectedMaxDistance, setSelectedMaxDistance] = useState<number>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search name để tránh gọi API quá nhiều
  const debouncedSearchName = useDebounce(searchName, debounceDelay);

  // Sport type options
  const sportTypeOptions = getSportTypeOptions();

  // Notify parent component when filters change
  useEffect(() => {
    const filters: VenueSearchFilters = {
      search: debouncedSearchName,
      sportTypes: selectedSportTypes,
      maxDistance: selectedMaxDistance,
    };
    onFiltersChange(filters);
  }, [
    debouncedSearchName,
    selectedSportTypes,
    selectedMaxDistance,
    onFiltersChange,
  ]);

  // Handle sport type selection
  const handleSportTypeChange = (sportTypeId: string) => {
    const id = parseInt(sportTypeId);
    setSelectedSportTypes((prev) =>
      prev.includes(id) ? prev.filter((typeId) => typeId !== id) : [...prev, id]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchName("");
    setSelectedSportTypes([]);
    setSelectedMaxDistance(undefined);
    setIsFilterOpen(false);
  };

  // Clear name search
  const clearNameSearch = () => {
    setSearchName("");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchName || selectedSportTypes.length > 0 || selectedMaxDistance;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg shadow-sm p-2">
        {/* Search Input */}
        <div className="flex-1 flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400 ml-2" />
          <Input
            type="text"
            placeholder="Tìm kiếm sân thể thao theo tên, đại chỉ..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 p-0"
          />
          {searchName && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNameSearch}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Button */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`relative flex items-center gap-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                selectedSportTypes.length > 0 || selectedMaxDistance
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="font-medium">Bộ lọc</span>
              {(selectedSportTypes.length > 0 || selectedMaxDistance) && (
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
                  {selectedSportTypes.length + (selectedMaxDistance ? 1 : 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-96 p-0 border-0 shadow-xl rounded-xl"
            align="end"
          >
            <div className="bg-white rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Filter className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">
                      Bộ lọc tìm kiếm
                    </h4>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
                    >
                      Xóa tất cả
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Sport Type Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Loại thể thao
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sportTypeOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={
                          selectedSportTypes.includes(option.value)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          handleSportTypeChange(option.value.toString())
                        }
                        className={`justify-start text-sm h-9 rounded-lg transition-all duration-200 ${
                          selectedSportTypes.includes(option.value)
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:from-blue-600 hover:to-blue-700 transform hover:scale-105"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <span className="truncate">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Max Distance Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Khoảng cách tối đa
                    </Label>
                  </div>
                  <Select
                    value={selectedMaxDistance?.toString() || "all"}
                    onValueChange={(value) =>
                      setSelectedMaxDistance(
                        value === "all" ? undefined : parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger className="w-full h-10 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                      <SelectValue
                        placeholder="Chọn khoảng cách"
                        className="text-gray-600"
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-0 shadow-lg">
                      <SelectItem value="all" className="rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Không giới hạn</span>
                        </div>
                      </SelectItem>
                      {DISTANCE_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                          className="rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Footer */}
              {hasActiveFilters && (
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 text-center">
                    Đã áp dụng{" "}
                    {selectedSportTypes.length + (selectedMaxDistance ? 1 : 0)}{" "}
                    bộ lọc
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {searchName && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
              <span>Tên sân hoặc địa chỉ: &ldquo;{searchName}&rdquo;</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNameSearch}
                className="h-4 w-4 p-0 hover:bg-blue-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {selectedSportTypes.map((typeId) => {
            const sportType = sportTypeOptions.find(
              (option) => option.value === typeId
            );
            return (
              <div
                key={typeId}
                className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm"
              >
                <span>{sportType?.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSportTypeChange(typeId.toString())}
                  className="h-4 w-4 p-0 hover:bg-green-200"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}

          {selectedMaxDistance && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
              <span>
                Trong vòng{" "}
                {
                  DISTANCE_OPTIONS.find(
                    (opt) => opt.value === selectedMaxDistance
                  )?.label
                }
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMaxDistance(undefined)}
                className="h-4 w-4 p-0 hover:bg-purple-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
