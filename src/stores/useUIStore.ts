import { create } from "zustand";

export interface UIStore {
  // Search panel state
  isSearchExpanded: boolean;
  setSearchExpanded: (expanded: boolean) => void;

  // Filter panel state (mobile)
  isFilterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;

  // Selected flight for details
  selectedFlightId: string | null;
  setSelectedFlightId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSearchExpanded: true,
  setSearchExpanded: (expanded) => set({ isSearchExpanded: expanded }),

  isFilterPanelOpen: false,
  setFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),

  selectedFlightId: null,
  setSelectedFlightId: (id) => set({ selectedFlightId: id }),
}));
