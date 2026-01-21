"use client";

import { useFlightStore } from "@/stores/useFlightStore";
import { cn } from "@/lib/utils";
import { Circle, MoreHorizontal } from "lucide-react";

interface StopOption {
  value: number;
  label: string;
  description: string;
}

const STOP_OPTIONS: StopOption[] = [
  { value: 0, label: "Non-stop", description: "Direct flight" },
  { value: 1, label: "1 stop", description: "One connection" },
  { value: 2, label: "2+ stops", description: "Multiple connections" },
];

export function StopsFilter() {
  const filters = useFlightStore((state) => state.filters);
  const setFilters = useFlightStore((state) => state.setFilters);
  const flights = useFlightStore((state) => state.flights);

  const selectedStops = filters.stops;
  const isAllSelected = selectedStops.length === 3;

  // Count flights per stop option
  const getCount = (stops: number): number => {
    if (stops === 2) {
      return flights.filter((f) => f.stops >= 2).length;
    }
    return flights.filter((f) => f.stops === stops).length;
  };

  const handleToggle = (value: number) => {
    const currentStops = [...filters.stops];
    const index = currentStops.indexOf(value);

    if (index > -1) {
      // Remove if already selected (but keep at least one)
      if (currentStops.length > 1) {
        currentStops.splice(index, 1);
        setFilters({ stops: currentStops.sort() });
      }
    } else {
      // Add if not selected
      currentStops.push(value);
      setFilters({ stops: currentStops.sort() });
    }
  };

  const selectAll = () => {
    setFilters({ stops: [0, 1, 2] });
  };

  const isSelected = (value: number) => filters.stops.includes(value);

  // Get active filters count for badge
  const activeCount = isAllSelected ? 0 : selectedStops.length;

  // Visual representation of stops
  const StopVisual = ({ stops }: { stops: number }) => {
    if (stops === 0) {
      return (
        <div className="flex items-center gap-1" aria-hidden="true">
          <Circle className="w-2 h-2 fill-current" />
          <div className="w-6 h-0.5 bg-current rounded-full" />
          <Circle className="w-2 h-2 fill-current" />
        </div>
      );
    }
    if (stops === 1) {
      return (
        <div className="flex items-center gap-0.5" aria-hidden="true">
          <Circle className="w-2 h-2 fill-current" />
          <div className="w-3 h-0.5 bg-current rounded-full" />
          <Circle className="w-1.5 h-1.5" />
          <div className="w-3 h-0.5 bg-current rounded-full" />
          <Circle className="w-2 h-2 fill-current" />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-0.5" aria-hidden="true">
        <Circle className="w-2 h-2 fill-current" />
        <div className="w-2 h-0.5 bg-current rounded-full" />
        <MoreHorizontal className="w-3 h-3" />
        <div className="w-2 h-0.5 bg-current rounded-full" />
        <Circle className="w-2 h-2 fill-current" />
      </div>
    );
  };

  return (
    <div className="space-y-3" role="group" aria-labelledby="stops-label">
      <div className="flex items-center justify-between">
        <h3 
          id="stops-label"
          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2"
        >
          Stops
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full">
              {activeCount}
            </span>
          )}
        </h3>
        {!isAllSelected && (
          <button
            onClick={selectAll}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
            aria-label="Show all stops"
          >
            All stops
          </button>
        )}
      </div>

      <div className="space-y-2">
        {STOP_OPTIONS.map((option) => {
          const count = getCount(option.value);
          const selected = isSelected(option.value);
          const isDisabled = count === 0;
          const isOnlySelected = selected && selectedStops.length === 1;

          return (
            <button
              key={option.value}
              onClick={() => !isDisabled && handleToggle(option.value)}
              disabled={isDisabled || isOnlySelected}
              role="checkbox"
              aria-checked={selected}
              aria-label={`${option.label}: ${option.description}, ${count} flights available`}
              title={isOnlySelected ? 'At least one stop option must be selected' : undefined}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                isDisabled && "opacity-40 cursor-not-allowed",
                isOnlySelected && !isDisabled && "cursor-not-allowed",
                selected && !isDisabled
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-500 shadow-sm"
                  : "bg-neutral-50 dark:bg-neutral-800/50 border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-700",
              )}
            >
              <div className="flex items-center gap-3">
                {/* Custom checkbox */}
                <div
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                    selected && !isDisabled
                      ? "bg-emerald-600 border-emerald-600"
                      : "border-neutral-300 dark:border-neutral-600"
                  )}
                  aria-hidden="true"
                >
                  {selected && !isDisabled && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="flex flex-col items-start">
                  <span 
                    className={cn(
                      "font-medium transition-colors",
                      selected && !isDisabled
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-neutral-700 dark:text-neutral-300"
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    {option.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Visual stop indicator */}
                <div 
                  className={cn(
                    "transition-colors",
                    selected && !isDisabled
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-neutral-300 dark:text-neutral-600"
                  )}
                >
                  <StopVisual stops={option.value} />
                </div>

                {/* Count badge */}
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full min-w-[2rem] text-center transition-colors",
                    selected && !isDisabled
                      ? "bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
