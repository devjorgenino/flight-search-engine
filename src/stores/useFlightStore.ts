import { create } from "zustand";
import { Flight, FilterState, SearchParams, DepartureTimeSlot } from "@/types/flight";
import { DEFAULT_FILTERS, TIME_SLOT_RANGES, ALL_TIME_SLOTS } from "@/lib/constants";

const MAX_COMPARISON = 3;

export interface FlightStore {
  // Data
  flights: Flight[];
  searchParams: SearchParams | null;

  // Filters
  filters: FilterState;

  // UI State
  isLoading: boolean;
  error: string | null;
  hoveredFlightId: string | null;
  selectedMapFlightId: string | null; // Flight pinned to map on click

  // Comparison Feature
  comparisonIds: string[];
  isComparisonOpen: boolean;

  // Booking/Selection Feature
  selectedFlight: Flight | null;
  isBookingConfirmationOpen: boolean;

  // Actions
  setFlights: (flights: Flight[]) => void;
  setSearchParams: (params: SearchParams) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHoveredFlightId: (id: string | null) => void;
  setSelectedMapFlightId: (id: string | null) => void;

  // Comparison Actions
  toggleComparison: (flightId: string) => void;
  clearComparison: () => void;
  setComparisonOpen: (open: boolean) => void;
  isInComparison: (flightId: string) => boolean;
  getComparisonFlights: () => Flight[];

  // Booking Actions
  selectFlight: (flight: Flight) => void;
  closeBookingConfirmation: () => void;
  resetAll: () => void;

  // Computed
  getFilteredFlights: () => Flight[];
  getAvailableAirlines: () => { code: string; name: string; logo?: string; count: number }[];
  getPriceRange: () => [number, number];
  getHoveredFlight: () => Flight | null;
}

export const useFlightStore = create<FlightStore>((set, get) => ({
  // Initial state
  flights: [],
  searchParams: null,
  filters: DEFAULT_FILTERS,
  isLoading: false,
  error: null,
  hoveredFlightId: null,
  selectedMapFlightId: null,
  comparisonIds: [],
  isComparisonOpen: false,
  selectedFlight: null,
  isBookingConfirmationOpen: false,

  // Actions
  setFlights: (flights) => set({ flights, comparisonIds: [], hoveredFlightId: null, selectedMapFlightId: null }),

  setSearchParams: (params) => set({ searchParams: params }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setHoveredFlightId: (id) => set({ hoveredFlightId: id }),

  setSelectedMapFlightId: (id) => set({ selectedMapFlightId: id }),

  // Comparison Actions
  toggleComparison: (flightId) =>
    set((state) => {
      const ids = [...state.comparisonIds];
      const index = ids.indexOf(flightId);

      if (index > -1) {
        ids.splice(index, 1);
      } else if (ids.length < MAX_COMPARISON) {
        ids.push(flightId);
      }

      return { comparisonIds: ids };
    }),

  clearComparison: () => set({ comparisonIds: [], isComparisonOpen: false }),

  setComparisonOpen: (open) => set({ isComparisonOpen: open }),

  isInComparison: (flightId) => get().comparisonIds.includes(flightId),

  getComparisonFlights: () => {
    const { flights, comparisonIds } = get();
    return comparisonIds
      .map((id) => flights.find((f) => f.id === id))
      .filter((f): f is Flight => f !== undefined);
  },

  // Booking Actions
  selectFlight: (flight) =>
    set({
      selectedFlight: flight,
      isBookingConfirmationOpen: true,
      isComparisonOpen: false,
    }),

  closeBookingConfirmation: () =>
    set({
      isBookingConfirmationOpen: false,
    }),

  resetAll: () =>
    set({
      flights: [],
      searchParams: null,
      filters: DEFAULT_FILTERS,
      isLoading: false,
      error: null,
      comparisonIds: [],
      isComparisonOpen: false,
      selectedFlight: null,
      isBookingConfirmationOpen: false,
    }),

  // Computed values
  getFilteredFlights: () => {
    const { flights, filters } = get();

    let filtered = [...flights];

    // Filter by stops (handle 2+ case: include flights with 2 or more stops)
    if (filters.stops.length > 0 && filters.stops.length < 3) {
      filtered = filtered.filter((f) => {
        // If 2 is selected, include flights with 2+ stops
        if (filters.stops.includes(2) && f.stops >= 2) {
          return true;
        }
        // Otherwise check exact match for 0 and 1
        return filters.stops.includes(f.stops);
      });
    }

    // Filter by price range
    filtered = filtered.filter(
      (f) =>
        f.price.amount >= filters.priceRange[0] &&
        f.price.amount <= filters.priceRange[1],
    );

    // Filter by airlines
    if (filters.airlines.length > 0) {
      filtered = filtered.filter((f) =>
        filters.airlines.includes(f.airline.code),
      );
    }

    // Filter by departure time slots
    if (filters.departureTimeSlots.length > 0 && filters.departureTimeSlots.length < ALL_TIME_SLOTS.length) {
      filtered = filtered.filter((f) => {
        const hour = new Date(f.departureTime).getHours();
        // Check if the hour falls within any of the selected time slots
        return filters.departureTimeSlots.some((slot: DepartureTimeSlot) => {
          const range = TIME_SLOT_RANGES[slot];
          return hour >= range.start && hour < range.end;
        });
      });
    }

    // Sort
    switch (filters.sortBy) {
      case "price":
        filtered.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case "duration":
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case "departure":
        filtered.sort(
          (a, b) =>
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime(),
        );
        break;
    }

    return filtered;
  },

  getAvailableAirlines: () => {
    const { flights } = get();
    const airlineMap = new Map<
      string,
      { code: string; name: string; logo?: string; count: number }
    >();

    flights.forEach((flight) => {
      const existing = airlineMap.get(flight.airline.code);
      if (existing) {
        existing.count++;
      } else {
        airlineMap.set(flight.airline.code, {
          code: flight.airline.code,
          name: flight.airline.name,
          logo: flight.airline.logo,
          count: 1,
        });
      }
    });

    return Array.from(airlineMap.values()).sort((a, b) => b.count - a.count);
  },

  getPriceRange: () => {
    const { flights } = get();
    if (flights.length === 0) return [0, 2000];

    const prices = flights.map((f) => f.price.amount);
    return [Math.min(...prices), Math.max(...prices)];
  },

  getHoveredFlight: () => {
    const { flights, hoveredFlightId } = get();
    if (!hoveredFlightId) return null;
    return flights.find((f) => f.id === hoveredFlightId) || null;
  },
}));
