"use client";

import { useState, useId } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { mockAirports } from "@/mocks/airports";
import { Button, Card, Input } from "@/components/ui";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { Airport } from "@/types/flight";
import { ArrowRightLeft, Calendar, Users, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlightStore } from "@/stores/useFlightStore";
import { DEFAULT_FILTERS } from "@/lib/constants";

// Helper to get tomorrow's date string (runs only on client)
function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
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

  // Sync state with URL params (handles back/forward navigation)
  // We use a ref to track the previous params and update state during render
  // to avoid "calling setState synchronously within an effect" warnings.
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

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const { resetAll, filters } = useFlightStore();

  // Check if any filter is different from default
  const isFiltersDirty =
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.airlines.length > 0 ||
    filters.stops.length !== DEFAULT_FILTERS.stops.length ||
    filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
    filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1] ||
    filters.departureTimeRange[0] !== DEFAULT_FILTERS.departureTimeRange[0] ||
    filters.departureTimeRange[1] !== DEFAULT_FILTERS.departureTimeRange[1];

  // Check if form has any data entered
  const isFormDirty =
    origin !== null ||
    destination !== null ||
    departureDate !== "" ||
    passengers !== 1;

  const showClearButton = isFormDirty || isFiltersDirty;

  const handleReset = () => {
    // Reset local state
    setOrigin(null);
    setDestination(null);
    setDepartureDate("");
    setReturnDate("");
    setPassengers(1);
    setTripType("roundtrip");

    // Reset global store (filters, etc)
    resetAll();

    // Clear URL params
    router.replace(pathname);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
      const searchParams = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        passengers: params.passengers.toString(),
      });

      if (params.returnDate) {
        searchParams.set("returnDate", params.returnDate);
      }

      router.push(`/search?${searchParams.toString()}`);
    }
  };

  const isCompact = variant === "compact";

  const inputStyles = cn(
    "w-full h-11 rounded-lg border bg-white px-3 pl-9 py-2 text-sm text-neutral-900",
    "placeholder:text-neutral-400",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
    "border-neutral-200 hover:border-neutral-300",
    "dark:bg-neutral-900 dark:text-white dark:border-neutral-700 dark:hover:border-neutral-600",
  );

  return (
    <Card
      variant="bordered"
      padding={isCompact ? "md" : "lg"}
      className={cn(
        "w-full",
        !isCompact && variant === "hero" && "max-w-3xl mx-auto",
      )}
    >
      <form onSubmit={handleSubmit} role="search" aria-label="Search flights">
        {/* Trip Type Toggle */}
        <fieldset className="flex gap-4 mb-5">
          <legend className="sr-only">Trip type</legend>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name={`${formId}-tripType`}
              checked={tripType === "roundtrip"}
              onChange={() => setTripType("roundtrip")}
              className="w-4 h-4 text-emerald-600 border-neutral-300 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
              Round trip
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name={`${formId}-tripType`}
              checked={tripType === "oneway"}
              onChange={() => setTripType("oneway")}
              className="w-4 h-4 text-emerald-600 border-neutral-300 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
              One way
            </span>
          </label>
        </fieldset>

        <div
          className={cn(
            "gap-3",
            // Special 3-row layout for round trip in hero variant
            !isCompact && tripType === "roundtrip" && variant === "hero"
              ? "space-y-4"
              : cn(
                  "grid",
                  isCompact
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
                ),
          )}
        >
          {/* Special 3-row layout for round trip in hero variant */}
          {!isCompact && tripType === "roundtrip" && variant === "hero" ? (
            <>
              {/* Row 1: Origin & Destination */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <AirportAutocomplete
                    label="From"
                    value={origin}
                    onChange={setOrigin}
                    placeholder="Departure city"
                    excludeCode={destination?.code}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className={cn(
                    "flex-shrink-0 mb-0.5 p-2 rounded-lg",
                    "bg-neutral-100 hover:bg-neutral-200",
                    "dark:bg-neutral-800 dark:hover:bg-neutral-700",
                    "transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  )}
                  aria-label="Swap origin and destination"
                >
                  <ArrowRightLeft
                    className="w-4 h-4 text-neutral-500"
                    aria-hidden="true"
                  />
                </button>

                <div className="flex-1">
                  <AirportAutocomplete
                    label="To"
                    value={destination}
                    onChange={setDestination}
                    placeholder="Arrival city"
                    excludeCode={origin?.code}
                  />
                </div>
              </div>

              {/* Row 2: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Input
                    id={`${formId}-departure`}
                    label="Departure"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={minDate}
                    suppressHydrationWarning
                    required
                    aria-required="true"
                    icon={<Calendar className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <Input
                    id={`${formId}-return`}
                    label="Return"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departureDate || minDate}
                    suppressHydrationWarning
                    icon={<Calendar className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Row 3: Passengers */}
              <div className="flex justify-start">
                <div className="w-full max-w-xs">
                  <label
                    htmlFor={`${formId}-passengers`}
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    Passengers
                  </label>
                  <div className="relative">
                    <Users
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                      aria-hidden="true"
                    />
                    <select
                      id={`${formId}-passengers`}
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className={cn(
                        inputStyles,
                        "appearance-none cursor-pointer pr-8",
                      )}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Passenger" : "Passengers"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Origin & Destination */}
              <div
                className={cn(
                  "relative flex items-end gap-2",
                  isCompact ? "lg:col-span-2" : "md:col-span-2 lg:col-span-2",
                )}
              >
                <div className="flex-1">
                  <AirportAutocomplete
                    label="From"
                    value={origin}
                    onChange={setOrigin}
                    placeholder="Departure city"
                    excludeCode={destination?.code}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className={cn(
                    "flex-shrink-0 mb-0.5 p-2 rounded-lg",
                    "bg-neutral-100 hover:bg-neutral-200",
                    "dark:bg-neutral-800 dark:hover:bg-neutral-700",
                    "transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  )}
                  aria-label="Swap origin and destination"
                >
                  <ArrowRightLeft
                    className="w-4 h-4 text-neutral-500"
                    aria-hidden="true"
                  />
                </button>

                <div className="flex-1">
                  <AirportAutocomplete
                    label="To"
                    value={destination}
                    onChange={setDestination}
                    placeholder="Arrival city"
                    excludeCode={origin?.code}
                  />
                </div>
              </div>

              {/* Departure Date */}
              <div>
                <Input
                  id={`${formId}-departure`}
                  label="Departure"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={minDate}
                  required
                  aria-required="true"
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>

              {/* Return Date */}
              {tripType === "roundtrip" && (
                <div>
                  <Input
                    id={`${formId}-return`}
                    label="Return"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departureDate || minDate}
                    icon={<Calendar className="w-4 h-4" />}
                  />
                </div>
              )}

              {/* Passengers */}
              <div
                className={
                  isCompact
                    ? ""
                    : tripType === "oneway"
                      ? ""
                      : "md:col-span-2 lg:col-span-1"
                }
              >
                <label
                  htmlFor={`${formId}-passengers`}
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
                >
                  Passengers
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                    aria-hidden="true"
                  />
                  <select
                    id={`${formId}-passengers`}
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className={cn(
                      inputStyles,
                      "appearance-none cursor-pointer pr-8",
                    )}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Passenger" : "Passengers"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search Button & Reset */}
        <div
          className={cn(
            "mt-5 flex gap-3",
            isCompact ? "justify-end" : "justify-center",
          )}
        >
          {showClearButton && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={cn(
                "gap-2 text-neutral-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 animate-in fade-in zoom-in duration-200",
                !isCompact && "px-6",
              )}
              onClick={handleReset}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Clear
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            className={cn("gap-2", !isCompact && "px-10")}
            disabled={!origin || !destination || !departureDate}
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            Search Flights
          </Button>
        </div>
      </form>
    </Card>
  );
}
