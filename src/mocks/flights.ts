import { Flight, SearchParams, PriceDataPoint } from '@/types/flight';
import { AIRLINES, AIRPORTS } from '@/lib/constants';

const getAirport = (code: string) => {
  return AIRPORTS.find((a) => a.code === code) || AIRPORTS[0];
};

// Generate realistic flight times
function generateFlightTime(baseDate: string, hour: number, minute: number): string {
  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function addMinutes(isoString: string, minutes: number): string {
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

// Mock flights database
export function generateMockFlights(params: SearchParams): Flight[] {
  const { origin, destination, departureDate } = params;
  
  const originAirport = getAirport(origin);
  const destAirport = getAirport(destination);
  
  // Base duration based on common routes (simplified)
  const baseDuration = 120; // 2 hours base
  
  const flights: Flight[] = [
    // Non-stop flights
    {
      id: 'FL001',
      airline: AIRLINES.IB,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 6, 30),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 6, 30), baseDuration),
      duration: baseDuration,
      stops: 0,
      price: { amount: 89, currency: 'EUR' },
      seatsLeft: 4,
      segments: [],
    },
    {
      id: 'FL002',
      airline: AIRLINES.VY,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 8, 15),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 8, 15), baseDuration + 10),
      duration: baseDuration + 10,
      stops: 0,
      price: { amount: 45, currency: 'EUR' },
      seatsLeft: 12,
      segments: [],
    },
    {
      id: 'FL003',
      airline: AIRLINES.FR,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 10, 45),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 10, 45), baseDuration + 5),
      duration: baseDuration + 5,
      stops: 0,
      price: { amount: 35, currency: 'EUR' },
      seatsLeft: 2,
      segments: [],
    },
    {
      id: 'FL004',
      airline: AIRLINES.U2,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 14, 20),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 14, 20), baseDuration + 15),
      duration: baseDuration + 15,
      stops: 0,
      price: { amount: 52, currency: 'EUR' },
      seatsLeft: 8,
      segments: [],
    },
    {
      id: 'FL005',
      airline: AIRLINES.LH,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 16, 0),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 16, 0), baseDuration),
      duration: baseDuration,
      stops: 0,
      price: { amount: 125, currency: 'EUR' },
      seatsLeft: 15,
      segments: [],
    },
    {
      id: 'FL006',
      airline: AIRLINES.AF,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 18, 30),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 18, 30), baseDuration + 20),
      duration: baseDuration + 20,
      stops: 0,
      price: { amount: 98, currency: 'EUR' },
      seatsLeft: 6,
      segments: [],
    },
    {
      id: 'FL007',
      airline: AIRLINES.BA,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 20, 45),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 20, 45), baseDuration + 10),
      duration: baseDuration + 10,
      stops: 0,
      price: { amount: 142, currency: 'EUR' },
      seatsLeft: 3,
      segments: [],
    },
    // 1-stop flights
    {
      id: 'FL008',
      airline: AIRLINES.KL,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 7, 0),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 7, 0), baseDuration + 180),
      duration: baseDuration + 180,
      stops: 1,
      price: { amount: 78, currency: 'EUR' },
      seatsLeft: 9,
      segments: [],
    },
    {
      id: 'FL009',
      airline: AIRLINES.AZ,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 9, 30),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 9, 30), baseDuration + 150),
      duration: baseDuration + 150,
      stops: 1,
      price: { amount: 65, currency: 'EUR' },
      seatsLeft: 5,
      segments: [],
    },
    {
      id: 'FL010',
      airline: AIRLINES.UX,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 11, 15),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 11, 15), baseDuration + 120),
      duration: baseDuration + 120,
      stops: 1,
      price: { amount: 72, currency: 'EUR' },
      seatsLeft: 11,
      segments: [],
    },
    {
      id: 'FL011',
      airline: AIRLINES.LH,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 13, 45),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 13, 45), baseDuration + 200),
      duration: baseDuration + 200,
      stops: 1,
      price: { amount: 95, currency: 'EUR' },
      seatsLeft: 7,
      segments: [],
    },
    {
      id: 'FL012',
      airline: AIRLINES.AF,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 15, 30),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 15, 30), baseDuration + 165),
      duration: baseDuration + 165,
      stops: 1,
      price: { amount: 82, currency: 'EUR' },
      seatsLeft: 4,
      segments: [],
    },
    // 2-stop flights
    {
      id: 'FL013',
      airline: AIRLINES.IB,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 5, 45),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 5, 45), baseDuration + 360),
      duration: baseDuration + 360,
      stops: 2,
      price: { amount: 55, currency: 'EUR' },
      seatsLeft: 14,
      segments: [],
    },
    {
      id: 'FL014',
      airline: AIRLINES.KL,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 8, 0),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 8, 0), baseDuration + 420),
      duration: baseDuration + 420,
      stops: 2,
      price: { amount: 48, currency: 'EUR' },
      seatsLeft: 10,
      segments: [],
    },
    {
      id: 'FL015',
      airline: AIRLINES.BA,
      origin: originAirport,
      destination: destAirport,
      departureTime: generateFlightTime(departureDate, 12, 30),
      arrivalTime: addMinutes(generateFlightTime(departureDate, 12, 30), baseDuration + 300),
      duration: baseDuration + 300,
      stops: 2,
      price: { amount: 62, currency: 'EUR' },
      seatsLeft: 6,
      segments: [],
    },
  ];
  
  return flights;
}

// Generate price graph data for a date range
export function generatePriceGraphData(
  origin: string,
  destination: string,
  startDate: string,
  days: number = 30
): PriceDataPoint[] {
  const data: PriceDataPoint[] = [];
  const baseDate = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);
    
    // Generate realistic price variation
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const basePrice = 60 + Math.random() * 40;
    const weekendMultiplier = isWeekend ? 1.3 : 1;
    const randomVariation = 0.8 + Math.random() * 0.4;
    
    const price = Math.round(basePrice * weekendMultiplier * randomVariation);
    const flightCount = Math.floor(8 + Math.random() * 8);
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      price,
      flightCount,
    });
  }
  
  return data;
}

// Simulated API call with delay
export async function fetchMockFlights(params: SearchParams): Promise<Flight[]> {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
  return generateMockFlights(params);
}

export async function fetchMockPriceGraph(
  origin: string,
  destination: string,
  startDate: string
): Promise<PriceDataPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return generatePriceGraphData(origin, destination, startDate);
}
