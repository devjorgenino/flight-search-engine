import { NextRequest, NextResponse } from 'next/server';
import { generateMockFlights } from '@/mocks/flights';
import { searchFlights, parseAmadeusError } from '@/lib/amadeus';
import { SearchParams } from '@/types/flight';

// Simple in-memory cache for performance
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(params: SearchParams): string {
  return `${params.origin}-${params.destination}-${params.departureDate}-${params.returnDate || ''}-${params.passengers}`;
}

function getFromCache(key: string): unknown | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  // Limit cache size to prevent memory issues
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');
  const passengers = searchParams.get('passengers');
  const useMock = searchParams.get('mock') === 'true' || process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  // Validate required params
  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { 
        error: 'Missing required parameters',
        details: 'Please provide origin, destination, and departure date',
        code: 'INVALID_PARAMS'
      },
      { status: 400 }
    );
  }

  // Validate date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const departure = new Date(departureDate);
  if (departure < today) {
    return NextResponse.json(
      {
        error: 'Invalid departure date',
        details: 'Departure date cannot be in the past',
        code: 'INVALID_DATE'
      },
      { status: 400 }
    );
  }

  const params: SearchParams = {
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    departureDate,
    returnDate: returnDate || undefined,
    passengers: passengers ? parseInt(passengers, 10) : 1,
  };

  const cacheKey = getCacheKey(params);

  // Check cache first
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return NextResponse.json({ 
      data: cachedData, 
      cached: true,
      source: 'cache'
    });
  }

  // Use mock data if configured or for development
  if (useMock) {
    // Simulate network delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    const flights = generateMockFlights(params);
    setCache(cacheKey, flights);
    
    return NextResponse.json({ 
      data: flights,
      source: 'mock'
    });
  }

  // Use real Amadeus API
  try {
    const flights = await searchFlights(params);
    
    // Cache successful responses
    setCache(cacheKey, flights);

    return NextResponse.json({ 
      data: flights,
      source: 'amadeus',
      count: flights.length
    });
  } catch (error) {
    console.error('Amadeus API error:', error);
    
    const parsedError = parseAmadeusError(error);
    
    // If error is retryable and we have credentials issues, fall back to mock
    if (parsedError.type === 'INVALID_CREDENTIALS' || parsedError.type === 'RATE_LIMITED') {
      console.warn('Falling back to mock data due to API error');
      const flights = generateMockFlights(params);
      
      return NextResponse.json({ 
        data: flights,
        source: 'mock',
        warning: 'Using sample data. Real-time results temporarily unavailable.'
      });
    }

    // Return error response with helpful message
    return NextResponse.json(
      { 
        error: parsedError.message,
        code: parsedError.type,
        retryable: parsedError.retryable
      },
      { status: parsedError.type === 'INVALID_PARAMS' ? 400 : 503 }
    );
  }
}
