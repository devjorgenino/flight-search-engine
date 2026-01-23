"use client";

import { useMemo, useCallback, useState, useRef } from "react";
import { useFlightStore } from "@/stores/useFlightStore";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PriceRangeFilter() {
  const filters = useFlightStore((state) => state.filters);
  const setFilters = useFlightStore((state) => state.setFilters);
  const getPriceRange = useFlightStore((state) => state.getPriceRange);
  
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  
  // Use local state for smooth dragging experience
  const [localMin, setLocalMin] = useState<number | null>(null);
  const [localMax, setLocalMax] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const [minPrice, maxPrice] = useMemo(() => getPriceRange(), [getPriceRange]);
  
  // Use local values while dragging, otherwise use store values
  const currentMin = localMin ?? filters.priceRange[0];
  const currentMax = localMax ?? filters.priceRange[1];

  const handleMinChange = useCallback((value: number) => {
    const newMin = Math.min(value, (localMax ?? filters.priceRange[1]) - 10);
    setLocalMin(newMin);
  }, [localMax, filters.priceRange]);

  const handleMaxChange = useCallback((value: number) => {
    const newMax = Math.max(value, (localMin ?? filters.priceRange[0]) + 10);
    setLocalMax(newMax);
  }, [localMin, filters.priceRange]);

  // Commit changes to store when dragging ends
  const commitChanges = useCallback(() => {
    const min = localMin ?? filters.priceRange[0];
    const max = localMax ?? filters.priceRange[1];
    setFilters({ priceRange: [min, max] });
    setLocalMin(null);
    setLocalMax(null);
    setIsDragging(null);
  }, [localMin, localMax, filters.priceRange, setFilters]);

  const resetPrice = useCallback(() => {
    setFilters({ priceRange: [minPrice, maxPrice] });
    setLocalMin(null);
    setLocalMax(null);
  }, [minPrice, maxPrice, setFilters]);

  const isFiltered = filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice;
  
  const range = maxPrice - minPrice;
  const minPercent = range > 0 ? Math.max(0, Math.min(100, ((currentMin - minPrice) / range) * 100)) : 0;
  const maxPercent = range > 0 ? Math.max(0, Math.min(100, ((currentMax - minPrice) / range) * 100)) : 100;

  return (
    <div 
      ref={containerRef}
      className="space-y-4" 
      role="group" 
      aria-labelledby="price-label"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 id="price-label" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Price
        </h3>
        {isFiltered && (
          <button
            onClick={resetPrice}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Price display - Fixed height to prevent layout shift */}
      <div 
        className="text-center py-3 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 h-[52px] flex items-center justify-center" 
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tabular-nums min-w-[60px] text-right">
          {formatPrice(currentMin)}
        </span>
        <span className="mx-3 text-neutral-300 dark:text-neutral-600">—</span>
        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tabular-nums min-w-[60px] text-left">
          {formatPrice(currentMax)}
        </span>
      </div>

      {/* Slider - Fixed height container */}
      <div className="pt-3 pb-2 px-3 h-[48px]">
        <div className="relative h-6">
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
              "pointer-events-none z-20",
              isDragging === 'min' && "scale-110 shadow-xl shadow-emerald-500/30",
            )}
            style={{ left: `${minPercent}%` }}
          >
            <div className="absolute inset-1 rounded-full bg-emerald-500" />
          </div>

          {/* Max thumb */}
          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
              "w-5 h-5 rounded-full",
              "bg-white border-2 border-emerald-500",
              "shadow-lg shadow-emerald-500/20",
              "pointer-events-none z-20",
              isDragging === 'max' && "scale-110 shadow-xl shadow-emerald-500/30",
            )}
            style={{ left: `${maxPercent}%` }}
          >
            <div className="absolute inset-1 rounded-full bg-emerald-500" />
          </div>

          {/* Min input */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={5}
            value={currentMin}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            onMouseDown={() => setIsDragging('min')}
            onMouseUp={commitChanges}
            onTouchStart={() => setIsDragging('min')}
            onTouchEnd={commitChanges}
            onBlur={commitChanges}
            className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-30"
            aria-label="Minimum price"
            aria-valuenow={currentMin}
            aria-valuemin={minPrice}
            aria-valuemax={maxPrice}
            aria-valuetext={formatPrice(currentMin)}
          />

          {/* Max input */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={5}
            value={currentMax}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            onMouseDown={() => setIsDragging('max')}
            onMouseUp={commitChanges}
            onTouchStart={() => setIsDragging('max')}
            onTouchEnd={commitChanges}
            onBlur={commitChanges}
            className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-30"
            aria-label="Maximum price"
            aria-valuenow={currentMax}
            aria-valuemin={minPrice}
            aria-valuemax={maxPrice}
            aria-valuetext={formatPrice(currentMax)}
          />
        </div>
      </div>

      {/* Labels - Fixed height */}
      <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 px-3 h-4">
        <span className="tabular-nums">{formatPrice(minPrice)}</span>
        <span className="tabular-nums">{formatPrice(maxPrice)}</span>
      </div>

      {/* Quick presets - Fixed height */}
      <div className="grid grid-cols-3 gap-2 h-[36px]">
        {[100, 200, 500].filter(v => v <= maxPrice).map((value) => {
          const isActive = filters.priceRange[0] === minPrice && filters.priceRange[1] === value;
          return (
            <button
              key={value}
              onClick={() => setFilters({ priceRange: [minPrice, value] })}
              className={cn(
                "py-2 text-xs font-semibold rounded-lg transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                isActive
                  ? "bg-emerald-500 text-white"
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
