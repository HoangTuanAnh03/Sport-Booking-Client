import { setVenueSearchedFormLocalStorage } from "@/lib/utils";
import { create } from "zustand";

type SideBarStore = {
  venueIdSelected: number | null;
  setVenueIdSelected: (venue: number | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  directionMode: boolean;
  setDirectionMode: (mode: boolean) => void;
};

export const useSideBarStore = create<SideBarStore>((set) => ({
  venueIdSelected: null,
  setVenueIdSelected: (venue) => {
    venue && setVenueSearchedFormLocalStorage(venue);
    set({ venueIdSelected: venue });
  },
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  directionMode: false,
  setDirectionMode: (mode) => set({ directionMode: mode }),
}));
