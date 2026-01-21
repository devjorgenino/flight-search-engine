"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui";
import { searchAirports } from "@/mocks/airports";
import { Airport } from "@/types/flight";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AirportAutocompleteProps {
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  label?: string;
  excludeCode?: string;
}

export function AirportAutocomplete({
  value,
  onChange,
  placeholder = "Search airport...",
  label,
  excludeCode,
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState(
    value ? `${value.city} (${value.code})` : "",
  );
  const [results, setResults] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update query when value changes externally
  // Use render-phase update to avoid cascading renders
  const [prevValue, setPrevValue] = useState<Airport | null>(value);

  if (prevValue !== value) {
    setPrevValue(value);
    if (value) {
      setQuery(`${value.city} (${value.code})`);
    } else {
      setQuery("");
    }
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);

      if (newQuery.length >= 2) {
        let airports = searchAirports(newQuery);
        if (excludeCode) {
          airports = airports.filter((a) => a.code !== excludeCode);
        }
        setResults(airports);
        setIsOpen(airports.length > 0);
        setHighlightedIndex(0);
      } else {
        setResults([]);
        setIsOpen(false);
      }

      // Clear selection if query changes
      if (value && newQuery !== `${value.city} (${value.code})`) {
        onChange(null);
      }
    },
    [excludeCode, onChange, value],
  );

  const handleSelect = useCallback(
    (airport: Airport) => {
      onChange(airport);
      setQuery(`${airport.city} (${airport.code})`);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault(); // Prevent scrolling
          if (query.length >= 2 && results.length > 0) setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[highlightedIndex]) {
            handleSelect(results[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "Tab":
          // Allow standard tab behavior but close menu
          setIsOpen(false);
          break;
      }
    },
    [isOpen, results, highlightedIndex, handleSelect, query.length],
  );

  const listboxId = "airport-results-listbox";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        ref={inputRef}
        label={label}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (query.length >= 2 && results.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
        icon={<MapPin className="w-4 h-4" />}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && results[highlightedIndex]
            ? `option-${results[highlightedIndex].code}`
            : undefined
        }
      />

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <ul
            id={listboxId}
            role="listbox"
            className="max-h-64 overflow-auto py-2 outline-none"
          >
            {results.map((airport, index) => (
              <li
                key={airport.code}
                id={`option-${airport.code}`}
                role="option"
                aria-selected={index === highlightedIndex}
                onClick={() => handleSelect(airport)}
                className={cn(
                  "px-4 py-3 cursor-pointer transition-colors",
                  index === highlightedIndex
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {airport.city}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400 ml-2 text-sm">
                      {airport.name}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {airport.code}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                  {airport.country}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
