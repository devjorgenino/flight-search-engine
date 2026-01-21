"use client";

import { useMemo, useCallback, useState } from "react";
import { useFlightStore } from "@/stores/useFlightStore";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PriceRangeFilter() {
  const filters = useFlightStore((state) => state.filters);
  const setFilters = useFlightStore((state) => state.setFilters);
  const getPriceRange = useFlightStore((state) => state.getPriceRange);
  
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const [minPrice, maxPrice] = useMemo(() => getPriceRange(), [getPriceRange]);
  const currentMin = filters.priceRange[0];
  const currentMax = filters.priceRange[1];

  const handleMinChange = useCallback((value: number) => {
    const newMin = Math.min(value, currentMax - 10);
    setFilters({ priceRange: [newMin, currentMax] });
  }, [currentMax, setFilters]);

  const handleMaxChange = useCallback((value: number) => {
    const newMax = Math.max(value, currentMin + 10);
    setFilters({ priceRange: [currentMin, newMax] });
  }, [currentMin, setFilters]);

  const resetPrice = useCallback(() => {
    setFilters({ priceRange: [minPrice, maxPrice] });
  }, [minPrice, maxPrice, setFilters]);

  const isFiltered = currentMin > minPrice || currentMax < maxPrice;
  
  const range = maxPrice - minPrice;
  const minPercent = range > 0 ? Math.max(0, Math.min(100, ((currentMin - minPrice) / range) * 100)) : 0;
  const maxPercent = range > 0 ? Math.max(0, Math.min(100, ((currentMax - minPrice) / range) * 100)) : 100;

  return (
    <div className="space-y-4" role="group" aria-labelledby="price-label">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 id="price-label" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Price
        </h3>
        {isFiltered && (
          <button
            onClick={resetPrice}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Price display */}
      <div className="text-center py-3 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700" aria-live="polite">
        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {formatPrice(currentMin)}
        </span>
        <span className="mx-3 text-neutral-300 dark:text-neutral-600">—</span>
        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {formatPrice(currentMax)}
        </span>
      </div>

      {/* Slider */}
      <div className="pt-3 pb-2 px-3">
        <div className="relative h-6 overflow-visible">
          {/* Background track */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
          
          {/* Active track */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-sm"
            style={{ 
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />

          {/* Min thumb */}
          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
              "w-5 h-5 rounded-full",
              "bg-white border-2 border-emerald-500",
              "shadow-lg shadow-emerald-500/20",
              "transition-all duration-150",
              "pointer-events-none z-20",
              isDragging === 'min' && "scale-125 shadow-xl shadow-emerald-500/30",
            )}
            style={{ left: `${minPercent}%` }}
          >
            {/* Inner dot */}
            <div className="absolute inset-1 rounded-full bg-emerald-500" />
          </div>

          {/* Max thumb */}
          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
              "w-5 h-5 rounded-full",
              "bg-white border-2 border-emerald-500",
              "shadow-lg shadow-emerald-500/20",
              "transition-all duration-150",
              "pointer-events-none z-20",
              isDragging === 'max' && "scale-125 shadow-xl shadow-emerald-500/30",
            )}
            style={{ left: `${maxPercent}%` }}
          >
            {/* Inner dot */}
            <div className="absolute inset-1 rounded-full bg-emerald-500" />
          </div>

          {/* Min input */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={currentMin}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            onMouseDown={() => setIsDragging('min')}
            onMouseUp={() => setIsDragging(null)}
            onTouchStart={() => setIsDragging('min')}
            onTouchEnd={() => setIsDragging(null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-30"
            aria-label="Minimum price"
            aria-valuenow={currentMin}
            aria-valuetext={formatPrice(currentMin)}
          />

          {/* Max input */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={currentMax}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            onMouseDown={() => setIsDragging('max')}
            onMouseUp={() => setIsDragging(null)}
            onTouchStart={() => setIsDragging('max')}
            onTouchEnd={() => setIsDragging(null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-30"
            aria-label="Maximum price"
            aria-valuenow={currentMax}
            aria-valuetext={formatPrice(currentMax)}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 px-3">
        <span>{formatPrice(minPrice)}</span>
        <span>{formatPrice(maxPrice)}</span>
      </div>

      {/* Quick presets */}
      <div className="grid grid-cols-3 gap-2">
        {[100, 200, 500].filter(v => v <= maxPrice).map((value) => {
          const isActive = currentMin === minPrice && currentMax === value;
          return (
            <button
              key={value}
              onClick={() => setFilters({ priceRange: [minPrice, value] })}
              className={cn(
                "py-2 text-xs font-semibold rounded-lg transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                isActive
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              )}
              aria-pressed={isActive}
            >
              ≤ {formatPrice(value)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
