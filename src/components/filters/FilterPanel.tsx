"use client";

import { Card, Button, Skeleton } from "@/components/ui";
import { StopsFilter } from "./StopsFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { AirlineFilter } from "./AirlineFilter";
import { SortFilter } from "./SortFilter";
import { type FlightStore } from "@/stores/useFlightStore"; // Import type
import { useFlightStore } from "@/stores/useFlightStore";
import { useUIStore } from "@/stores/useUIStore";
import { X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  className?: string;
}

export function FilterPanel({ className }: FilterPanelProps) {
  const resetFilters = useFlightStore(
    (state: FlightStore) => state.resetFilters,
  );
  const flights = useFlightStore((state: FlightStore) => state.flights);
  const isLoading = useFlightStore((state: FlightStore) => state.isLoading);

  if (isLoading) {
    return (
      <Card
        variant="bordered"
        padding="lg"
        className={cn("space-y-6", className)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-16 h-5" />
          </div>
          <Skeleton className="w-12 h-4" />
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700" />

        {/* Sort Skeleton */}
        <div className="space-y-4">
          <Skeleton className="w-24 h-4" />
          <div className="space-y-2">
            <Skeleton className="w-full h-9" />
            <Skeleton className="w-full h-9" />
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700" />

        {/* Stops Skeleton */}
        <div className="space-y-4">
          <Skeleton className="w-20 h-4" />
          <div className="space-y-2">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700" />

        {/* Price Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
          <Skeleton className="w-full h-12" />
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700" />

        {/* Airlines Skeleton */}
        <div className="space-y-4">
          <Skeleton className="w-20 h-4" />
          <div className="space-y-2">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
          </div>
        </div>
      </Card>
    );
  }

  if (flights.length === 0) {
    return null;
  }

  return (
    <Card
      variant="bordered"
      padding="lg"
      className={cn("space-y-6", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Filters
          </h2>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
          aria-label="Reset all filters"
        >
          Reset all
        </button>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-700" />

      <SortFilter />

      <div className="border-t border-neutral-200 dark:border-neutral-700" />

      <StopsFilter />

      <div className="border-t border-neutral-200 dark:border-neutral-700" />

      <PriceRangeFilter />

      <div className="border-t border-neutral-200 dark:border-neutral-700" />

      <AirlineFilter />
    </Card>
  );
}

import { type UIStore } from "@/stores/useUIStore";

// Mobile Filter Panel (slide-over)
export function MobileFilterPanel() {
  const isOpen = useUIStore((state: UIStore) => state.isFilterPanelOpen);
  const setOpen = useUIStore((state: UIStore) => state.setFilterPanelOpen);
  const resetFilters = useFlightStore(
    (state: FlightStore) => state.resetFilters,
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-neutral-900 z-50 transform transition-transform duration-300 lg:hidden overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Filter options"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Filters
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          <SortFilter />
          <div className="border-t border-neutral-200 dark:border-neutral-700" />
          <StopsFilter />
          <div className="border-t border-neutral-200 dark:border-neutral-700" />
          <PriceRangeFilter />
          <div className="border-t border-neutral-200 dark:border-neutral-700" />
          <AirlineFilter />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={resetFilters}>
            Reset
          </Button>
          <Button className="flex-1" onClick={() => setOpen(false)}>
            Show results
          </Button>
        </div>
      </div>
    </>
  );
}
