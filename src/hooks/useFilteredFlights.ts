'use client';

import { useMemo } from 'react';
import { useFlightStore } from '@/stores/useFlightStore';
import { Flight } from '@/types/flight';

export function useFilteredFlights(): Flight[] {
  // Subscribe to both flights and filters to trigger re-renders when they change
  const flights = useFlightStore((state) => state.flights);
  const filters = useFlightStore((state) => state.filters);
  const getFilteredFlights = useFlightStore((state) => state.getFilteredFlights);

  // Re-compute when flights or filters change
  return useMemo(() => {
    return getFilteredFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
