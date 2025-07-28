import type React from "react";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SwipeableFieldTypes from "@/app/maps/components/SwiperTypeSport";
import { useMapStore } from "@/stores/useMapStore";
import { useSideBarStore } from "@/stores/useSideBarStore";
import { set } from "zod";

export default function NavBar() {
  const router = useRouter();

  const setSearchQuery = useMapStore((state) => state.setSearchQuery);
  const searchQuery = useMapStore((state) => state.searchQuery);
  const setSearchFocused = useMapStore((state) => state.setSearchFocused);
  const sidebarOpen = useSideBarStore((state) => state.sidebarOpen);
  const setSidebarOpen = useSideBarStore((state) => state.setSidebarOpen);
  const setDirectionMode = useSideBarStore((state) => state.setDirectionMode);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeSidebar = () => {
    setSearchFocused(false);
    setSidebarOpen(false);
    setDirectionMode(false);
    router.push("/maps");
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    setSearchFocused(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
    router.push("/maps");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className={cn("absolute top-4 left-4 right-4 z-30 flex gap-4 h-12")}>
      <div
        onClick={() => {
          openSidebar();
        }}
        className="w-[calc(600px-24px)] bg-white outline outline-gray-300 outline-1 flex-none h-full cursor-pointer flex items-center gap-2 rounded-full"
      >
        <Button
          variant="default"
          onClick={(e) => {
            e.stopPropagation();
            closeSidebar();
          }}
          className="h-full px-6  bg-transparent hover:bg-gray-300 text-gray-950 shadow-none rounded-full "
        >
          <ChevronLeft />
        </Button>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Tìm kiếm địa điểm..."
          className="flex-1 bg-transparent outline-none border-none"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {sidebarOpen ? (
          searchQuery && (
            <Button
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                clearSearch();
              }}
              className="h-full px-6  bg-transparent hover:bg-gray-300 text-gray-950 shadow-none rounded-full "
            >
              <X />
            </Button>
          )
        ) : (
          <Button
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              openSidebar();
            }}
            className="h-full px-6  bg-transparent hover:bg-gray-300 text-gray-950 shadow-none rounded-full "
          >
            <Search />
          </Button>
        )}
      </div>

      <div className="w-[calc(100vw-600px-24px)]">
        <SwipeableFieldTypes
        // fieldTypes={fieldTypes}
        // activeFilter={null}
        // onFilterChange={() => {}}
        />
      </div>
    </div>
  );
}
