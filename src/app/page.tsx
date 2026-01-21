"use client";

import { Suspense } from "react";
import { SearchForm } from "@/components/search";
import { Plane, Shield, Zap, Globe, Scale } from "lucide-react";

export default function Home() {
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
        </div>
      </section>

      {/* One-Way Features Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Classic One-Way Search
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              All the classic features you expect from a premium flight search.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {/* Feature 1 */}
            <article className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4 mx-auto">
                <Zap
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Live Prices
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Real-time pricing with interactive charts
              </p>
            </article>

            {/* Feature 2 */}
            <article className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4 mx-auto">
                <Shield
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                No Hidden Fees
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Complete price transparency with no surprises
              </p>
            </article>

            {/* Feature 3 */}
            <article className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4 mx-auto">
                <Scale
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Compare Flights
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Side-by-side comparison up to 3 flights
              </p>
            </article>

            {/* Feature 4 */}
            <article className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4 mx-auto">
                <Globe
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-1.5">
                Global Coverage
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                500+ airlines worldwide
              </p>
            </article>
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
