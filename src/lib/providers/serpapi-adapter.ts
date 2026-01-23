/**
 * SerpApi Adapter
 *
 * This adapter implements the FlightSearchProvider interface for SerpApi's Google Flights API.
 * It handles all data fetching and transformation from SerpApi format to our internal Flight model.
 *
 * @see https://serpapi.com/google-flights-api
 */

import { Flight, FlightSegment, Airport, Airline, SearchParams } from '@/types/flight';
import {
  SerpApiFlightsResponse,
  SerpApiFlight,
  SerpApiFlightLeg,
  SerpApiError,
  SerpApiErrorType,
} from '@/types/serpapi';
import {
  FlightSearchProvider,
  FlightSearchResult,
  FlightSearchError,
  ProviderConfig,
  registerProvider,
} from './types';

// ===== CONSTANTS =====

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_MAX_RESULTS = 25;

/**
 * Airline code mappings from full names to IATA codes
 * SerpApi returns full airline names, but we need IATA codes for consistency
 */
const AIRLINE_NAME_TO_CODE: Record<string, string> = {
  'Iberia': 'IB',
  'Vueling': 'VY',
  'Ryanair': 'FR',
  'easyJet': 'U2',
  'Lufthansa': 'LH',
  'Air France': 'AF',
  'British Airways': 'BA',
  'KLM': 'KL',
  'ITA Airways': 'AZ',
  'Alitalia': 'AZ',
  'Air Europa': 'UX',
  'TAP Air Portugal': 'TP',
  'Swiss International Air Lines': 'LX',
  'SWISS': 'LX',
  'Austrian Airlines': 'OS',
  'Brussels Airlines': 'SN',
  'Scandinavian Airlines': 'SK',
  'SAS': 'SK',
  'Norwegian': 'DY',
  'Finnair': 'AY',
  'Aer Lingus': 'EI',
  'Eurowings': 'EW',
  'Transavia': 'HV',
  'Wizz Air': 'W6',
  'American Airlines': 'AA',
  'Delta Air Lines': 'DL',
  'Delta': 'DL',
  'United Airlines': 'UA',
  'United': 'UA',
  'Emirates': 'EK',
  'Qatar Airways': 'QR',
  'Turkish Airlines': 'TK',
  'Air Canada': 'AC',
};

/**
 * City and airport name mappings for common airports
 */
const AIRPORT_INFO: Record<string, { city: string; name: string; country: string }> = {
  MAD: { city: 'Madrid', name: 'Adolfo Suárez Madrid-Barajas', country: 'Spain' },
  BCN: { city: 'Barcelona', name: 'Barcelona-El Prat', country: 'Spain' },
  LHR: { city: 'London', name: 'Heathrow', country: 'UK' },
  LGW: { city: 'London', name: 'Gatwick', country: 'UK' },
  STN: { city: 'London', name: 'Stansted', country: 'UK' },
  CDG: { city: 'Paris', name: 'Charles de Gaulle', country: 'France' },
  ORY: { city: 'Paris', name: 'Orly', country: 'France' },
  FCO: { city: 'Rome', name: 'Leonardo da Vinci–Fiumicino', country: 'Italy' },
  AMS: { city: 'Amsterdam', name: 'Schiphol', country: 'Netherlands' },
  FRA: { city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  MUC: { city: 'Munich', name: 'Munich Airport', country: 'Germany' },
  LIS: { city: 'Lisbon', name: 'Humberto Delgado', country: 'Portugal' },
  VIE: { city: 'Vienna', name: 'Vienna International', country: 'Austria' },
  ZRH: { city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
  BRU: { city: 'Brussels', name: 'Brussels Airport', country: 'Belgium' },
  CPH: { city: 'Copenhagen', name: 'Copenhagen Airport', country: 'Denmark' },
  OSL: { city: 'Oslo', name: 'Oslo Gardermoen', country: 'Norway' },
  ARN: { city: 'Stockholm', name: 'Stockholm Arlanda', country: 'Sweden' },
  HEL: { city: 'Helsinki', name: 'Helsinki-Vantaa', country: 'Finland' },
  DUB: { city: 'Dublin', name: 'Dublin Airport', country: 'Ireland' },
  ATH: { city: 'Athens', name: 'Eleftherios Venizelos', country: 'Greece' },
  PRG: { city: 'Prague', name: 'Václav Havel Airport', country: 'Czech Republic' },
  WAW: { city: 'Warsaw', name: 'Warsaw Chopin', country: 'Poland' },
  BUD: { city: 'Budapest', name: 'Budapest Ferenc Liszt', country: 'Hungary' },
  MXP: { city: 'Milan', name: 'Milan Malpensa', country: 'Italy' },
  VCE: { city: 'Venice', name: 'Venice Marco Polo', country: 'Italy' },
  NAP: { city: 'Naples', name: 'Naples International', country: 'Italy' },
  PMI: { city: 'Palma', name: 'Palma de Mallorca', country: 'Spain' },
  AGP: { city: 'Málaga', name: 'Málaga–Costa del Sol', country: 'Spain' },
  SVQ: { city: 'Seville', name: 'Seville Airport', country: 'Spain' },
  VLC: { city: 'Valencia', name: 'Valencia Airport', country: 'Spain' },
  BIO: { city: 'Bilbao', name: 'Bilbao Airport', country: 'Spain' },
  NCE: { city: 'Nice', name: 'Nice Côte d\'Azur', country: 'France' },
  LYS: { city: 'Lyon', name: 'Lyon-Saint Exupéry', country: 'France' },
  MRS: { city: 'Marseille', name: 'Marseille Provence', country: 'France' },
  GVA: { city: 'Geneva', name: 'Geneva Airport', country: 'Switzerland' },
  EDI: { city: 'Edinburgh', name: 'Edinburgh Airport', country: 'UK' },
  MAN: { city: 'Manchester', name: 'Manchester Airport', country: 'UK' },
  JFK: { city: 'New York', name: 'John F. Kennedy', country: 'USA' },
  LAX: { city: 'Los Angeles', name: 'Los Angeles International', country: 'USA' },
  DXB: { city: 'Dubai', name: 'Dubai International', country: 'UAE' },
  IST: { city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },
};

// ===== HELPER FUNCTIONS =====

/**
 * Extract IATA code from airline name or flight number
 */
function getAirlineCode(airlineName: string, flightNumber?: string): string {
  // Try direct mapping first
  const directCode = AIRLINE_NAME_TO_CODE[airlineName];
  if (directCode) return directCode;

  // Try to find partial match
  const lowerName = airlineName.toLowerCase();
  for (const [name, code] of Object.entries(AIRLINE_NAME_TO_CODE)) {
    if (lowerName.includes(name.toLowerCase()) || name.toLowerCase().includes(lowerName)) {
      return code;
    }
  }

  // Try to extract from flight number (e.g., "IB 3456" -> "IB")
  if (flightNumber) {
    const match = flightNumber.match(/^([A-Z]{2,3})/);
    if (match) return match[1];
  }

  // Return first 2 letters of airline name as fallback
  return airlineName.substring(0, 2).toUpperCase();
}

/**
 * Build Airport object from IATA code and optional name
 */
function buildAirport(code: string, name?: string): Airport {
  const info = AIRPORT_INFO[code];
  return {
    code,
    city: info?.city || code,
    name: name || info?.name || code,
    country: info?.country || '',
  };
}

/**
 * Build Airline object from name and optional logo URL
 */
function buildAirline(name: string, flightNumber?: string, logoUrl?: string): Airline {
  const code = getAirlineCode(name, flightNumber);
  return {
    code,
    name,
    logo: logoUrl,
  };
}

/**
 * Parse time string to ISO datetime
 * Handles both "HH:MM" and "HH:MM AM/PM" formats
 */
function parseTimeToISO(timeStr: string, baseDate: string): string {
  // If already ISO format, return as-is
  if (timeStr.includes('T')) return timeStr;

  // Parse time components
  const cleanTime = timeStr.replace(/\s+/g, ' ').trim();
  let hours: number;
  let minutes: number;

  // Handle 12-hour format with AM/PM
  const ampmMatch = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const isPM = ampmMatch[3].toUpperCase() === 'PM';
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  } else {
    // Handle 24-hour format
    const match = cleanTime.match(/(\d{1,2}):(\d{2})/);
    if (!match) return `${baseDate}T00:00:00.000Z`;
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
  }

  const date = new Date(baseDate);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
}

/**
 * Parse flight number from SerpApi format
 * Handles formats like "IB 3456", "IB3456", "Iberia 3456"
 */
function parseFlightNumber(flightNumber: string, airlineName: string): string {
  // If already in correct format, return as-is
  if (/^[A-Z]{2}\s?\d+$/.test(flightNumber)) {
    return flightNumber.replace(/\s/g, '');
  }

  // Extract just the number and prepend airline code
  const numberMatch = flightNumber.match(/\d+/);
  if (numberMatch) {
    const code = getAirlineCode(airlineName);
    return `${code}${numberMatch[0]}`;
  }

  return flightNumber;
}

/**
 * Generate a unique flight ID from flight data
 */
function generateFlightId(flight: SerpApiFlight, index: number): string {
  const firstLeg = flight.flights[0];
  const lastLeg = flight.flights[flight.flights.length - 1];
  const flightNum = firstLeg?.flight_number?.replace(/\s/g, '') || '';
  const depCode = firstLeg?.departure_airport?.id || 'XXX';
  const arrCode = lastLeg?.arrival_airport?.id || 'XXX';
  return `SERP-${depCode}${arrCode}-${flightNum}-${index}`.toUpperCase();
}

// ===== TRANSFORMATION FUNCTIONS =====

/**
 * Transform a SerpApi flight leg to our FlightSegment model
 */
function transformLegToSegment(leg: SerpApiFlightLeg, baseDate: string): FlightSegment {
  const depTime = leg.departure_airport.time || '00:00';
  const arrTime = leg.arrival_airport.time || '00:00';

  return {
    departure: {
      airport: buildAirport(leg.departure_airport.id, leg.departure_airport.name),
      time: parseTimeToISO(depTime, baseDate),
    },
    arrival: {
      airport: buildAirport(leg.arrival_airport.id, leg.arrival_airport.name),
      time: parseTimeToISO(arrTime, baseDate),
    },
    duration: leg.duration,
    flightNumber: parseFlightNumber(leg.flight_number, leg.airline),
    airline: buildAirline(leg.airline, leg.flight_number, leg.airline_logo),
  };
}

/**
 * Transform a complete SerpApi flight result to our Flight model
 */
function transformSerpApiFlight(
  serpFlight: SerpApiFlight,
  index: number,
  baseDate: string
): Flight {
  const legs = serpFlight.flights;
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  // Get main airline (validating carrier)
  const mainAirline = buildAirline(
    firstLeg.airline,
    firstLeg.flight_number,
    serpFlight.airline_logo || firstLeg.airline_logo
  );

  // Transform all legs to segments
  const segments = legs.map((leg) => transformLegToSegment(leg, baseDate));

  // Calculate departure and arrival times
  const departureTime = parseTimeToISO(firstLeg.departure_airport.time || '00:00', baseDate);

  // For arrival, we need to handle overnight flights by checking total duration
  let arrivalDate = baseDate;
  const isOvernight = legs.some((leg) => leg.overnight) ||
    serpFlight.layovers?.some((l) => l.overnight);

  if (isOvernight) {
    const arrDate = new Date(baseDate);
    arrDate.setDate(arrDate.getDate() + 1);
    arrivalDate = arrDate.toISOString().split('T')[0];
  }
  const arrivalTime = parseTimeToISO(lastLeg.arrival_airport.time || '00:00', arrivalDate);

  // Get price - prefer the flight price, fallback to first booking option
  let price = serpFlight.price;
  if (!price && 'booking_options' in serpFlight) {
    const bookingFlight = serpFlight as SerpApiFlight & { booking_options?: Array<{ price: number }> };
    price = bookingFlight.booking_options?.[0]?.price;
  }

  return {
    id: generateFlightId(serpFlight, index),
    segments,
    airline: mainAirline,
    origin: buildAirport(firstLeg.departure_airport.id, firstLeg.departure_airport.name),
    destination: buildAirport(lastLeg.arrival_airport.id, lastLeg.arrival_airport.name),
    departureTime,
    arrivalTime,
    duration: serpFlight.total_duration,
    stops: legs.length - 1,
    price: {
      amount: price || 0,
      currency: 'EUR', // Default, will be set from search params
    },
    // SerpApi doesn't provide seat availability
    seatsLeft: undefined,
  };
}

// ===== ERROR PARSING =====

/**
 * Parse SerpApi errors into standardized format
 */
function parseSerpApiError(error: unknown): SerpApiError {
  // Handle HTTP response errors
  if (error instanceof Response || (error && typeof error === 'object' && 'status' in error)) {
    const status = (error as { status?: number }).status;

    if (status === 401 || status === 403) {
      return {
        type: 'INVALID_API_KEY',
        message: 'Invalid SerpApi API key. Please check your configuration.',
        retryable: false,
      };
    }

    if (status === 429) {
      return {
        type: 'RATE_LIMITED',
        message: 'API rate limit exceeded. Please wait a moment and try again.',
        retryable: true,
      };
    }

    if (status === 400) {
      return {
        type: 'INVALID_PARAMS',
        message: 'Invalid search parameters. Please check your input.',
        retryable: false,
      };
    }

    if (status && status >= 500) {
      return {
        type: 'NETWORK_ERROR',
        message: 'SerpApi service is temporarily unavailable. Please try again.',
        retryable: true,
      };
    }
  }

  // Handle JSON error response
  if (error && typeof error === 'object' && 'error' in error) {
    const errorMsg = String((error as { error: unknown }).error);

    if (errorMsg.toLowerCase().includes('api key') || errorMsg.toLowerCase().includes('api_key')) {
      return {
        type: 'INVALID_API_KEY',
        message: 'Invalid SerpApi API key. Please check your configuration.',
        retryable: false,
      };
    }

    if (errorMsg.toLowerCase().includes('limit') || errorMsg.toLowerCase().includes('quota')) {
      return {
        type: 'RATE_LIMITED',
        message: 'API usage limit reached. Please try again later.',
        retryable: true,
      };
    }

    return {
      type: 'UNKNOWN',
      message: errorMsg || 'An unexpected error occurred.',
      retryable: true,
    };
  }

  // Handle network errors
  if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Unable to connect to the flight search service. Please check your internet connection.',
      retryable: true,
    };
  }

  // Default error
  return {
    type: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    retryable: true,
  };
}

// ===== SERPAPI ADAPTER CLASS =====

/**
 * SerpApi adapter implementing the FlightSearchProvider interface.
 *
 * This class handles:
 * - Building API requests to SerpApi
 * - Transforming responses to our internal Flight model
 * - Error handling and standardization
 *
 * @example
 * ```typescript
 * const adapter = new SerpApiAdapter({ apiKey: 'your-api-key' });
 * const result = await adapter.searchFlights({
 *   origin: 'MAD',
 *   destination: 'BCN',
 *   departureDate: '2024-03-15',
 *   passengers: 1
 * });
 * ```
 */
export class SerpApiAdapter implements FlightSearchProvider {
  readonly providerName = 'serpapi';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxResults: number;
  private readonly currency: string;
  private readonly language: string;
  private readonly country: string;

  constructor(config?: Partial<ProviderConfig>) {
    this.apiKey = config?.apiKey || process.env.SERPAPI_API_KEY || '';
    this.baseUrl = config?.baseUrl || SERPAPI_BASE_URL;
    this.timeout = config?.timeout || DEFAULT_TIMEOUT;
    this.maxResults = config?.maxResults || DEFAULT_MAX_RESULTS;
    this.currency = config?.currency || 'EUR';
    this.language = config?.language || 'en';
    this.country = config?.country || 'es'; // Spain as default for this EU-focused app
  }

  /**
   * Check if the adapter is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  /**
   * Parse errors into standardized format
   */
  parseError(error: unknown): FlightSearchError {
    const serpError = parseSerpApiError(error);
    return {
      type: serpError.type as FlightSearchError['type'],
      message: serpError.message,
      retryable: serpError.retryable,
      originalError: error,
    };
  }

  /**
   * Build the SerpApi request URL with all parameters
   */
  private buildRequestUrl(params: SearchParams): string {
    const searchParams = new URLSearchParams({
      engine: 'google_flights',
      api_key: this.apiKey,
      departure_id: params.origin.toUpperCase(),
      arrival_id: params.destination.toUpperCase(),
      outbound_date: params.departureDate,
      adults: String(params.passengers || 1),
      currency: this.currency,
      hl: this.language,
      gl: this.country,
      type: params.returnDate ? '1' : '2', // 1 = round trip, 2 = one way
    });

    if (params.returnDate) {
      searchParams.set('return_date', params.returnDate);
    }

    // Map cabin class to SerpApi format
    if (params.cabinClass) {
      const cabinMap: Record<string, string> = {
        economy: '1',
        business: '3',
        first: '4',
      };
      searchParams.set('travel_class', cabinMap[params.cabinClass] || '1');
    }

    return `${this.baseUrl}?${searchParams.toString()}`;
  }

  /**
   * Search for flights using SerpApi
   */
  async searchFlights(params: SearchParams): Promise<FlightSearchResult> {
    if (!this.isConfigured()) {
      throw this.parseError({
        error: 'SerpApi API key not configured. Please set SERPAPI_API_KEY environment variable.',
      });
    }

    const url = this.buildRequestUrl(params);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw { status: response.status, ...errorBody };
      }

      const data: SerpApiFlightsResponse = await response.json();

      // Check for API-level errors
      if (data.error) {
        throw { error: data.error };
      }

      // Combine best_flights and other_flights
      const allFlights: SerpApiFlight[] = [
        ...(data.best_flights || []),
        ...(data.other_flights || []),
      ];

      // If no flights found, return empty result (not an error)
      if (allFlights.length === 0) {
        return {
          flights: [],
          metadata: {
            totalResults: 0,
            searchId: data.search_metadata?.id,
            cached: false,
          },
        };
      }

      // Transform all flights to our model
      const flights = allFlights
        .slice(0, this.maxResults)
        .map((flight, index) => {
          const transformed = transformSerpApiFlight(flight, index, params.departureDate);
          // Override currency with our configured currency
          transformed.price.currency = this.currency;
          return transformed;
        })
        // Filter out flights with no price (invalid data)
        .filter((flight) => flight.price.amount > 0);

      // Build metadata with price insights if available
      const metadata: FlightSearchResult['metadata'] = {
        totalResults: allFlights.length,
        searchId: data.search_metadata?.id,
        cached: false,
      };

      if (data.price_insights) {
        metadata.priceInsights = {
          lowestPrice: data.price_insights.lowest_price,
          priceLevel: data.price_insights.price_level,
          typicalPriceRange: data.price_insights.typical_price_range,
        };
      }

      return { flights, metadata };
    } catch (error) {
      // Re-throw if already a FlightSearchError
      if (error && typeof error === 'object' && 'type' in error && 'retryable' in error) {
        throw error;
      }

      // Handle abort error (timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw this.parseError({
          error: 'Request timeout. The flight search took too long.',
        });
      }

      throw this.parseError(error);
    }
  }
}

// ===== SINGLETON INSTANCE =====

let serpApiInstance: SerpApiAdapter | null = null;

/**
 * Get or create a singleton SerpApiAdapter instance
 */
export function getSerpApiAdapter(config?: Partial<ProviderConfig>): SerpApiAdapter {
  if (!serpApiInstance || config) {
    serpApiInstance = new SerpApiAdapter(config);
  }
  return serpApiInstance;
}

// ===== PROVIDER REGISTRATION =====

// Register SerpApi as a provider
registerProvider('serpapi', (config) => new SerpApiAdapter(config));

// ===== CONVENIENCE EXPORTS =====

export { parseSerpApiError };
export type { SerpApiError, SerpApiErrorType };
