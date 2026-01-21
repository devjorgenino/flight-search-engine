"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { searchAirports } from "@/mocks/airports";
import { Airport } from "@/types/flight";
import { MapPin, Plane, Search, X, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIRPORTS } from "@/lib/constants";

// Shared input styles - exported for consistency
export const INPUT_HEIGHT = "h-[52px]";

interface AirportAutocompleteProps {
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  label?: string;
  excludeCode?: string;
  type?: "origin" | "destination";
  error?: string;
}

// Popular airports for quick selection
const POPULAR_AIRPORTS = ["MAD", "BCN", "LHR", "CDG", "FCO", "AMS"];

export function AirportAutocomplete({
  value,
  onChange,
  placeholder = "Search airport...",
  label,
  excludeCode,
  type = "origin",
  error,
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState(
    value ? `${value.city} (${value.code})` : ""
  );
  const [results, setResults] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const isBrowser = typeof window !== "undefined";

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const inputId = useId();

  const popularAirports = AIRPORTS.filter(
    (a) => POPULAR_AIRPORTS.includes(a.code) && a.code !== excludeCode
  );

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isOutsideWrapper =
        wrapperRef.current && !wrapperRef.current.contains(target);
      const isOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);

      if (isOutsideWrapper && isOutsideDropdown) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        setIsOpen(newQuery.length === 0 && isFocused);
      }

      if (value && newQuery !== `${value.city} (${value.code})`) {
        onChange(null);
      }
    },
    [excludeCode, onChange, value, isFocused]
  );

  const handleSelect = useCallback(
    (airport: Airport) => {
      onChange(airport);
      setQuery(`${airport.city} (${airport.code})`);
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onChange(null);
      setQuery("");
      setResults([]);
      inputRef.current?.focus();
    },
    [onChange]
  );

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length >= 2 && results.length > 0) {
      setIsOpen(true);
    } else if (query.length === 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
      }
    }, 150);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const itemCount =
        results.length > 0 ? results.length : popularAirports.length;

      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, itemCount - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          const airports = results.length > 0 ? results : popularAirports;
          if (airports[highlightedIndex]) {
            handleSelect(airports[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, results, popularAirports, highlightedIndex, handleSelect]
  );

  const isOrigin = type === "origin";
  const hasValue = value !== null;
  const hasError = !!error;

  const dropdownContent = isOpen && isBrowser && (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
      }}
      className={cn(
        "bg-white dark:bg-neutral-900",
        "rounded-xl shadow-xl",
        "border border-neutral-200 dark:border-neutral-700",
        "overflow-hidden",
        "animate-in fade-in slide-in-from-top-2 duration-200"
      )}
    >
      {results.length > 0 ? (
        <>
          <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3 h-3" />
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
          </div>
          <ul
            id={listboxId}
            role="listbox"
            className="max-h-64 overflow-auto py-1"
            aria-label="Airport suggestions"
          >
            {results.map((airport, index) => (
              <AirportOption
                key={airport.code}
                airport={airport}
                isHighlighted={index === highlightedIndex}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              Popular
            </p>
          </div>
          <ul
            id={listboxId}
            role="listbox"
            className="py-1"
            aria-label="Popular airports"
          >
            {popularAirports.map((airport, index) => (
              <AirportOption
                key={airport.code}
                airport={airport}
                isHighlighted={index === highlightedIndex}
                onSelect={handleSelect}
                isPopular
              />
            ))}
          </ul>
        </>
      )}

      <div className="px-3 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
        <p className="text-[10px] text-neutral-400 flex items-center gap-3">
          <span><kbd className="px-1 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-[10px]">↑↓</kbd> nav</span>
          <span><kbd className="px-1 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-[10px]">↵</kbd> select</span>
          <span><kbd className="px-1 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-[10px]">esc</kbd> close</span>
        </p>
      </div>
    </div>
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "block text-sm font-medium mb-1.5",
            hasError
              ? "text-red-600 dark:text-red-400"
              : "text-neutral-700 dark:text-neutral-300"
          )}
        >
          {label}
          <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
        </label>
      )}

      {/* Input container - single clean border */}
      <div
        className={cn(
          "relative flex items-center",
          INPUT_HEIGHT,
          "rounded-xl border bg-white dark:bg-neutral-900",
          "transition-all duration-200",
          hasError
            ? "border-red-400 dark:border-red-600"
            : isFocused
              ? "border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
              : hasValue
                ? "border-emerald-400 dark:border-emerald-600"
                : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
        )}
      >
        {/* Icon - simple, no background box */}
        <div className="flex items-center justify-center w-12 h-full flex-shrink-0">
          {isOrigin ? (
            <Plane
              className={cn(
                "w-5 h-5 -rotate-45",
                hasError
                  ? "text-red-400"
                  : hasValue
                    ? "text-emerald-500"
                    : "text-neutral-400"
              )}
              aria-hidden="true"
            />
          ) : (
            <MapPin
              className={cn(
                "w-5 h-5",
                hasError
                  ? "text-red-400"
                  : hasValue
                    ? "text-emerald-500"
                    : "text-neutral-400"
              )}
              aria-hidden="true"
            />
          )}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : `${inputId}-hint`}
          className={cn(
            "flex-1 h-full pr-3 bg-transparent border-none min-w-0",
            "outline-none focus:outline-none", // Remove all browser outlines
            "text-neutral-900 dark:text-neutral-100",
            "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
            "text-base"
          )}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen &&
            (results.length > 0
              ? results[highlightedIndex]
              : popularAirports[highlightedIndex])
              ? `option-${(results.length > 0 ? results[highlightedIndex] : popularAirports[highlightedIndex])?.code}`
              : undefined
          }
        />

        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center w-10 h-10 mr-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
            aria-label="Clear"
            tabIndex={-1}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {!hasValue && isFocused && (
          <div className="flex items-center justify-center w-10 h-10 mr-1 flex-shrink-0">
            <Search className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
        )}
      </div>

      {hasError && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      <p id={`${inputId}-hint`} className="sr-only">
        {isOrigin ? "Select departure airport" : "Select arrival airport"}
      </p>

      {isBrowser && createPortal(dropdownContent, document.body)}
    </div>
  );
}

function AirportOption({
  airport,
  isHighlighted,
  onSelect,
  isPopular = false,
}: {
  airport: Airport;
  isHighlighted: boolean;
  onSelect: (airport: Airport) => void;
  isPopular?: boolean;
}) {
  const optionRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (isHighlighted && optionRef.current) {
      optionRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isHighlighted]);

  return (
    <li
      ref={optionRef}
      id={`option-${airport.code}`}
      role="option"
      aria-selected={isHighlighted}
      onClick={() => onSelect(airport)}
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "px-3 py-2.5 cursor-pointer transition-colors",
        isHighlighted
          ? "bg-emerald-50 dark:bg-emerald-900/30"
          : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center w-12 h-9 rounded-lg font-mono font-bold text-sm flex-shrink-0",
            isHighlighted
              ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          )}
        >
          {airport.code}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {airport.city}
            </span>
            {isPopular && (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                Popular
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
            {airport.name}
          </p>
        </div>

        <div className="text-xs text-neutral-400 whitespace-nowrap flex-shrink-0">
          {airport.country}
        </div>
      </div>
    </li>
  );
}
