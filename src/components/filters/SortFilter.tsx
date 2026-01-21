"use client";

import { useFlightStore } from "@/stores/useFlightStore";
import { cn } from "@/lib/utils";
import { ArrowDownNarrowWide, Clock, DollarSign, Plane } from "lucide-react";

type SortOption = "price" | "duration" | "departure";

interface SortOptionConfig {
  value: SortOption;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SORT_OPTIONS: SortOptionConfig[] = [
  { 
    value: "price", 
    label: "Cheapest", 
    description: "Lowest price first",
    icon: DollarSign 
  },
  { 
    value: "duration", 
    label: "Fastest", 
    description: "Shortest flight first",
    icon: Clock 
  },
  { 
    value: "departure", 
    label: "Earliest", 
    description: "Earliest departure first",
    icon: Plane 
  },
];

export function SortFilter() {
  const sortBy = useFlightStore((state) => state.filters.sortBy);
  const setFilters = useFlightStore((state) => state.setFilters);

  return (
    <div className="space-y-3" role="radiogroup" aria-labelledby="sort-label">
      <h3 
        id="sort-label"
        className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2"
      >
        <ArrowDownNarrowWide className="w-4 h-4 text-neutral-400" aria-hidden="true" />
        Sort by
      </h3>
      
      <div className="grid grid-cols-3 gap-2">
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = sortBy === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => setFilters({ sortBy: option.value })}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${option.label}: ${option.description}`}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                isSelected
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700",
              )}
            >
              <Icon 
                className={cn(
                  "w-4 h-4 transition-colors",
                  isSelected ? "text-white" : "text-neutral-400 dark:text-neutral-500"
                )} 
                aria-hidden="true" 
              />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
