"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { cn, getVenueSearchedFormLocalStorage } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import VenueItem from "@/app/maps/components/VenueItem";
import { useSideBarStore } from "@/stores/useSideBarStore";
import { DetailVenue } from "@/components/ui/venue/DetailVenue";

export default function Sidebar() {
  const [filteredVenues, setFilteredVenues] = useState<VenueMap[]>([]);
  const venuesForMap = useMapStore((state) => state.venuesForMap);
  const coordinateVenues = useMapStore((state) => state.coordinateVenues);
  const setCoordinateVenues = useMapStore((state) => state.setCoordinateVenues);
  const fieldTypes = useMapStore((state) => state.fieldTypes);
  const searchFocused = useMapStore((state) => state.searchFocused);
  const searchQuery = useMapStore((state) => state.searchQuery);
  const typeSportIdFilter = useMapStore((state) => state.typeSportIdFilter);
  const setTypeSportIdFilter = useMapStore(
    (state) => state.setTypeSportIdFilter
  );
  const sidebarOpen = useSideBarStore((state) => state.sidebarOpen);
  const venueIdSelected = useSideBarStore((state) => state.venueIdSelected);

  const handleFilterClick = (typeId: number) => {
    setTypeSportIdFilter(typeSportIdFilter === typeId ? null : typeId);
  };

  // Lọc các sân dựa trên từ khóa tìm kiếm và loại sân
  useEffect(() => {
    const resultFilteredVenues = venuesForMap.filter((venue) => {
      const matchesQuery =
        !searchQuery ||
        venue.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.venue_address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        !typeSportIdFilter ||
        venue.sport_types.some((type) => type.id === typeSportIdFilter);

      return matchesQuery && matchesType;
    });
    setCoordinateVenues(resultFilteredVenues);
    setFilteredVenues(resultFilteredVenues);
  }, [searchQuery, typeSportIdFilter]);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 z-20 h-full w-[600px] bg-white shadow-lg transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {searchFocused ? (
        <div className="h-full flex flex-col mt-14">
          {/* Bộ lọc loại sân trong sidebar */}
          <div className="p-4 border-b">
            <h3 className="font-medium text-sm text-gray-500 mb-2">Loại sân</h3>
            <div className="flex flex-wrap gap-2">
              {fieldTypes.map((type) => (
                <button
                  key={type.id}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm",
                    typeSportIdFilter === type.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  onClick={() => handleFilterClick(type.id)}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Kết quả tìm kiếm */}
          <div className="flex-1 overflow-y-auto p-4">
            {searchQuery || typeSportIdFilter ? (
              <>
                <h3 className="font-medium text-sm text-gray-500 mb-2">
                  Kết quả tìm kiếm
                </h3>
                {filteredVenues.length > 0 ? (
                  <div>
                    {coordinateVenues?.map((venue) => (
                      <VenueItem venue={venue} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy kết quả nào
                    {searchQuery && ` cho "${searchQuery}"`}
                    {typeSportIdFilter && ` với loại sân đã chọn`}
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="font-medium text-sm text-gray-500 mb-2">
                  Tìm kiếm gần đây
                </h3>
                <div className="space-y-2">
                  {coordinateVenues
                    ?.filter((venue: CoordinateVenue) => {
                      return getVenueSearchedFormLocalStorage().includes(
                        venue.id
                      );
                    })
                    .map((venue: CoordinateVenue, index: number) => (
                      // setSearchQuery(search);
                      <VenueItem venue={venue} type="clock" />
                    ))}
                </div>

                {/* <h3 className="font-medium text-sm text-gray-500 mt-6 mb-2">
                    Địa điểm gần đây
                  </h3>
                  <div>
                    {coordinateVenues?.map((venue) => (
                      <VenueItem venue={venue} />
                    ))}
                  </div> */}
              </>
            )}
          </div>
        </div>
      ) : (
        venueIdSelected && <DetailVenue />
      )}
    </div>
  );
}
