import Amadeus from 'amadeus';
import { Flight, FlightSegment, Airport, Airline, SearchParams } from '@/types/flight';

// Amadeus API response types
interface AmadeusSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft?: {
    code: string;
  };
  duration: string;
  numberOfStops: number;
}

interface AmadeusItinerary {
  duration: string;
  segments: AmadeusSegment[];
}

interface AmadeusTravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
  };
}

interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats?: number;
  itineraries: AmadeusItinerary[];
  price: {
    currency: string;
    total: string;
    base: string;
    fees?: Array<{ amount: string; type: string }>;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: AmadeusTravelerPricing[];
}

interface AmadeusDictionaries {
  carriers: Record<string, string>;
  aircraft: Record<string, string>;
  currencies: Record<string, string>;
  locations: Record<string, { cityCode: string; countryCode: string }>;
}

interface AmadeusResponse {
  data: AmadeusFlightOffer[];
  dictionaries: AmadeusDictionaries;
}

// Airline logos mapping (for common airlines)
const AIRLINE_LOGOS: Record<string, string> = {
  IB: '/airlines/iberia.svg',
  VY: '/airlines/vueling.svg',
  FR: '/airlines/ryanair.svg',
  U2: '/airlines/easyjet.svg',
  LH: '/airlines/lufthansa.svg',
  AF: '/airlines/airfrance.svg',
  BA: '/airlines/british.svg',
  KL: '/airlines/klm.svg',
  AZ: '/airlines/ita.svg',
  UX: '/airlines/aireuropa.svg',
};

// City names for common airports
const CITY_NAMES: Record<string, { city: string; name: string; country: string }> = {
  MAD: { city: 'Madrid', name: 'Adolfo Suárez Madrid-Barajas', country: 'Spain' },
  BCN: { city: 'Barcelona', name: 'El Prat', country: 'Spain' },
  LHR: { city: 'London', name: 'Heathrow', country: 'UK' },
  CDG: { city: 'Paris', name: 'Charles de Gaulle', country: 'France' },
  FCO: { city: 'Rome', name: 'Fiumicino', country: 'Italy' },
  AMS: { city: 'Amsterdam', name: 'Schiphol', country: 'Netherlands' },
  FRA: { city: 'Frankfurt', name: 'Frankfurt', country: 'Germany' },
  MUC: { city: 'Munich', name: 'Munich', country: 'Germany' },
  LIS: { city: 'Lisbon', name: 'Portela', country: 'Portugal' },
  VIE: { city: 'Vienna', name: 'Vienna', country: 'Austria' },
  ZRH: { city: 'Zurich', name: 'Zurich', country: 'Switzerland' },
  BRU: { city: 'Brussels', name: 'Brussels', country: 'Belgium' },
  CPH: { city: 'Copenhagen', name: 'Copenhagen', country: 'Denmark' },
  OSL: { city: 'Oslo', name: 'Gardermoen', country: 'Norway' },
  ARN: { city: 'Stockholm', name: 'Arlanda', country: 'Sweden' },
  HEL: { city: 'Helsinki', name: 'Helsinki', country: 'Finland' },
  DUB: { city: 'Dublin', name: 'Dublin', country: 'Ireland' },
  ATH: { city: 'Athens', name: 'Eleftherios Venizelos', country: 'Greece' },
  PRG: { city: 'Prague', name: 'Václav Havel', country: 'Czech Republic' },
  WAW: { city: 'Warsaw', name: 'Chopin', country: 'Poland' },
  BUD: { city: 'Budapest', name: 'Ferenc Liszt', country: 'Hungary' },
  MXP: { city: 'Milan', name: 'Malpensa', country: 'Italy' },
  VCE: { city: 'Venice', name: 'Marco Polo', country: 'Italy' },
  NAP: { city: 'Naples', name: 'Capodichino', country: 'Italy' },
  PMI: { city: 'Palma', name: 'Palma de Mallorca', country: 'Spain' },
  AGP: { city: 'Málaga', name: 'Costa del Sol', country: 'Spain' },
  SVQ: { city: 'Seville', name: 'San Pablo', country: 'Spain' },
  VLC: { city: 'Valencia', name: 'Valencia', country: 'Spain' },
  BIO: { city: 'Bilbao', name: 'Bilbao', country: 'Spain' },
  NCE: { city: 'Nice', name: 'Côte d\'Azur', country: 'France' },
  LYS: { city: 'Lyon', name: 'Saint-Exupéry', country: 'France' },
  MRS: { city: 'Marseille', name: 'Provence', country: 'France' },
  GVA: { city: 'Geneva', name: 'Geneva', country: 'Switzerland' },
  EDI: { city: 'Edinburgh', name: 'Edinburgh', country: 'UK' },
  MAN: { city: 'Manchester', name: 'Manchester', country: 'UK' },
};

// Create Amadeus client singleton
let amadeusClient: Amadeus | null = null;

function getAmadeusClient(): Amadeus {
  if (!amadeusClient) {
    const clientId = process.env.AMADEUS_API_KEY;
    const clientSecret = process.env.AMADEUS_API_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Amadeus API credentials not configured');
    }

    amadeusClient = new Amadeus({
      clientId,
      clientSecret,
      hostname: process.env.AMADEUS_ENVIRONMENT === 'production' ? 'production' : 'test',
    });
  }
  return amadeusClient;
}

// Parse ISO 8601 duration (PT2H30M) to minutes
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  return hours * 60 + minutes;
}

// Get airport info
function getAirport(code: string): Airport {
  const info = CITY_NAMES[code];
  return {
    code,
    city: info?.city || code,
    name: info?.name || code,
    country: info?.country || '',
  };
}

// Get airline info
function getAirline(code: string, dictionaries?: AmadeusDictionaries): Airline {
  const name = dictionaries?.carriers?.[code] || code;
  return {
    code,
    name,
    logo: AIRLINE_LOGOS[code],
  };
}

// Transform Amadeus segment to our FlightSegment
function transformSegment(
  segment: AmadeusSegment,
  dictionaries?: AmadeusDictionaries
): FlightSegment {
  return {
    departure: {
      airport: getAirport(segment.departure.iataCode),
      time: segment.departure.at,
    },
    arrival: {
      airport: getAirport(segment.arrival.iataCode),
      time: segment.arrival.at,
    },
    duration: parseDuration(segment.duration),
    flightNumber: `${segment.carrierCode}${segment.number}`,
    airline: getAirline(segment.carrierCode, dictionaries),
  };
}

// Transform Amadeus offer to our Flight type
function transformFlightOffer(
  offer: AmadeusFlightOffer,
  dictionaries?: AmadeusDictionaries
): Flight {
  const itinerary = offer.itineraries[0];
  const segments = itinerary.segments;
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const mainCarrier = offer.validatingAirlineCodes[0] || firstSegment.carrierCode;

  return {
    id: offer.id,
    segments: segments.map((seg) => transformSegment(seg, dictionaries)),
    airline: getAirline(mainCarrier, dictionaries),
    origin: getAirport(firstSegment.departure.iataCode),
    destination: getAirport(lastSegment.arrival.iataCode),
    departureTime: firstSegment.departure.at,
    arrivalTime: lastSegment.arrival.at,
    duration: parseDuration(itinerary.duration),
    stops: segments.length - 1,
    price: {
      amount: parseFloat(offer.price.grandTotal),
      currency: offer.price.currency,
    },
    seatsLeft: offer.numberOfBookableSeats,
  };
}

// Search flights using Amadeus API
export async function searchFlights(params: SearchParams): Promise<Flight[]> {
  const amadeus = getAmadeusClient();

  const searchParams: Record<string, string | number> = {
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departureDate,
    adults: params.passengers || 1,
    currencyCode: 'EUR',
    max: 25, // Limit results for faster response
  };

  if (params.returnDate) {
    searchParams.returnDate = params.returnDate;
  }

  if (params.cabinClass) {
    const cabinMap: Record<string, string> = {
      economy: 'ECONOMY',
      business: 'BUSINESS',
      first: 'FIRST',
    };
    searchParams.travelClass = cabinMap[params.cabinClass];
  }

  try {
    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    const amadeusResponse = response as unknown as { data: AmadeusFlightOffer[]; result: AmadeusResponse };
    
    // The response structure from Amadeus SDK
    const offers = amadeusResponse.data || [];
    const dictionaries = amadeusResponse.result?.dictionaries;

    return offers.map((offer) => transformFlightOffer(offer, dictionaries));
  } catch (error) {
    console.error('Amadeus API error:', error);
    throw error;
  }
}

// Error types for better UX messaging
export type AmadeusErrorType = 
  | 'INVALID_CREDENTIALS'
  | 'RATE_LIMITED'
  | 'NO_FLIGHTS'
  | 'INVALID_PARAMS'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface AmadeusError {
  type: AmadeusErrorType;
  message: string;
  retryable: boolean;
}

export function parseAmadeusError(error: unknown): AmadeusError {
  const err = error as { response?: { statusCode?: number; result?: { errors?: Array<{ detail?: string; code?: number }> } } };
  
  if (err?.response?.statusCode === 401) {
    return {
      type: 'INVALID_CREDENTIALS',
      message: 'API credentials are invalid. Please check configuration.',
      retryable: false,
    };
  }

  if (err?.response?.statusCode === 429) {
    return {
      type: 'RATE_LIMITED',
      message: 'Too many requests. Please wait a moment and try again.',
      retryable: true,
    };
  }

  if (err?.response?.statusCode === 400) {
    const detail = err?.response?.result?.errors?.[0]?.detail || 'Invalid search parameters';
    return {
      type: 'INVALID_PARAMS',
      message: detail,
      retryable: false,
    };
  }

  if (err?.response?.statusCode === 500 || err?.response?.statusCode === 503) {
    return {
      type: 'NETWORK_ERROR',
      message: 'The flight search service is temporarily unavailable. Please try again.',
      retryable: true,
    };
  }

  // Network errors
  if (error instanceof Error && error.message.includes('fetch')) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Unable to connect to flight search. Please check your internet connection.',
      retryable: true,
    };
  }

  return {
    type: 'UNKNOWN',
    message: 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
}
