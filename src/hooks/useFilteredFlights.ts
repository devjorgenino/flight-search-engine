'use client';

import { useMemo } from 'react';
import { useFlightStore } from '@/stores/useFlightStore';
import { Flight } from '@/types/flight';

export function useFilteredFlights(): Flight[] {
  const getFilteredFlights = useFlightStore((state) => state.getFilteredFlights);
  const flights = useFlightStore((state) => state.flights);
  const filters = useFlightStore((state) => state.filters);

  // Re-compute when flights or filters change
  return useMemo(() => {
    return getFilteredFlights();
  }, [flights, filters, getFilteredFlights]);
}

export function useFlightStats() {
  const filteredFlights = useFilteredFlights();
  const allFlights = useFlightStore((state) => state.flights);

  return useMemo(() => {
    if (filteredFlights.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        totalFlights: 0,
        filteredCount: 0,
      };
    }

    const prices = filteredFlights.map((f) => f.price.amount);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    return {
      minPrice,
      maxPrice,
      avgPrice,
      totalFlights: allFlights.length,
      filteredCount: filteredFlights.length,
    };
  }, [filteredFlights, allFlights]);
}
