import { NextRequest, NextResponse } from 'next/server';
import { Airport } from '@/types/flight';

/**
 * Comprehensive airport database
 * This data is served via API to maintain the API-first pattern.
 * In production, this could be backed by a database or external API.
 */
const AIRPORTS_DATABASE: Airport[] = [
  // Spain
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid-Barajas', country: 'Spain' },
  { code: 'BCN', city: 'Barcelona', name: 'Barcelona-El Prat', country: 'Spain' },
  { code: 'AGP', city: 'Málaga', name: 'Málaga-Costa del Sol', country: 'Spain' },
  { code: 'PMI', city: 'Palma de Mallorca', name: 'Palma de Mallorca Airport', country: 'Spain' },
  { code: 'ALC', city: 'Alicante', name: 'Alicante-Elche Airport', country: 'Spain' },
  { code: 'VLC', city: 'Valencia', name: 'Valencia Airport', country: 'Spain' },
  { code: 'SVQ', city: 'Seville', name: 'Seville Airport', country: 'Spain' },
  { code: 'BIO', city: 'Bilbao', name: 'Bilbao Airport', country: 'Spain' },
  { code: 'IBZ', city: 'Ibiza', name: 'Ibiza Airport', country: 'Spain' },
  { code: 'TFS', city: 'Tenerife', name: 'Tenerife South Airport', country: 'Spain' },
  { code: 'LPA', city: 'Gran Canaria', name: 'Gran Canaria Airport', country: 'Spain' },
  { code: 'MAH', city: 'Menorca', name: 'Menorca Airport', country: 'Spain' },
  
  // United Kingdom
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'United Kingdom' },
  { code: 'LGW', city: 'London', name: 'Gatwick Airport', country: 'United Kingdom' },
  { code: 'STN', city: 'London', name: 'Stansted Airport', country: 'United Kingdom' },
  { code: 'LTN', city: 'London', name: 'Luton Airport', country: 'United Kingdom' },
  { code: 'MAN', city: 'Manchester', name: 'Manchester Airport', country: 'United Kingdom' },
  { code: 'EDI', city: 'Edinburgh', name: 'Edinburgh Airport', country: 'United Kingdom' },
  { code: 'BHX', city: 'Birmingham', name: 'Birmingham Airport', country: 'United Kingdom' },
  { code: 'GLA', city: 'Glasgow', name: 'Glasgow Airport', country: 'United Kingdom' },
  { code: 'BRS', city: 'Bristol', name: 'Bristol Airport', country: 'United Kingdom' },
  
  // France
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
  { code: 'ORY', city: 'Paris', name: 'Orly Airport', country: 'France' },
  { code: 'NCE', city: 'Nice', name: 'Nice Côte d\'Azur Airport', country: 'France' },
  { code: 'LYS', city: 'Lyon', name: 'Lyon-Saint Exupéry Airport', country: 'France' },
  { code: 'MRS', city: 'Marseille', name: 'Marseille Provence Airport', country: 'France' },
  { code: 'TLS', city: 'Toulouse', name: 'Toulouse-Blagnac Airport', country: 'France' },
  { code: 'BOD', city: 'Bordeaux', name: 'Bordeaux-Mérignac Airport', country: 'France' },
  
  // Germany
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  { code: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany' },
  { code: 'BER', city: 'Berlin', name: 'Berlin Brandenburg Airport', country: 'Germany' },
  { code: 'DUS', city: 'Düsseldorf', name: 'Düsseldorf Airport', country: 'Germany' },
  { code: 'HAM', city: 'Hamburg', name: 'Hamburg Airport', country: 'Germany' },
  { code: 'STR', city: 'Stuttgart', name: 'Stuttgart Airport', country: 'Germany' },
  { code: 'CGN', city: 'Cologne', name: 'Cologne Bonn Airport', country: 'Germany' },
  
  // Italy
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci-Fiumicino Airport', country: 'Italy' },
  { code: 'MXP', city: 'Milan', name: 'Milan Malpensa Airport', country: 'Italy' },
  { code: 'LIN', city: 'Milan', name: 'Milan Linate Airport', country: 'Italy' },
  { code: 'VCE', city: 'Venice', name: 'Venice Marco Polo Airport', country: 'Italy' },
  { code: 'NAP', city: 'Naples', name: 'Naples International Airport', country: 'Italy' },
  { code: 'BGY', city: 'Bergamo', name: 'Milan Bergamo Airport', country: 'Italy' },
  { code: 'BLQ', city: 'Bologna', name: 'Bologna Guglielmo Marconi Airport', country: 'Italy' },
  { code: 'FLR', city: 'Florence', name: 'Florence Airport', country: 'Italy' },
  { code: 'CTA', city: 'Catania', name: 'Catania-Fontanarossa Airport', country: 'Italy' },
  { code: 'PMO', city: 'Palermo', name: 'Palermo Airport', country: 'Italy' },
  
  // Netherlands
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Schiphol Airport', country: 'Netherlands' },
  { code: 'EIN', city: 'Eindhoven', name: 'Eindhoven Airport', country: 'Netherlands' },
  { code: 'RTM', city: 'Rotterdam', name: 'Rotterdam The Hague Airport', country: 'Netherlands' },
  
  // Belgium
  { code: 'BRU', city: 'Brussels', name: 'Brussels Airport', country: 'Belgium' },
  { code: 'CRL', city: 'Charleroi', name: 'Brussels South Charleroi Airport', country: 'Belgium' },
  
  // Portugal
  { code: 'LIS', city: 'Lisbon', name: 'Lisbon Humberto Delgado Airport', country: 'Portugal' },
  { code: 'OPO', city: 'Porto', name: 'Porto Francisco Sá Carneiro Airport', country: 'Portugal' },
  { code: 'FAO', city: 'Faro', name: 'Faro Airport', country: 'Portugal' },
  { code: 'FNC', city: 'Funchal', name: 'Madeira Airport', country: 'Portugal' },
  
  // Switzerland
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
  { code: 'GVA', city: 'Geneva', name: 'Geneva Airport', country: 'Switzerland' },
  { code: 'BSL', city: 'Basel', name: 'EuroAirport Basel-Mulhouse-Freiburg', country: 'Switzerland' },
  
  // Austria
  { code: 'VIE', city: 'Vienna', name: 'Vienna International Airport', country: 'Austria' },
  { code: 'SZG', city: 'Salzburg', name: 'Salzburg Airport', country: 'Austria' },
  { code: 'INN', city: 'Innsbruck', name: 'Innsbruck Airport', country: 'Austria' },
  
  // Scandinavia
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen Airport', country: 'Denmark' },
  { code: 'OSL', city: 'Oslo', name: 'Oslo Gardermoen Airport', country: 'Norway' },
  { code: 'BGO', city: 'Bergen', name: 'Bergen Airport', country: 'Norway' },
  { code: 'ARN', city: 'Stockholm', name: 'Stockholm Arlanda Airport', country: 'Sweden' },
  { code: 'GOT', city: 'Gothenburg', name: 'Gothenburg Landvetter Airport', country: 'Sweden' },
  { code: 'HEL', city: 'Helsinki', name: 'Helsinki-Vantaa Airport', country: 'Finland' },
  
  // Ireland
  { code: 'DUB', city: 'Dublin', name: 'Dublin Airport', country: 'Ireland' },
  { code: 'SNN', city: 'Shannon', name: 'Shannon Airport', country: 'Ireland' },
  { code: 'ORK', city: 'Cork', name: 'Cork Airport', country: 'Ireland' },
  
  // Eastern Europe
  { code: 'WAW', city: 'Warsaw', name: 'Warsaw Chopin Airport', country: 'Poland' },
  { code: 'KRK', city: 'Krakow', name: 'Krakow John Paul II Airport', country: 'Poland' },
  { code: 'PRG', city: 'Prague', name: 'Václav Havel Airport Prague', country: 'Czech Republic' },
  { code: 'BUD', city: 'Budapest', name: 'Budapest Ferenc Liszt Airport', country: 'Hungary' },
  { code: 'OTP', city: 'Bucharest', name: 'Henri Coandă International Airport', country: 'Romania' },
  { code: 'SOF', city: 'Sofia', name: 'Sofia Airport', country: 'Bulgaria' },
  
  // Greece
  { code: 'ATH', city: 'Athens', name: 'Athens International Airport', country: 'Greece' },
  { code: 'SKG', city: 'Thessaloniki', name: 'Thessaloniki Airport', country: 'Greece' },
  { code: 'HER', city: 'Heraklion', name: 'Heraklion International Airport', country: 'Greece' },
  { code: 'RHO', city: 'Rhodes', name: 'Rhodes International Airport', country: 'Greece' },
  { code: 'CFU', city: 'Corfu', name: 'Corfu International Airport', country: 'Greece' },
  { code: 'JMK', city: 'Mykonos', name: 'Mykonos Airport', country: 'Greece' },
  { code: 'JTR', city: 'Santorini', name: 'Santorini Airport', country: 'Greece' },
  
  // Turkey
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },
  { code: 'SAW', city: 'Istanbul', name: 'Sabiha Gökçen Airport', country: 'Turkey' },
  { code: 'AYT', city: 'Antalya', name: 'Antalya Airport', country: 'Turkey' },
  { code: 'ADB', city: 'Izmir', name: 'Izmir Adnan Menderes Airport', country: 'Turkey' },
  
  // Middle East & Gulf
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'United Arab Emirates' },
  { code: 'AUH', city: 'Abu Dhabi', name: 'Abu Dhabi International Airport', country: 'United Arab Emirates' },
  { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Qatar' },
  { code: 'TLV', city: 'Tel Aviv', name: 'Ben Gurion Airport', country: 'Israel' },
  { code: 'AMM', city: 'Amman', name: 'Queen Alia International Airport', country: 'Jordan' },
  
  // North America
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'United States' },
  { code: 'EWR', city: 'Newark', name: 'Newark Liberty International Airport', country: 'United States' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'United States' },
  { code: 'ORD', city: 'Chicago', name: 'O\'Hare International Airport', country: 'United States' },
  { code: 'MIA', city: 'Miami', name: 'Miami International Airport', country: 'United States' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'United States' },
  { code: 'BOS', city: 'Boston', name: 'Boston Logan International Airport', country: 'United States' },
  { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International Airport', country: 'United States' },
  { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International Airport', country: 'United States' },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International Airport', country: 'United States' },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', country: 'Canada' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', country: 'Canada' },
  { code: 'YUL', city: 'Montreal', name: 'Montréal-Trudeau International Airport', country: 'Canada' },
  { code: 'MEX', city: 'Mexico City', name: 'Mexico City International Airport', country: 'Mexico' },
  { code: 'CUN', city: 'Cancún', name: 'Cancún International Airport', country: 'Mexico' },
  
  // South America
  { code: 'GRU', city: 'São Paulo', name: 'São Paulo-Guarulhos International Airport', country: 'Brazil' },
  { code: 'GIG', city: 'Rio de Janeiro', name: 'Rio de Janeiro-Galeão International Airport', country: 'Brazil' },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ministro Pistarini International Airport', country: 'Argentina' },
  { code: 'SCL', city: 'Santiago', name: 'Arturo Merino Benítez International Airport', country: 'Chile' },
  { code: 'BOG', city: 'Bogotá', name: 'El Dorado International Airport', country: 'Colombia' },
  { code: 'LIM', city: 'Lima', name: 'Jorge Chávez International Airport', country: 'Peru' },
  
  // Asia
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'Japan' },
  { code: 'HND', city: 'Tokyo', name: 'Tokyo Haneda Airport', country: 'Japan' },
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International Airport', country: 'China' },
  { code: 'PVG', city: 'Shanghai', name: 'Shanghai Pudong International Airport', country: 'China' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong' },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport', country: 'Malaysia' },
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport', country: 'India' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India' },
  
  // Africa
  { code: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo International Airport', country: 'South Africa' },
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town International Airport', country: 'South Africa' },
  { code: 'CAI', city: 'Cairo', name: 'Cairo International Airport', country: 'Egypt' },
  { code: 'CMN', city: 'Casablanca', name: 'Mohammed V International Airport', country: 'Morocco' },
  { code: 'RAK', city: 'Marrakech', name: 'Marrakech Menara Airport', country: 'Morocco' },
  { code: 'TUN', city: 'Tunis', name: 'Tunis-Carthage International Airport', country: 'Tunisia' },
  
  // Oceania
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport', country: 'Australia' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia' },
  { code: 'BNE', city: 'Brisbane', name: 'Brisbane Airport', country: 'Australia' },
  { code: 'AKL', city: 'Auckland', name: 'Auckland Airport', country: 'New Zealand' },
];

// Popular airports for suggestions when no query
const POPULAR_CODES = ['MAD', 'BCN', 'LHR', 'CDG', 'FCO', 'AMS', 'FRA', 'MUC', 'LIS', 'DXB', 'JFK', 'LAX'];

/**
 * Search airports by query
 */
function searchAirports(query: string, excludeCode?: string, limit: number = 10): Airport[] {
  const lowerQuery = query.toLowerCase().trim();
  
  let results = AIRPORTS_DATABASE.filter((airport) => {
    // Exclude specified airport
    if (excludeCode && airport.code === excludeCode) return false;
    
    // Match against code, city, name, or country
    return (
      airport.code.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.country.toLowerCase().includes(lowerQuery)
    );
  });
  
  // Sort by relevance: exact code match first, then city starts with, then rest
  results.sort((a, b) => {
    // Exact code match
    if (a.code.toLowerCase() === lowerQuery) return -1;
    if (b.code.toLowerCase() === lowerQuery) return 1;
    
    // City starts with query
    const aStartsWithCity = a.city.toLowerCase().startsWith(lowerQuery);
    const bStartsWithCity = b.city.toLowerCase().startsWith(lowerQuery);
    if (aStartsWithCity && !bStartsWithCity) return -1;
    if (bStartsWithCity && !aStartsWithCity) return 1;
    
    // Code starts with query
    const aStartsWithCode = a.code.toLowerCase().startsWith(lowerQuery);
    const bStartsWithCode = b.code.toLowerCase().startsWith(lowerQuery);
    if (aStartsWithCode && !bStartsWithCode) return -1;
    if (bStartsWithCode && !aStartsWithCode) return 1;
    
    return 0;
  });
  
  return results.slice(0, limit);
}

/**
 * Get popular airports
 */
function getPopularAirports(excludeCode?: string, limit: number = 6): Airport[] {
  return AIRPORTS_DATABASE
    .filter((airport) => 
      POPULAR_CODES.includes(airport.code) && 
      airport.code !== excludeCode
    )
    .slice(0, limit);
}

/**
 * Get airport by code
 */
function getAirportByCode(code: string): Airport | null {
  return AIRPORTS_DATABASE.find((airport) => 
    airport.code.toUpperCase() === code.toUpperCase()
  ) || null;
}

// ===== API ROUTE HANDLER =====

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const query = searchParams.get('q') || searchParams.get('query') || '';
  const code = searchParams.get('code');
  const excludeCode = searchParams.get('exclude');
  const popular = searchParams.get('popular') === 'true';
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  // Get airport by code
  if (code) {
    const airport = getAirportByCode(code);
    if (airport) {
      return NextResponse.json({ data: airport });
    }
    return NextResponse.json(
      { error: 'Airport not found', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }
  
  // Get popular airports
  if (popular || query.length === 0) {
    const airports = getPopularAirports(excludeCode || undefined, limit);
    return NextResponse.json({
      data: airports,
      type: 'popular',
      count: airports.length,
    });
  }
  
  // Search airports
  if (query.length < 2) {
    return NextResponse.json({
      data: [],
      type: 'search',
      count: 0,
      message: 'Query must be at least 2 characters',
    });
  }
  
  const airports = searchAirports(query, excludeCode || undefined, limit);
  
  return NextResponse.json({
    data: airports,
    type: 'search',
    query,
    count: airports.length,
  });
}
