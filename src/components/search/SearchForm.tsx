"use client";

import { useState, useId, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { mockAirports } from "@/mocks/airports";
import { Button, Card } from "@/components/ui";
import { AirportAutocomplete, INPUT_HEIGHT } from "./AirportAutocomplete";
import { Airport } from "@/types/flight";
import {
  ArrowRightLeft,
  Calendar,
  Users,
  Search,
  Trash2,
  Plane,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlightStore } from "@/stores/useFlightStore";
import { DEFAULT_FILTERS } from "@/lib/constants";

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface SearchFormProps {
  variant?: "hero" | "compact";
  onSearch?: (params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
  }) => void;
}

export function SearchForm({ variant = "hero", onSearch }: SearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const formId = useId();
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState<Airport | null>(() => {
    const code = searchParams.get("origin");
    return code ? mockAirports.find((a) => a.code === code) || null : null;
  });

  const [destination, setDestination] = useState<Airport | null>(() => {
    const code = searchParams.get("destination");
    return code ? mockAirports.find((a) => a.code === code) || null : null;
  });

  const [departureDate, setDepartureDate] = useState(() => {
    return searchParams.get("departureDate") || "";
  });

  const [returnDate, setReturnDate] = useState(() => {
    return searchParams.get("returnDate") || "";
  });

  const [passengers, setPassengers] = useState(() => {
    const p = searchParams.get("passengers");
    return p ? parseInt(p, 10) : 1;
  });

  const [tripType, setTripType] = useState<"roundtrip" | "oneway">(() => {
    const ret = searchParams.get("returnDate");
    const dep = searchParams.get("departureDate");
    if (ret) return "roundtrip";
    if (dep) return "oneway";
    return "roundtrip";
  });

  const [minDate] = useState(() => getTomorrowDate());
  const [touched, setTouched] = useState({
    origin: false,
    destination: false,
    departureDate: false,
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const originCode = searchParams.get("origin");
  const destCode = searchParams.get("destination");
  const deptDate = searchParams.get("departureDate");
  const retDate = searchParams.get("returnDate");
  const passStr = searchParams.get("passengers");

  const [prevParams, setPrevParams] = useState({
    originCode,
    destCode,
    deptDate,
    retDate,
    passStr,
  });

  if (prevParams.originCode !== originCode) {
    setPrevParams((prev) => ({ ...prev, originCode }));
    if (originCode) {
      const airport = mockAirports.find((a) => a.code === originCode);
      if (airport) setOrigin(airport);
    }
  }

  if (prevParams.destCode !== destCode) {
    setPrevParams((prev) => ({ ...prev, destCode }));
    if (destCode) {
      const airport = mockAirports.find((a) => a.code === destCode);
      if (airport) setDestination(airport);
    }
  }

  const dateChanged =
    prevParams.deptDate !== deptDate || prevParams.retDate !== retDate;

  if (prevParams.deptDate !== deptDate) {
    setPrevParams((prev) => ({ ...prev, deptDate }));
    if (deptDate) setDepartureDate(deptDate);
  }

  if (prevParams.retDate !== retDate) {
    setPrevParams((prev) => ({ ...prev, retDate }));
    if (retDate) setReturnDate(retDate);
  }

  if (dateChanged) {
    if (retDate) {
      setTripType("roundtrip");
    } else if (deptDate) {
      setTripType("oneway");
    }
  }

  if (prevParams.passStr !== passStr) {
    setPrevParams((prev) => ({ ...prev, passStr }));
    if (passStr) {
      setPassengers(parseInt(passStr, 10));
    }
  }

  const handleSwapAirports = useCallback(() => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  }, [origin, destination]);

  const { resetAll, filters } = useFlightStore();

  const isFiltersDirty =
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.airlines.length > 0 ||
    filters.stops.length !== DEFAULT_FILTERS.stops.length ||
    filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
    filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1] ||
    filters.departureTimeSlots.length !==
      DEFAULT_FILTERS.departureTimeSlots.length;

  const isFormDirty =
    origin !== null ||
    destination !== null ||
    departureDate !== "" ||
    passengers !== 1;

  const showClearButton = isFormDirty || isFiltersDirty;

  const handleReset = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setDepartureDate("");
    setReturnDate("");
    setPassengers(1);
    setTripType("roundtrip");
    setTouched({ origin: false, destination: false, departureDate: false });
    resetAll();
    router.replace(pathname);
  }, [resetAll, router, pathname]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setTouched({ origin: true, destination: true, departureDate: true });

      if (!origin || !destination || !departureDate) {
        return;
      }

      const params = {
        origin: origin.code,
        destination: destination.code,
        departureDate,
        returnDate: tripType === "roundtrip" ? returnDate : undefined,
        passengers,
      };

      if (onSearch) {
        onSearch(params);
      } else {
        const urlParams = new URLSearchParams({
          origin: params.origin,
          destination: params.destination,
          departureDate: params.departureDate,
          passengers: params.passengers.toString(),
        });

        if (params.returnDate) {
          urlParams.set("returnDate", params.returnDate);
        }

        router.push(`/search?${urlParams.toString()}`);
      }
    },
    [origin, destination, departureDate, tripType, returnDate, passengers, onSearch, router]
  );

  const isCompact = variant === "compact";

  const originError =
    touched.origin && !origin ? "Please select origin" : undefined;
  const destinationError =
    touched.destination && !destination ? "Please select destination" : undefined;
  const departureDateError =
    touched.departureDate && !departureDate ? "Please select date" : undefined;

  // Unified input styles - clean single border
  const getInputStyles = (field: string, hasValue: boolean, hasError?: boolean) =>
    cn(
      "w-full rounded-xl border bg-white dark:bg-neutral-900",
      "text-neutral-900 dark:text-neutral-100",
      "text-base transition-all duration-200",
      "outline-none focus:outline-none", // Always remove browser outline
      INPUT_HEIGHT,
      hasError
        ? "border-red-400 dark:border-red-600"
        : focusedField === field
          ? "border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
          : hasValue
            ? "border-emerald-400 dark:border-emerald-600"
            : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
    );

  return (
    <Card
      variant="bordered"
      padding={isCompact ? "md" : "lg"}
      className={cn(
        "w-full",
        !isCompact && variant === "hero" && "max-w-4xl mx-auto",
        "shadow-lg"
      )}
    >
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Search flights"
        noValidate
      >
        {!isCompact && variant === "hero" && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
              <Plane className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Find your perfect flight
              </span>
            </div>
          </div>
        )}

        {/* Trip Type Toggle */}
        <fieldset className="mb-5">
          <legend className="sr-only">Trip type</legend>
          <div
            className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
            role="radiogroup"
          >
            <button
              type="button"
              role="radio"
              aria-checked={tripType === "roundtrip"}
              onClick={() => setTripType("roundtrip")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                tripType === "roundtrip"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              )}
            >
              Round trip
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={tripType === "oneway"}
              onClick={() => setTripType("oneway")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                tripType === "oneway"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              )}
            >
              One way
            </button>
          </div>
        </fieldset>

        <div className="space-y-4">
          {/* Row 1: Origin & Destination */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1 min-w-0">
              <AirportAutocomplete
                label="From"
                value={origin}
                onChange={(airport) => {
                  setOrigin(airport);
                  if (!touched.origin) setTouched((t) => ({ ...t, origin: true }));
                }}
                placeholder="City or airport"
                excludeCode={destination?.code}
                type="origin"
                error={originError}
              />
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapAirports}
              disabled={!origin && !destination}
              className={cn(
                "flex-shrink-0 self-end sm:self-auto flex items-center justify-center",
                "w-[52px]",
                INPUT_HEIGHT,
                "rounded-xl border bg-white dark:bg-neutral-900",
                "border-neutral-300 dark:border-neutral-600",
                "hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-white",
                "transition-all duration-200",
                "focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
              )}
              aria-label="Swap origin and destination"
            >
              <ArrowRightLeft className="w-5 h-5 text-neutral-500" aria-hidden="true" />
            </button>

            <div className="flex-1 min-w-0">
              <AirportAutocomplete
                label="To"
                value={destination}
                onChange={(airport) => {
                  setDestination(airport);
                  if (!touched.destination) setTouched((t) => ({ ...t, destination: true }));
                }}
                placeholder="City or airport"
                excludeCode={origin?.code}
                type="destination"
                error={destinationError}
              />
            </div>
          </div>

          {/* Row 2: Dates & Passengers */}
          <div
            className={cn(
              "grid gap-3",
              tripType === "roundtrip"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2"
            )}
          >
            {/* Departure Date */}
            <div>
              <label
                htmlFor={`${formId}-departure`}
                className={cn(
                  "block text-sm font-medium mb-1.5",
                  departureDateError
                    ? "text-red-600 dark:text-red-400"
                    : "text-neutral-700 dark:text-neutral-300"
                )}
              >
                Departure
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <Calendar
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none",
                    departureDateError
                      ? "text-red-400"
                      : departureDate
                        ? "text-emerald-500"
                        : "text-neutral-400"
                  )}
                  aria-hidden="true"
                />
                <input
                  id={`${formId}-departure`}
                  type="date"
                  value={departureDate}
                  onChange={(e) => {
                    setDepartureDate(e.target.value);
                    if (!touched.departureDate) setTouched((t) => ({ ...t, departureDate: true }));
                  }}
                  onFocus={() => setFocusedField("departure")}
                  onBlur={() => setFocusedField(null)}
                  min={minDate}
                  required
                  suppressHydrationWarning
                  className={cn(
                    getInputStyles("departure", !!departureDate, !!departureDateError),
                    "pl-12 pr-4"
                  )}
                />
              </div>
              {departureDateError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {departureDateError}
                </p>
              )}
              {departureDate && !departureDateError && (
                <p className="mt-1 text-xs text-neutral-500">{formatDateDisplay(departureDate)}</p>
              )}
            </div>

            {/* Return Date */}
            {tripType === "roundtrip" && (
              <div>
                <label
                  htmlFor={`${formId}-return`}
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
                >
                  Return <span className="text-neutral-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Calendar
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none",
                      returnDate ? "text-emerald-500" : "text-neutral-400"
                    )}
                    aria-hidden="true"
                  />
                  <input
                    id={`${formId}-return`}
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    onFocus={() => setFocusedField("return")}
                    onBlur={() => setFocusedField(null)}
                    min={departureDate || minDate}
                    suppressHydrationWarning
                    className={cn(
                      getInputStyles("return", !!returnDate),
                      "pl-12 pr-4"
                    )}
                  />
                </div>
                {returnDate && (
                  <p className="mt-1 text-xs text-neutral-500">{formatDateDisplay(returnDate)}</p>
                )}
              </div>
            )}

            {/* Passengers */}
            <div>
              <label
                htmlFor={`${formId}-passengers`}
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Passengers
              </label>
              <div className="relative">
                <Users
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none",
                    passengers > 1 ? "text-emerald-500" : "text-neutral-400"
                  )}
                  aria-hidden="true"
                />
                <select
                  id={`${formId}-passengers`}
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  onFocus={() => setFocusedField("passengers")}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    getInputStyles("passengers", passengers > 1),
                    "pl-12 pr-10 appearance-none cursor-pointer"
                  )}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Passenger" : "Passengers"}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={cn(
            "mt-6 flex flex-col sm:flex-row gap-3",
            isCompact ? "justify-end" : "justify-center"
          )}
        >
          {showClearButton && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={cn(
                "gap-2",
                INPUT_HEIGHT,
                "hover:text-red-600 hover:border-red-300 hover:bg-red-50"
              )}
              onClick={handleReset}
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            className={cn(
              "gap-2 min-w-[160px]",
              !isCompact && "px-10",
              INPUT_HEIGHT,
              "bg-emerald-600 hover:bg-emerald-500",
              "shadow-lg shadow-emerald-600/20",
              "disabled:opacity-50 disabled:shadow-none"
            )}
            disabled={!origin || !destination || !departureDate}
          >
            <Search className="w-5 h-5" />
            Search Flights
          </Button>
        </div>

        {!isCompact && (
          <p className="mt-4 text-center text-xs text-neutral-400">
            Compare prices from multiple airlines
          </p>
        )}
      </form>
    </Card>
  );
}
