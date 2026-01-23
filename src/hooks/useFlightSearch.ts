'use client';

import { useCallback, useState } from 'react';
import { useFlightStore } from '@/stores/useFlightStore';
import { SearchParams, Flight } from '@/types/flight';

// ===== API RESPONSE TYPES =====

interface PriceInsights {
  lowestPrice: number;
  priceLevel: 'low' | 'typical' | 'high';
  typicalPriceRange: [number, number];
}

interface SearchMetadata {
  totalResults?: number;
  searchId?: string;
  cached?: boolean;
  priceInsights?: PriceInsights;
}

interface SearchResponse {
  data?: Flight[];
  error?: string;
  code?: string;
  retryable?: boolean;
  source?: 'serpapi' | 'amadeus' | 'mock' | 'cache';
  originalSource?: string;
  warning?: string;
  cached?: boolean;
  count?: number;
  message?: string;
  metadata?: SearchMetadata;
}

// ===== HOOK STATE TYPES =====

export type DataSource = 'serpapi' | 'amadeus' | 'mock' | 'cache' | null;

interface SearchState {
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  isRetryable: boolean;
  dataSource: DataSource;
  warning: string | null;
  priceInsights: PriceInsights | null;
  totalResults: number;
  isCached: boolean;
}

const initialState: SearchState = {
  isLoading: false,
  error: null,
  errorCode: null,
  isRetryable: false,
  dataSource: null,
  warning: null,
  priceInsights: null,
  totalResults: 0,
  isCached: false,
};

// ===== FLIGHT SEARCH HOOK =====

/**
 * Hook for searching flights with loading states, error handling, and metadata.
 *
 * Features:
 * - Automatic loading state management
 * - Error handling with retry support
 * - Data source tracking (SerpApi, Amadeus, Mock, Cache)
 * - Price insights when available
 * - Warning messages for fallback scenarios
 *
 * @example
 * ```tsx
 * const { search, isLoading, error, flights, dataSource } = useFlightSearch();
 *
 * const handleSearch = async () => {
 *   await search({
 *     origin: 'MAD',
 *     destination: 'BCN',
 *     departureDate: '2024-03-15',
 *     passengers: 1
 *   });
 * };
 * ```
 */
export function useFlightSearch() {
  const {
    flights,
    setFlights,
    setSearchParams,
    setLoading,
    setError,
    resetFilters,
  } = useFlightStore();

  const [state, setState] = useState<SearchState>(initialState);

  /**
   * Search for flights with the given parameters
   */
  const search = useCallback(async (params: SearchParams) => {
    // Reset state for new search
    setState({
      ...initialState,
      isLoading: true,
    });
    setLoading(true);
    setError(null);
    resetFilters();
    setSearchParams(params);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        passengers: String(params.passengers || 1),
      });

      if (params.returnDate) {
        queryParams.set('returnDate', params.returnDate);
      }

      if (params.cabinClass) {
        queryParams.set('cabinClass', params.cabinClass);
      }

      // Make API request
      const response = await fetch(`/api/flights?${queryParams.toString()}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      const data: SearchResponse = await response.json();

      // Handle error response
      if (!response.ok) {
        const errorMessage = data.error || 'Failed to search flights';
        setState({
          isLoading: false,
          error: errorMessage,
          errorCode: data.code || 'UNKNOWN',
          isRetryable: data.retryable ?? true,
          dataSource: null,
          warning: null,
          priceInsights: null,
          totalResults: 0,
          isCached: false,
        });
        setError(errorMessage);
        setFlights([]);
        return;
      }

      // Handle success response
      const flightResults = data.data || [];
      setFlights(flightResults);

      // Determine data source
      let source: DataSource = data.source || null;
      if (data.cached && data.originalSource) {
        source = 'cache';
      }

      setState({
        isLoading: false,
        error: null,
        errorCode: null,
        isRetryable: false,
        dataSource: source,
        warning: data.warning || null,
        priceInsights: data.metadata?.priceInsights || null,
        totalResults: data.count || flightResults.length,
        isCached: data.cached || false,
      });
    } catch (err) {
      // Handle network/unexpected errors
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to connect to the server. Please check your internet connection.';

      setState({
        isLoading: false,
        error: 'Unable to connect to the server. Please check your internet connection.',
        errorCode: 'NETWORK_ERROR',
        isRetryable: true,
        dataSource: null,
        warning: null,
        priceInsights: null,
        totalResults: 0,
        isCached: false,
      });
      setError(errorMessage);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [setFlights, setSearchParams, setLoading, setError, resetFilters]);

  /**
   * Retry the last search (only if retryable)
   */
  const retry = useCallback(
    (params: SearchParams) => {
      if (state.isRetryable) {
        search(params);
      }
    },
    [search, state.isRetryable]
  );

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      errorCode: null,
      isRetryable: false,
    }));
    setError(null);
  }, [setError]);

  return {
    // Data
    flights,
    totalResults: state.totalResults,

    // Loading state
    isLoading: state.isLoading,

    // Error state
    error: state.error,
    errorCode: state.errorCode,
    isRetryable: state.isRetryable,

    // Data source info
    dataSource: state.dataSource,
    isCached: state.isCached,
    warning: state.warning,

    // Metadata
    priceInsights: state.priceInsights,

    // Actions
    search,
    retry,
    clearError,
  };
}
