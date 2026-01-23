import { NextRequest, NextResponse } from 'next/server';
import { generateMockFlights } from '@/mocks/flights';
import { getFlightProvider, getActiveProviderType, FlightSearchError } from '@/lib/providers';
import { SearchParams, Flight } from '@/types/flight';

// ===== CACHING LAYER =====

interface CacheEntry {
  data: Flight[];
  timestamp: number;
  source: string;
}

// Simple in-memory cache for performance
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

function getCacheKey(params: SearchParams): string {
  return `${params.origin}-${params.destination}-${params.departureDate}-${params.returnDate || ''}-${params.passengers}`;
}

function getFromCache(key: string): CacheEntry | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: Flight[], source: string): void {
  // Limit cache size to prevent memory issues
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now(), source });
}

// ===== VALIDATION =====

interface ValidationResult {
  valid: boolean;
  error?: {
    message: string;
    details: string;
    code: string;
  };
}

function validateParams(searchParams: URLSearchParams): ValidationResult {
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');

  // Check required params
  if (!origin || !destination || !departureDate) {
    return {
      valid: false,
      error: {
        message: 'Missing required parameters',
        details: 'Please provide origin, destination, and departure date',
        code: 'INVALID_PARAMS',
      },
    };
  }

  // Validate airport codes (3-letter IATA codes)
  if (!/^[A-Za-z]{3}$/.test(origin) || !/^[A-Za-z]{3}$/.test(destination)) {
    return {
      valid: false,
      error: {
        message: 'Invalid airport codes',
        details: 'Airport codes must be 3-letter IATA codes (e.g., MAD, BCN)',
        code: 'INVALID_PARAMS',
      },
    };
  }

  // Validate date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const departure = new Date(departureDate);
  if (isNaN(departure.getTime())) {
    return {
      valid: false,
      error: {
        message: 'Invalid departure date',
        details: 'Please provide a valid date in YYYY-MM-DD format',
        code: 'INVALID_DATE',
      },
    };
  }

  if (departure < today) {
    return {
      valid: false,
      error: {
        message: 'Invalid departure date',
        details: 'Departure date cannot be in the past',
        code: 'INVALID_DATE',
      },
    };
  }

  // Validate return date if provided
  const returnDate = searchParams.get('returnDate');
  if (returnDate) {
    const returnDateObj = new Date(returnDate);
    if (isNaN(returnDateObj.getTime())) {
      return {
        valid: false,
        error: {
          message: 'Invalid return date',
          details: 'Please provide a valid date in YYYY-MM-DD format',
          code: 'INVALID_DATE',
        },
      };
    }
    if (returnDateObj < departure) {
      return {
        valid: false,
        error: {
          message: 'Invalid return date',
          details: 'Return date must be after departure date',
          code: 'INVALID_DATE',
        },
      };
    }
  }

  return { valid: true };
}

// ===== API ROUTE HANDLER =====

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Validate parameters
  const validation = validateParams(searchParams);
  if (!validation.valid && validation.error) {
    return NextResponse.json(validation.error, { status: 400 });
  }

  // Extract parameters
  const origin = searchParams.get('origin')!.toUpperCase();
  const destination = searchParams.get('destination')!.toUpperCase();
  const departureDate = searchParams.get('departureDate')!;
  const returnDate = searchParams.get('returnDate') || undefined;
  const passengers = parseInt(searchParams.get('passengers') || '1', 10);
  const cabinClass = searchParams.get('cabinClass') as SearchParams['cabinClass'] | undefined;

  // Check for explicit mock flag
  const useMockFlag = searchParams.get('mock') === 'true' || process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  const params: SearchParams = {
    origin,
    destination,
    departureDate,
    returnDate,
    passengers,
    cabinClass,
  };

  const cacheKey = getCacheKey(params);

  // Check cache first
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return NextResponse.json({
      data: cachedData.data,
      cached: true,
      source: 'cache',
      originalSource: cachedData.source,
      count: cachedData.data.length,
    });
  }

  // Use mock data if explicitly requested or configured
  if (useMockFlag) {
    // Simulate network delay for realistic UX during development
    await new Promise((resolve) => setTimeout(resolve, 800));

    const flights = generateMockFlights(params);
    setCache(cacheKey, flights, 'mock');

    return NextResponse.json({
      data: flights,
      source: 'mock',
      count: flights.length,
    });
  }

  // Determine which provider to use
  const providerType = getActiveProviderType();

  // If no real provider configured, use mock
  if (providerType === 'mock') {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const flights = generateMockFlights(params);
    setCache(cacheKey, flights, 'mock');

    return NextResponse.json({
      data: flights,
      source: 'mock',
      warning: 'No API configured. Using sample data.',
      count: flights.length,
    });
  }

  // Use the configured provider (SerpApi or others)
  try {
    const provider = getFlightProvider();

    if (!provider.isConfigured()) {
      console.warn(`Provider ${provider.providerName} not properly configured, falling back to mock`);
      const flights = generateMockFlights(params);

      return NextResponse.json({
        data: flights,
        source: 'mock',
        warning: 'API not configured. Using sample data.',
        count: flights.length,
      });
    }

    const result = await provider.searchFlights(params);

    // Handle empty results
    if (result.flights.length === 0) {
      return NextResponse.json({
        data: [],
        source: provider.providerName,
        count: 0,
        message: 'No flights found for your search criteria. Try different dates or airports.',
      });
    }

    // Cache successful results
    setCache(cacheKey, result.flights, provider.providerName);

    return NextResponse.json({
      data: result.flights,
      source: provider.providerName,
      count: result.flights.length,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Flight search error:', error);

    // Parse the error if it's a FlightSearchError
    const isFlightSearchError = error && typeof error === 'object' && 'type' in error && 'retryable' in error;
    const parsedError = isFlightSearchError
      ? (error as FlightSearchError)
      : {
          type: 'UNKNOWN' as const,
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          retryable: true,
        };

    // For certain errors, fall back to mock data to maintain UX
    const fallbackErrors = ['INVALID_CREDENTIALS', 'RATE_LIMITED', 'NETWORK_ERROR'];
    if (fallbackErrors.includes(parsedError.type)) {
      console.warn('Falling back to mock data due to API error:', parsedError.type);
      const flights = generateMockFlights(params);

      return NextResponse.json({
        data: flights,
        source: 'mock',
        warning: 'Real-time results temporarily unavailable. Showing sample data.',
        count: flights.length,
      });
    }

    // Return error response for non-fallback errors
    const statusCode = parsedError.type === 'INVALID_PARAMS' ? 400 : 503;

    return NextResponse.json(
      {
        error: parsedError.message,
        code: parsedError.type,
        retryable: parsedError.retryable,
      },
      { status: statusCode }
    );
  }
}
