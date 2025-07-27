import { setVenueSearchedFormLocalStorage } from "@/lib/utils";
import { create } from "zustand";

type SideBarStore = {
  venueIdSelected: string | null;
  setVenueIdSelected: (venue: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export const useSideBarStore = create<SideBarStore>((set) => ({
  venueIdSelected: null,
  setVenueIdSelected: (venue) => {
    venue && setVenueSearchedFormLocalStorage(venue);
    set({ venueIdSelected: venue });
  },
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
