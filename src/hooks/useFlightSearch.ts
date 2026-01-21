'use client';

import { useCallback, useState } from 'react';
import { useFlightStore } from '@/stores/useFlightStore';
import { SearchParams, Flight } from '@/types/flight';

interface SearchResponse {
  data?: Flight[];
  error?: string;
  code?: string;
  retryable?: boolean;
  source?: 'amadeus' | 'mock' | 'cache';
  warning?: string;
  cached?: boolean;
}

interface SearchState {
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  isRetryable: boolean;
  dataSource: 'amadeus' | 'mock' | 'cache' | null;
  warning: string | null;
}

export function useFlightSearch() {
  const {
    flights,
    setFlights,
    setSearchParams,
    setLoading,
    setError,
    resetFilters,
  } = useFlightStore();

  const [state, setState] = useState<SearchState>({
    isLoading: false,
    error: null,
    errorCode: null,
    isRetryable: false,
    dataSource: null,
    warning: null,
  });

  const search = useCallback(async (params: SearchParams) => {
    setState({
      isLoading: true,
      error: null,
      errorCode: null,
      isRetryable: false,
      dataSource: null,
      warning: null,
    });
    setLoading(true);
    setError(null);
    resetFilters();
    setSearchParams(params);

    try {
      const queryParams = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        passengers: String(params.passengers || 1),
      });

      if (params.returnDate) {
        queryParams.set('returnDate', params.returnDate);
      }

      const response = await fetch(`/api/flights?${queryParams.toString()}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      const data: SearchResponse = await response.json();

      if (!response.ok) {
        setState({
          isLoading: false,
          error: data.error || 'Failed to search flights',
          errorCode: data.code || 'UNKNOWN',
          isRetryable: data.retryable ?? true,
          dataSource: null,
          warning: null,
        });
        setError(data.error || 'Failed to search flights');
        setFlights([]);
        return;
      }

      // Success
      const flights = data.data || [];
      setFlights(flights);
      setState({
        isLoading: false,
        error: null,
        errorCode: null,
        isRetryable: false,
        dataSource: data.source || (data.cached ? 'cache' : null),
        warning: data.warning || null,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search flights';
      setState({
        isLoading: false,
        error: 'Unable to connect to the server. Please check your internet connection.',
        errorCode: 'NETWORK_ERROR',
        isRetryable: true,
        dataSource: null,
        warning: null,
      });
      setError(errorMessage);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [setFlights, setSearchParams, setLoading, setError, resetFilters]);

  const retry = useCallback((params: SearchParams) => {
    if (state.isRetryable) {
      search(params);
    }
  }, [search, state.isRetryable]);

  return {
    flights,
    isLoading: state.isLoading,
    error: state.error,
    errorCode: state.errorCode,
    isRetryable: state.isRetryable,
    dataSource: state.dataSource,
    warning: state.warning,
    search,
    retry,
  };
}
