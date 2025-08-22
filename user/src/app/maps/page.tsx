"use client";

import type React from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MapComponent from "@/app/maps/Map";
import Sidebar from "@/app/maps/SideBar";
import { useGetVenueForMap } from "@/queries/useVenue";
import { useMapStore } from "@/stores/useMapStore";
import NavBar from "@/app/maps/NavBar";
import { useSideBarStore } from "@/stores/useSideBarStore";
import { useSaveUserLocation } from "@/hooks/use-location";

export default function MapPage() {
  const searchParams = useSearchParams();

  const venuesForMap = useMapStore((state) => state.venuesForMap);
  const setVenuesForMap = useMapStore((state) => state.setVenuesForMap);
  const setCoordinateVenues = useMapStore((state) => state.setCoordinateVenues);
  const setFieldTypes = useMapStore((state) => state.setFieldTypes);
  const setSearchFocused = useMapStore((state) => state.setSearchFocused);
  const setVenueIdSelected = useSideBarStore(
    (state) => state.setVenueIdSelected
  );
  const setSidebarOpen = useSideBarStore((state) => state.setSidebarOpen);
  const venueId = Number(searchParams.get("id"));
  useSaveUserLocation();

  const { data } = useGetVenueForMap();

  const fieldTypesData = [
    { id: 0, type: "multiple", name: "Sân phức hợp" },
    { id: 101, type: "badminton", name: "Sân cầu lông" },
    { id: 102, type: "football", name: "Sân bóng đá" },
    { id: 103, type: "pickleball", name: "Sân pickleball" },
    { id: 104, type: "tennis", name: "Sân tennis" },
    { id: 105, type: "volleyball", name: "Sân bóng chuyền" },
    { id: 106, type: "basketball", name: "Sân bóng rổ" },
    { id: 107, type: "golf", name: "Sân golf" },
    { id: 108, type: "padel", name: "Sân bóng bàn" },
  ];

  useEffect(() => {
    if (!venueId) {
      setSidebarOpen(false);
      setVenueIdSelected(null);
    }
  }, []);

  useEffect(() => {
    setFieldTypes(fieldTypesData);
    setVenuesForMap(data?.payload.data ?? []);
    setCoordinateVenues(data?.payload.data ?? []);
  }, [data]);

  useEffect(() => {
    if (venuesForMap) {
      const venue = venuesForMap.find((f) => f.id == venueId);
      if (venue) {
        setVenueIdSelected(venueId);
        setSidebarOpen(true);
        setSearchFocused(false);
      } else {
        setVenueIdSelected(null);
      }
    }
  }, [venueId, venuesForMap]);

  return (
    <div className="relative h-[calc(100vh-65px)] w-full overflow-hidden z-[1000]">
      <NavBar />
      <Sidebar />
      <MapComponent />
    </div>
  );
}
