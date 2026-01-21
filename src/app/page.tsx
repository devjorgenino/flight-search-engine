"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { SearchForm } from "@/components/search";
import {
  SearchHistory,
  FavoritesList,
  PriceCalendar,
  generateMockPrices,
} from "@/components/features";
import { Card, Button } from "@/components/ui";
import {
  Plane,
  Zap,
  Globe,
  Scale,
  Heart,
  Share2,
  Clock,
  Calendar,
  Map,
  Timer,
} from "lucide-react";
import { startOfToday, format } from "date-fns";
import { useFlightStore } from "@/stores/useFlightStore";

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(false);
  const resetAll = useFlightStore((state) => state.resetAll);

  // Reset all flight data, filters, and map state when arriving at home
  useEffect(() => {
    resetAll();
  }, [resetAll]);

  // Generate mock prices for demo
  const mockPrices = useMemo(() => generateMockPrices(startOfToday(), 60), []);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Skip link for accessibility */}
      <a href="#search-form" className="skip-link">
        Skip to search
      </a>

      {/* Hero Section - Minimal with subtle gradient */}
      <section className="relative overflow-hidden border-b border-neutral-100 dark:border-neutral-900">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent_50%)]" />

        <div className="relative z-10 container mx-auto px-4 pt-8 pb-16 md:pt-12 md:pb-24">
          {/* Header */}
          <header className="flex items-center justify-between mb-16 md:mb-20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-200 flex items-center justify-center">
                <Plane
                  className="w-5 h-5 text-white dark:text-neutral-900"
                  aria-hidden="true"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                FlightSearch
              </span>
            </div>
          </header>

          {/* Hero content */}
          <div className="text-center mb-10 md:mb-14">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-neutral-900 dark:text-white mb-4 tracking-tight">
              Find your next flight
            </h1>
            <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
              Search and compare prices from hundreds of airlines. Simple, fast,
              transparent.
            </p>
          </div>

          {/* Search Form */}
          <div id="search-form">
            <Suspense
              fallback={
                <div className="h-96 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
              }
            >
              <SearchForm variant="hero" />
            </Suspense>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-3 mt-6">
            <Button
              variant={showCalendar ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowCalendar(!showCalendar)}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">View Price Calendar</span>
              <span className="sm:hidden">Calendar</span>
            </Button>
          </div>

          {/* Price Calendar (Toggleable) */}
          {showCalendar && (
            <div className="mt-8 animate-fade-in max-w-2xl mx-auto">
              <div className="text-center mb-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Sample prices for <strong>Madrid (MAD)</strong> to{" "}
                  <strong>Barcelona (BCN)</strong>
                </p>
              </div>
              <PriceCalendar
                prices={mockPrices}
                currency="EUR"
                showStats={true}
                onSelectDate={(date) => {
                  console.log("Selected date:", format(date, "yyyy-MM-dd"));
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Recent Searches Section */}
      <section className="py-8 md:py-12 border-b border-neutral-100 dark:border-neutral-900">
        <div className="container mx-auto px-4">
          <SearchHistory />
        </div>
      </section>

      {/* Saved Flights Section */}
      <section className="py-8 md:py-12 border-b border-neutral-100 dark:border-neutral-900">
        <div className="container mx-auto px-4">
          <FavoritesList variant="full" />
        </div>
      </section>

      {/* New Features Section */}
      <section className="py-8 md:py-16 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-neutral-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full mb-4">
              <Zap className="w-3 h-3" />
              FEATURES
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Enhanced Flight Search Experience
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Discover new ways to find and save your perfect flights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Feature: Favorites */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center mb-4 mx-auto">
                <Heart className="w-5 h-5 text-red-500" aria-hidden="true" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Save Favorites
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Heart your favorite flights and access them anytime
              </p>
            </Card>

            {/* Feature: Share */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4 mx-auto">
                <Share2 className="w-5 h-5 text-blue-500" aria-hidden="true" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Share Flights
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Share deals via WhatsApp, email, or copy link
              </p>
            </Card>

            {/* Feature: Search History */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center mb-4 mx-auto">
                <Clock className="w-5 h-5 text-purple-500" aria-hidden="true" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Search History
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Quick access to your recent flight searches
              </p>
            </Card>

            {/* Feature: Price Alerts */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-4 mx-auto">
                <Timer className="w-5 h-5 text-amber-500" aria-hidden="true" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Deal Countdowns
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Limited-time offers with live countdown timers
              </p>
            </Card>

            {/* Feature: Route Map */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center mb-4 mx-auto">
                <Map className="w-5 h-5 text-sky-500" aria-hidden="true" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Route Visualization
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Interactive maps with animated flight paths
              </p>
            </Card>

            {/* Feature: Price Calendar */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-center mb-4 mx-auto">
                <Calendar
                  className="w-5 h-5 text-green-500"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Price Calendar
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Find the cheapest days to fly at a glance
              </p>
            </Card>

            {/* Feature: Compare */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4 mx-auto">
                <Scale
                  className="w-5 h-5 text-emerald-500"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Compare Flights
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Side-by-side comparison of up to 3 flights
              </p>
            </Card>

            {/* Feature: Live Prices */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950 flex items-center justify-center mb-4 mx-auto">
                <Globe className="w-5 h-5 text-orange-500" aria-hidden="true" />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Global Coverage
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                500+ airlines with real-time pricing
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-100 dark:border-neutral-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-neutral-400" aria-hidden="true" />
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                FlightSearch
              </span>
            </div>
            <p className="text-sm text-neutral-400">
              © 2026 FlightSearch. Technical Challenge Demo.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
