"use client";

import { useMemo } from "react";
import { useFlightStore } from "@/stores/useFlightStore";
import { formatPrice } from "@/lib/utils";

export function PriceRangeFilter() {
  const filters = useFlightStore((state) => state.filters);
  const setFilters = useFlightStore((state) => state.setFilters);
  const getPriceRange = useFlightStore((state) => state.getPriceRange);

  // Derive min/max from current flights
  const minMax = useMemo(() => getPriceRange(), [getPriceRange]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, filters.priceRange[1] - 10);
    setFilters({ priceRange: [newMin, filters.priceRange[1]] });
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, filters.priceRange[0] + 10);
    setFilters({ priceRange: [filters.priceRange[0], newMax] });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
        Price Range
      </h3>

      <div className="space-y-4">
        {/* Price display */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatPrice(filters.priceRange[0])}
          </span>
          <span className="text-neutral-400">—</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatPrice(filters.priceRange[1])}
          </span>
        </div>

        {/* Range slider */}
        <div className="relative pt-1 h-6 select-none touch-none">
          {/* Track background */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            {/* Active range track */}
            <div
              className="absolute h-full bg-emerald-500 rounded-full"
              style={{
                left: `${((filters.priceRange[0] - minMax[0]) / (minMax[1] - minMax[0])) * 100}%`,
                right: `${100 - ((filters.priceRange[1] - minMax[0]) / (minMax[1] - minMax[0])) * 100}%`,
              }}
            />
          </div>

          {/* Visual Thumbs (Handles) - REMOVED, using native thumbs via CSS */}

          {/* Invisible Interactive Inputs */}
          <>
            <input
              type="range"
              min={minMax[0]}
              max={minMax[1]}
              value={filters.priceRange[0]}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              className="dual-range-slider absolute top-0 w-full h-full z-20 cursor-pointer"
              aria-label="Minimum price"
            />
            <input
              type="range"
              min={minMax[0]}
              max={minMax[1]}
              value={filters.priceRange[1]}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              className="dual-range-slider absolute top-0 w-full h-full z-20 cursor-pointer"
              aria-label="Maximum price"
            />
          </>
        </div>

        {/* Quick select buttons */}
        <div className="flex gap-2">
          {[100, 200, 500].map((max) => (
            <button
              key={max}
              onClick={() => {
                const newRange: [number, number] = [
                  minMax[0],
                  Math.min(max, minMax[1]),
                ];
                setFilters({ priceRange: newRange });
              }}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Under {formatPrice(max)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
