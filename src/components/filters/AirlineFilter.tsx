"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useFlightStore } from "@/stores/useFlightStore";
import { cn } from "@/lib/utils";
import { Check, Plane } from "lucide-react";

// Airline logo component for filter
function AirlineFilterLogo({ 
  airline, 
  selected,
  showAll 
}: { 
  airline: { code: string; name: string; logo?: string }; 
  selected: boolean;
  showAll: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [airline.logo]);
  
  const showFallback = !airline.logo || hasError;
  
  // Generate consistent colors based on airline code
  const getAirlineColor = (code: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-indigo-500 to-indigo-600', 
      'from-violet-500 to-violet-600',
      'from-sky-500 to-sky-600',
      'from-teal-500 to-teal-600',
    ];
    const index = code.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  if (showFallback) {
    return (
      <div 
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
          "bg-gradient-to-br",
          getAirlineColor(airline.code),
          selected && "ring-2 ring-emerald-500 ring-offset-1"
        )}
        aria-hidden="true"
      >
        <span className="text-[10px] font-bold text-white">
          {airline.code.slice(0, 2)}
        </span>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
        "bg-white ring-1 ring-neutral-200 dark:ring-neutral-700 overflow-hidden",
        selected && "ring-2 ring-emerald-500"
      )}
      aria-hidden="true"
    >
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg" />
      )}
      <Image
        src={airline.logo as string}
        alt=""
        width={28}
        height={28}
        className={cn(
          "object-contain transition-opacity",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}

export function AirlineFilter() {
  const filters = useFlightStore((state) => state.filters);
  const setFilters = useFlightStore((state) => state.setFilters);
  const getAvailableAirlines = useFlightStore(
    (state) => state.getAvailableAirlines,
  );

  const airlines = getAvailableAirlines();
  const selectedAirlines = filters.airlines;
  const showAll = selectedAirlines.length === 0;

  const handleToggle = (code: string) => {
    const currentAirlines = [...filters.airlines];
    const index = currentAirlines.indexOf(code);

    if (index > -1) {
      currentAirlines.splice(index, 1);
    } else {
      currentAirlines.push(code);
    }

    setFilters({ airlines: currentAirlines });
  };

  const isSelected = (code: string) => filters.airlines.includes(code);

  const handleSelectAll = () => {
    setFilters({ airlines: [] });
  };

  if (airlines.length === 0) {
    return null;
  }

  // Get active filters count for badge
  const activeCount = showAll ? 0 : selectedAirlines.length;

  return (
    <div className="space-y-3" role="group" aria-labelledby="airlines-label">
      <div className="flex items-center justify-between">
        <h3 
          id="airlines-label"
          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2"
        >
          <Plane className="w-4 h-4 text-neutral-400" aria-hidden="true" />
          Airlines
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full">
              {activeCount}
            </span>
          )}
        </h3>
        {!showAll && (
          <button
            onClick={handleSelectAll}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
            aria-label="Show all airlines"
          >
            Show all
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {airlines.map((airline) => {
          const selected = isSelected(airline.code);

          return (
            <button
              key={airline.code}
              onClick={() => handleToggle(airline.code)}
              role="checkbox"
              aria-checked={selected}
              aria-label={`${airline.name}: ${airline.count} flights available${selected ? ', currently selected' : ''}`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                selected
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-500"
                  : showAll
                    ? "bg-neutral-50 dark:bg-neutral-800/50 border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                    : "bg-neutral-50 dark:bg-neutral-800/50 border-2 border-transparent opacity-50 hover:opacity-100 hover:border-neutral-200 dark:hover:border-neutral-700",
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                  selected
                    ? "bg-emerald-600 border-emerald-600"
                    : showAll
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                      : "border-neutral-300 dark:border-neutral-600",
                )}
                aria-hidden="true"
              >
                {(selected || showAll) && (
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                )}
              </div>

              {/* Airline logo */}
              <AirlineFilterLogo 
                airline={airline} 
                selected={selected}
                showAll={showAll}
              />

              {/* Name */}
              <span 
                className={cn(
                  "flex-1 text-left font-medium transition-colors",
                  selected
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-neutral-700 dark:text-neutral-300"
                )}
              >
                {airline.name}
              </span>

              {/* Count badge */}
              <span 
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full transition-colors",
                  selected
                    ? "bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300"
                    : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                )}
              >
                {airline.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {!showAll && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center" aria-live="polite">
          Showing {selectedAirlines.length} of {airlines.length} airlines
        </p>
      )}
    </div>
  );
}
