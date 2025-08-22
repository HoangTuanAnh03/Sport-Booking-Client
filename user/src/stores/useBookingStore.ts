import { CourtSlots, CourtSlotsByField } from "@/types/field";
import { create } from "zustand";

type BookingStoreState = {
  fieldDetails: CourtSlotsByField | null;
  setFieldDetails: (details: CourtSlotsByField | null) => void;
  dateSelection: Date;
  setDateSelection: (date: Date) => void;
  selectedCourtSlots: Map<string, CourtSlots[]>;
  setSelectedCourtSlots: (courtSlots: Map<string, CourtSlots[]>) => void;
  totalPrice: number;
};

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  fieldDetails: null,
  setFieldDetails: (details) => set({ fieldDetails: details }),
  dateSelection: new Date(),
  setDateSelection: (date) => set({ dateSelection: new Date(date) }),
  selectedCourtSlots: new Map(),
  setSelectedCourtSlots: (courtSlots) => {
    set({ selectedCourtSlots: new Map(courtSlots) });
    const price = Array.from(get().selectedCourtSlots.values())
      .flat()
      .reduce((totalPrice, slot) => totalPrice + (slot.price || 0), 0);
    set({ totalPrice: price });
  },
  totalPrice: 0,
}));
