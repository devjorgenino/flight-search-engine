"use client";

import { useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SearchForm } from "@/components/search";
import { FlightList } from "@/components/results";
import { FilterPanel, MobileFilterPanel } from "@/components/filters";
import { PriceGraph } from "@/components/charts";
import { ComparisonDrawer } from "@/components/comparison";
import { BookingConfirmation } from "@/components/booking";
import { Button } from "@/components/ui";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useUIStore } from "@/stores/useUIStore";
import { useFlightStore } from "@/stores/useFlightStore";
import { Plane, SlidersHorizontal, ArrowRight } from "lucide-react";
import { SearchParams } from "@/types/flight";

function SearchContent() {
  const searchParams = useSearchParams();
  const { search, warning, dataSource, isRetryable, isLoading } =
    useFlightSearch();

  const setFilterPanelOpen = useUIStore((state) => state.setFilterPanelOpen);
  const flights = useFlightStore((state) => state.flights);
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const isBookingConfirmationOpen = useFlightStore(
    (state) => state.isBookingConfirmationOpen,
  );
  const closeBookingConfirmation = useFlightStore(
    (state) => state.closeBookingConfirmation,
  );
  const resetAll = useFlightStore((state) => state.resetAll);

  // Build search params object
  const getSearchParams = useCallback((): SearchParams | null => {
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

  // Parse URL params and trigger search
  useEffect(() => {
    const params = getSearchParams();
    if (params) {
      search(params);
    }
  }, [searchParams, search, getSearchParams]);

  // Retry handler
  const handleRetry = useCallback(() => {
    const params = getSearchParams();
    if (params) {
      search(params);
    }
  }, [getSearchParams, search]);

  // Handle booking confirmation close
  const handleBookingClose = useCallback(() => {
    closeBookingConfirmation();
    resetAll();
  }, [closeBookingConfirmation, resetAll]);

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

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
                {dataSource === "amadeus" && (
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

            {/* Mobile filter button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6" id="main-content">
        <div className="flex gap-6">
          {/* Sidebar - Filters (Desktop) */}
          {(flights.length > 0 || isLoading) && (
            <aside
              className="hidden lg:block w-72 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500"
              aria-label="Flight filters"
            >
              <div className="sticky top-20">
                <FilterPanel />
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Price Graph */}
            {flights.length > 0 && !isLoading && (
              <section className="mb-6" aria-label="Price trends">
                <PriceGraph />
              </section>
            )}

            {/* Flight List */}
            <section id="flight-results" aria-label="Flight results">
              <FlightList
                warning={warning}
                dataSource={dataSource}
                isRetryable={isRetryable}
                onRetry={handleRetry}
              />
            </section>
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
          <div
            className="flex flex-col items-center gap-3"
            role="status"
            aria-label="Loading page"
          >
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-emerald-600 dark:border-neutral-700 dark:border-t-emerald-400 rounded-full animate-spin" />
            <p className="text-sm text-neutral-500">Loading...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
