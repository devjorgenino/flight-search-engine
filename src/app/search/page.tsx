"use client";

import { useEffect, Suspense, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SearchForm } from "@/components/search";
import { FlightList } from "@/components/results";
import { FilterPanel, MobileFilterPanel } from "@/components/filters";
import { PriceGraph } from "@/components/charts";
import { ComparisonDrawer } from "@/components/comparison";
import { BookingConfirmation } from "@/components/booking";
import { FlightLoadingAnimation, RouteMap, RouteMapSkeleton, FavoritesList } from "@/components/features";
import { Button } from "@/components/ui";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useSearchHistory } from "@/hooks/useLocalStorage";
import { useUIStore } from "@/stores/useUIStore";
import { useFlightStore } from "@/stores/useFlightStore";
import { Plane, SlidersHorizontal, ArrowRight } from "lucide-react";
import { SearchParams } from "@/types/flight";


function SearchContent() {
  const searchParams = useSearchParams();
  const { search, warning, dataSource, isRetryable, isLoading } =
    useFlightSearch();
  const { addSearch, isHydrated: isHistoryHydrated } = useSearchHistory();
  
  // Use refs to prevent infinite loops
  const processedSearchRef = useRef<string | null>(null);
  const addedToHistoryRef = useRef<string | null>(null);

  const setFilterPanelOpen = useUIStore((state) => state.setFilterPanelOpen);
  const flights = useFlightStore((state) => state.flights);
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const hoveredFlightId = useFlightStore((state) => state.hoveredFlightId);
  const selectedMapFlightId = useFlightStore((state) => state.selectedMapFlightId);
  const isBookingConfirmationOpen = useFlightStore(
    (state) => state.isBookingConfirmationOpen,
  );
  const closeBookingConfirmation = useFlightStore(
    (state) => state.closeBookingConfirmation,
  );
  const resetAll = useFlightStore((state) => state.resetAll);

  // Build search params object - memoized to prevent recalculation
  const currentSearchParams = useMemo((): SearchParams | null => {
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const departureDate = searchParams.get("departureDate");
    const passengers = searchParams.get("passengers");

    if (!origin || !destination || !departureDate) {
      return null;
    }

    return {
      origin,
      destination,
      departureDate,
      returnDate: searchParams.get("returnDate") || undefined,
      passengers: passengers ? parseInt(passengers, 10) : 1,
    };
  }, [searchParams]);

  // Parse URL params and trigger search - with proper dependency tracking
  useEffect(() => {
    if (!currentSearchParams) return;
    
    const searchKey = `${currentSearchParams.origin}-${currentSearchParams.destination}-${currentSearchParams.departureDate}`;
    
    // Trigger search only once per unique search
    if (processedSearchRef.current !== searchKey) {
      processedSearchRef.current = searchKey;
      search(currentSearchParams);
    }
  }, [currentSearchParams, search]);

  // Add to history in separate effect - waits for hydration
  useEffect(() => {
    if (!currentSearchParams || !isHistoryHydrated) return;
    
    const historyKey = `${currentSearchParams.origin}-${currentSearchParams.destination}-${currentSearchParams.departureDate}`;
    
    // Only add to history once per unique search
    if (addedToHistoryRef.current === historyKey) return;
    addedToHistoryRef.current = historyKey;
    
    // Fetch airport names from API
    const fetchAirportNames = async () => {
      try {
        const [originRes, destRes] = await Promise.all([
          fetch(`/api/airports?code=${currentSearchParams.origin}`),
          fetch(`/api/airports?code=${currentSearchParams.destination}`),
        ]);
        
        const originData = await originRes.json();
        const destData = await destRes.json();
        
        addSearch({
          origin: currentSearchParams.origin,
          originCity: originData.data?.city || currentSearchParams.origin,
          destination: currentSearchParams.destination,
          destinationCity: destData.data?.city || currentSearchParams.destination,
          departureDate: currentSearchParams.departureDate,
          returnDate: currentSearchParams.returnDate,
          passengers: currentSearchParams.passengers,
        });
      } catch {
        // Fallback: use codes as city names
        addSearch({
          origin: currentSearchParams.origin,
          originCity: currentSearchParams.origin,
          destination: currentSearchParams.destination,
          destinationCity: currentSearchParams.destination,
          departureDate: currentSearchParams.departureDate,
          returnDate: currentSearchParams.returnDate,
          passengers: currentSearchParams.passengers,
        });
      }
    };
    
    fetchAirportNames();
  }, [currentSearchParams, addSearch, isHistoryHydrated]);

  // Retry handler
  const handleRetry = useCallback(() => {
    if (currentSearchParams) {
      search(currentSearchParams);
    }
  }, [currentSearchParams, search]);

  // Handle booking confirmation close
  const handleBookingClose = useCallback(() => {
    closeBookingConfirmation();
    resetAll();
  }, [closeBookingConfirmation, resetAll]);

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  // Get the flight to display in the map
  // Priority: 1. Pinned (click) > 2. Hovered > 3. First flight
  const displayFlight = useMemo(() => {
    // Priority 1: Pinned flight (selected by click)
    if (selectedMapFlightId) {
      const selected = flights.find(f => f.id === selectedMapFlightId);
      if (selected) return selected;
    }
    // Priority 2: Hovered flight
    if (hoveredFlightId) {
      const hovered = flights.find(f => f.id === hoveredFlightId);
      if (hovered) return hovered;
    }
    // Default: first flight
    return flights[0] || null;
  }, [selectedMapFlightId, hoveredFlightId, flights]);
  
  // Determine the display mode for the map info text
  const mapDisplayMode = selectedMapFlightId ? 'pinned' : hoveredFlightId ? 'hovered' : null;
  
  const hasFlights = flights.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Skip link for accessibility */}
      <a
        href="#flight-results"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-neutral-900 focus:rounded-lg focus:shadow-lg"
      >
        Skip to flight results
      </a>

      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-200 flex items-center justify-center">
                <Plane
                  className="w-4 h-4 text-white dark:text-neutral-900"
                  aria-hidden="true"
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                FlightSearch
              </span>
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Route info */}
            {origin && destination && (
              <div
                className="hidden md:flex items-center gap-2 text-sm"
                aria-label={`Route from ${origin} to ${destination}`}
              >
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {origin}
                </span>
                <ArrowRight
                  className="w-4 h-4 text-neutral-400"
                  aria-hidden="true"
                />
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {destination}
                </span>
                {(dataSource === "amadeus" || dataSource === "serpapi") && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <span
                      className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Live prices from</span>
                    Live
                  </span>
                )}
              </div>
            )}

            {/* Route Map Toggle - removed, map always visible */}

            {/* Mobile filter button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden ml-2"
              onClick={() => setFilterPanelOpen(true)}
              aria-label="Open filters"
              disabled={isLoading || flights.length === 0}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span className="ml-1.5">Filters</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Compact Search */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-4">
        <div className="container mx-auto px-4">
          <SearchForm variant="compact" />
        </div>
      </div>

      {/* Route Map - Show skeleton during loading, map when flights exist */}
      {isLoading ? (
        <div className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="container mx-auto px-4 py-4">
            <RouteMapSkeleton height={280} />
          </div>
        </div>
      ) : hasFlights && displayFlight ? (
        <div className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="container mx-auto px-4 py-4">
            <RouteMap 
              flight={displayFlight} 
              height={280} 
              variant="full" 
              key={displayFlight.id}
            />
            {mapDisplayMode && (
              <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-2">
                {mapDisplayMode === 'pinned' ? 'Pinned: ' : 'Showing: '}
                {displayFlight.airline.name} - {displayFlight.origin.code} → {displayFlight.destination.code}
                {mapDisplayMode === 'pinned' && (
                  <span className="ml-2 text-neutral-400 dark:text-neutral-500">(click another flight to change)</span>
                )}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6" id="main-content">
        <div className="flex gap-6">
          {/* Sidebar - Filters (Desktop) */}
          {(flights.length > 0 || isLoading) && (
            <aside
              className="hidden lg:block w-72 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500"
              aria-label="Flight filters"
            >
              <div className="sticky top-20 space-y-4">
                <FilterPanel />
                <FavoritesList variant="compact" />
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Enhanced Loading Animation */}
            {isLoading && (
              <FlightLoadingAnimation 
                variant="full"
                message="Searching for the best flights..."
              />
            )}

            {/* Price Graph */}
            {flights.length > 0 && !isLoading && (
              <section className="mb-6" aria-label="Price trends">
                <PriceGraph />
              </section>
            )}

            {/* Flight List */}
            {!isLoading && (
              <section id="flight-results" aria-label="Flight results">
                <FlightList
                  warning={warning}
                  dataSource={dataSource}
                  isRetryable={isRetryable}
                  onRetry={handleRetry}
                />
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Panel */}
      <MobileFilterPanel />

      {/* Comparison Drawer */}
      <ComparisonDrawer />

      {/* Booking Confirmation Modal */}
      <BookingConfirmation
        flight={selectedFlight}
        isOpen={isBookingConfirmationOpen}
        onClose={handleBookingClose}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
          <FlightLoadingAnimation variant="compact" message="Loading..." />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
