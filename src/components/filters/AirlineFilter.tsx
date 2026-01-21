"use client";

import { useFlightStore } from "@/stores/useFlightStore";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// Filter for specific airlines
export function AirlineFilter() {
  const filters = useFlightStore((state) => state.filters);
  const setFilters = useFlightStore((state) => state.setFilters);
  const getAvailableAirlines = useFlightStore(
    (state) => state.getAvailableAirlines,
  );

  const airlines = getAvailableAirlines();

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
  const showAll = filters.airlines.length === 0;

  const handleSelectAll = () => {
    setFilters({ airlines: [] });
  };

  if (airlines.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Airlines
        </h3>
        {!showAll && (
          <button
            onClick={handleSelectAll}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Show all
          </button>
        )}
      </div>

      <div className="space-y-1.5" role="group" aria-label="Filter by Airline">
        {airlines.map((airline) => {
          const selected = isSelected(airline.code);
          const isActive = showAll || selected;

          return (
            <button
              key={airline.code}
              onClick={() => handleToggle(airline.code)}
              role="checkbox"
              aria-checked={selected}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  : "bg-neutral-50 dark:bg-neutral-800 opacity-50",
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  selected
                    ? "bg-emerald-600 border-emerald-600"
                    : showAll
                      ? "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700"
                      : "border-neutral-300 dark:border-neutral-600",
                )}
                aria-hidden="true"
              >
                {(selected || showAll) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>

              {/* Airline logo placeholder */}
              <div
                className="w-6 h-6 rounded bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-600 dark:to-neutral-700 flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                  {airline.code}
                </span>
              </div>

              {/* Name */}
              <span className="flex-1 text-left text-neutral-700 dark:text-neutral-300 font-medium">
                {airline.name}
              </span>

              {/* Count */}
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {airline.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
