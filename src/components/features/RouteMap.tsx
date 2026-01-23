'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Flight } from '@/types/flight';
import { Card, Skeleton } from '@/components/ui';
import { Plane, Clock, MapPin } from 'lucide-react';
import { cn, formatDuration, formatTime } from '@/lib/utils';

// Small airline badge with logo for the map
function AirlineBadge({ airline, size = 20 }: { airline: { code: string; name: string; logo?: string }; size?: number }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    setHasError(false);
  }, [airline.logo]);
  
  const showFallback = !airline.logo || hasError;
  
  if (showFallback) {
    return (
      <div 
        className="rounded bg-white flex items-center justify-center text-xs font-bold text-neutral-900"
        style={{ width: size, height: size }}
      >
        {airline.code.charAt(0)}
      </div>
    );
  }
  
  return (
    <div 
      className="rounded bg-white overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Image
        src={airline.logo as string}
        alt={airline.name}
        width={size - 2}
        height={size - 2}
        className="object-contain"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}

// Coordinates for major airports worldwide
const AIRPORT_COORDS: Record<string, { lat: number; lng: number; city: string }> = {
  // Europe
  MAD: { lat: 40.4168, lng: -3.7038, city: 'Madrid' },
  BCN: { lat: 41.3851, lng: 2.1734, city: 'Barcelona' },
  LHR: { lat: 51.4700, lng: -0.4543, city: 'London' },
  LGW: { lat: 51.1537, lng: -0.1821, city: 'London Gatwick' },
  STN: { lat: 51.8850, lng: 0.2350, city: 'London Stansted' },
  LTN: { lat: 51.8747, lng: -0.3683, city: 'London Luton' },
  CDG: { lat: 49.0097, lng: 2.5479, city: 'Paris' },
  ORY: { lat: 48.7233, lng: 2.3794, city: 'Paris Orly' },
  FCO: { lat: 41.8003, lng: 12.2389, city: 'Rome' },
  AMS: { lat: 52.3105, lng: 4.7683, city: 'Amsterdam' },
  FRA: { lat: 50.0379, lng: 8.5622, city: 'Frankfurt' },
  MUC: { lat: 48.3537, lng: 11.7750, city: 'Munich' },
  LIS: { lat: 38.7742, lng: -9.1342, city: 'Lisbon' },
  OPO: { lat: 41.2481, lng: -8.6814, city: 'Porto' },
  ATH: { lat: 37.9364, lng: 23.9445, city: 'Athens' },
  VIE: { lat: 48.1103, lng: 16.5697, city: 'Vienna' },
  ZRH: { lat: 47.4647, lng: 8.5492, city: 'Zurich' },
  GVA: { lat: 46.2381, lng: 6.1090, city: 'Geneva' },
  BRU: { lat: 50.9010, lng: 4.4856, city: 'Brussels' },
  DUB: { lat: 53.4264, lng: -6.2499, city: 'Dublin' },
  CPH: { lat: 55.6180, lng: 12.6560, city: 'Copenhagen' },
  OSL: { lat: 60.1939, lng: 11.1004, city: 'Oslo' },
  ARN: { lat: 59.6498, lng: 17.9238, city: 'Stockholm' },
  HEL: { lat: 60.3172, lng: 24.9633, city: 'Helsinki' },
  WAW: { lat: 52.1657, lng: 20.9671, city: 'Warsaw' },
  PRG: { lat: 50.1008, lng: 14.2600, city: 'Prague' },
  MXP: { lat: 45.6306, lng: 8.7231, city: 'Milan Malpensa' },
  LIN: { lat: 45.4520, lng: 9.2767, city: 'Milan Linate' },
  BER: { lat: 52.3667, lng: 13.5033, city: 'Berlin' },
  HAM: { lat: 53.6304, lng: 10.0063, city: 'Hamburg' },
  PMI: { lat: 39.5517, lng: 2.7388, city: 'Palma de Mallorca' },
  AGP: { lat: 36.6749, lng: -4.4991, city: 'Malaga' },
  SVQ: { lat: 37.4180, lng: -5.8931, city: 'Seville' },
  VLC: { lat: 39.4893, lng: -0.4816, city: 'Valencia' },
  BIO: { lat: 43.3011, lng: -2.9106, city: 'Bilbao' },
  IST: { lat: 41.2619, lng: 28.7419, city: 'Istanbul' },
  SAW: { lat: 40.8986, lng: 29.3092, city: 'Istanbul Sabiha' },
  BUD: { lat: 47.4298, lng: 19.2611, city: 'Budapest' },
  OTP: { lat: 44.5722, lng: 26.1022, city: 'Bucharest' },
  SOF: { lat: 42.6967, lng: 23.4114, city: 'Sofia' },
  BEG: { lat: 44.8184, lng: 20.3091, city: 'Belgrade' },
  ZAG: { lat: 45.7429, lng: 16.0688, city: 'Zagreb' },
  NCE: { lat: 43.6584, lng: 7.2159, city: 'Nice' },
  NAP: { lat: 40.8860, lng: 14.2908, city: 'Naples' },
  VCE: { lat: 45.5053, lng: 12.3519, city: 'Venice' },
  EDI: { lat: 55.9501, lng: -3.3725, city: 'Edinburgh' },
  MAN: { lat: 53.3650, lng: -2.2728, city: 'Manchester' },
  
  // North America
  JFK: { lat: 40.6413, lng: -73.7781, city: 'New York JFK' },
  EWR: { lat: 40.6895, lng: -74.1745, city: 'Newark' },
  LGA: { lat: 40.7769, lng: -73.8740, city: 'New York LaGuardia' },
  LAX: { lat: 33.9416, lng: -118.4085, city: 'Los Angeles' },
  SFO: { lat: 37.6213, lng: -122.3790, city: 'San Francisco' },
  ORD: { lat: 41.9742, lng: -87.9073, city: 'Chicago' },
  MDW: { lat: 41.7868, lng: -87.7522, city: 'Chicago Midway' },
  MIA: { lat: 25.7959, lng: -80.2870, city: 'Miami' },
  ATL: { lat: 33.6407, lng: -84.4277, city: 'Atlanta' },
  DFW: { lat: 32.8998, lng: -97.0403, city: 'Dallas' },
  DEN: { lat: 39.8561, lng: -104.6737, city: 'Denver' },
  SEA: { lat: 47.4502, lng: -122.3088, city: 'Seattle' },
  BOS: { lat: 42.3656, lng: -71.0096, city: 'Boston' },
  IAD: { lat: 38.9531, lng: -77.4565, city: 'Washington Dulles' },
  DCA: { lat: 38.8512, lng: -77.0402, city: 'Washington Reagan' },
  PHL: { lat: 39.8729, lng: -75.2437, city: 'Philadelphia' },
  PHX: { lat: 33.4373, lng: -112.0078, city: 'Phoenix' },
  SAN: { lat: 32.7338, lng: -117.1933, city: 'San Diego' },
  LAS: { lat: 36.0840, lng: -115.1537, city: 'Las Vegas' },
  MSP: { lat: 44.8848, lng: -93.2223, city: 'Minneapolis' },
  DTW: { lat: 42.2162, lng: -83.3554, city: 'Detroit' },
  MCO: { lat: 28.4312, lng: -81.3081, city: 'Orlando' },
  TPA: { lat: 27.9755, lng: -82.5332, city: 'Tampa' },
  YYZ: { lat: 43.6777, lng: -79.6248, city: 'Toronto' },
  YVR: { lat: 49.1947, lng: -123.1790, city: 'Vancouver' },
  YUL: { lat: 45.4706, lng: -73.7408, city: 'Montreal' },
  MEX: { lat: 19.4361, lng: -99.0719, city: 'Mexico City' },
  CUN: { lat: 21.0365, lng: -86.8771, city: 'Cancun' },
  
  // South America
  GRU: { lat: -23.4356, lng: -46.4731, city: 'Sao Paulo' },
  GIG: { lat: -22.8100, lng: -43.2506, city: 'Rio de Janeiro' },
  EZE: { lat: -34.8222, lng: -58.5358, city: 'Buenos Aires' },
  SCL: { lat: -33.3930, lng: -70.7858, city: 'Santiago' },
  BOG: { lat: 4.7016, lng: -74.1469, city: 'Bogota' },
  LIM: { lat: -12.0219, lng: -77.1143, city: 'Lima' },
  
  // Asia
  HND: { lat: 35.5494, lng: 139.7798, city: 'Tokyo Haneda' },
  NRT: { lat: 35.7653, lng: 140.3856, city: 'Tokyo Narita' },
  PEK: { lat: 40.0799, lng: 116.6031, city: 'Beijing' },
  PKX: { lat: 39.5098, lng: 116.4107, city: 'Beijing Daxing' },
  PVG: { lat: 31.1443, lng: 121.8083, city: 'Shanghai Pudong' },
  HKG: { lat: 22.3080, lng: 113.9185, city: 'Hong Kong' },
  SIN: { lat: 1.3644, lng: 103.9915, city: 'Singapore' },
  BKK: { lat: 13.6900, lng: 100.7501, city: 'Bangkok' },
  ICN: { lat: 37.4602, lng: 126.4407, city: 'Seoul Incheon' },
  DEL: { lat: 28.5562, lng: 77.1000, city: 'Delhi' },
  BOM: { lat: 19.0896, lng: 72.8656, city: 'Mumbai' },
  DXB: { lat: 25.2532, lng: 55.3657, city: 'Dubai' },
  AUH: { lat: 24.4330, lng: 54.6511, city: 'Abu Dhabi' },
  DOH: { lat: 25.2609, lng: 51.6138, city: 'Doha' },
  KUL: { lat: 2.7456, lng: 101.7072, city: 'Kuala Lumpur' },
  TPE: { lat: 25.0797, lng: 121.2342, city: 'Taipei' },
  MNL: { lat: 14.5086, lng: 121.0198, city: 'Manila' },
  CGK: { lat: -6.1256, lng: 106.6559, city: 'Jakarta' },
  TLV: { lat: 32.0055, lng: 34.8854, city: 'Tel Aviv' },
  
  // Oceania
  SYD: { lat: -33.9399, lng: 151.1753, city: 'Sydney' },
  MEL: { lat: -37.6690, lng: 144.8410, city: 'Melbourne' },
  BNE: { lat: -27.3842, lng: 153.1175, city: 'Brisbane' },
  AKL: { lat: -37.0082, lng: 174.7850, city: 'Auckland' },
  PER: { lat: -31.9403, lng: 115.9672, city: 'Perth' },
  
  // Africa
  JNB: { lat: -26.1367, lng: 28.2411, city: 'Johannesburg' },
  CPT: { lat: -33.9715, lng: 18.6021, city: 'Cape Town' },
  CAI: { lat: 30.1219, lng: 31.4056, city: 'Cairo' },
  CMN: { lat: 33.3675, lng: -7.5898, city: 'Casablanca' },
  ADD: { lat: 8.9779, lng: 38.7993, city: 'Addis Ababa' },
  NBO: { lat: -1.3192, lng: 36.9278, city: 'Nairobi' },
  LOS: { lat: 6.5774, lng: 3.3212, city: 'Lagos' },
};

interface RouteMapSkeletonProps {
  height?: number;
  className?: string;
}

// Skeleton component for loading state
export function RouteMapSkeleton({ height = 280, className }: RouteMapSkeletonProps) {
  return (
    <Card 
      className={cn(
        'relative overflow-hidden border-0 shadow-lg',
        className
      )}
      style={{ height }}
      aria-label="Loading flight route..."
      aria-busy="true"
    >
      {/* Background gradient - same as RouteMap */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
      
      {/* Animated stars */}
      <div className="absolute inset-0 opacity-40">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.1) % 2}s`,
              opacity: 0.3 + (i % 5) * 0.15,
            }}
          />
        ))}
      </div>
      
      {/* SVG with animated skeleton path */}
      <svg 
        viewBox="0 0 600 280"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Shimmer gradient */}
          <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)">
              <animate attributeName="offset" values="-1;1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="rgba(255,255,255,0.3)">
              <animate attributeName="offset" values="-0.5;1.5" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)">
              <animate attributeName="offset" values="0;2" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        
        {/* Skeleton path - curved line */}
        <path
          d="M 100 180 Q 300 80 500 180"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="12 8"
        />
        
        {/* Origin skeleton marker */}
        <g transform="translate(100, 180)">
          <circle r="16" fill="rgba(255,255,255,0.1)" className="animate-pulse" />
          <circle r="12" fill="rgba(255,255,255,0.2)" />
          <circle r="6" fill="rgba(255,255,255,0.3)" />
        </g>
        
        {/* Destination skeleton marker */}
        <g transform="translate(500, 180)">
          <circle r="16" fill="rgba(255,255,255,0.1)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
          <circle r="12" fill="rgba(255,255,255,0.2)" />
          <circle r="6" fill="rgba(255,255,255,0.3)" />
        </g>
        
        {/* Animated plane placeholder */}
        <g>
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M 100 180 Q 300 80 500 180"
            rotate="auto"
          />
          <circle r="10" fill="rgba(255,255,255,0.3)" />
        </g>
      </svg>
      
      {/* Bottom info skeleton */}
      <div className={cn(
        "absolute inset-x-0 bottom-0 p-4",
        "bg-gradient-to-t from-black/60 via-black/30 to-transparent"
      )}>
        <div className="flex items-end justify-between gap-4">
          {/* Origin skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
            <div className="space-y-1.5">
              <Skeleton className="w-12 h-5 bg-white/20" />
              <Skeleton className="w-16 h-3 bg-white/10" />
            </div>
          </div>
          
          {/* Flight info skeleton */}
          <div className="flex flex-col items-center">
            <Skeleton className="w-24 h-8 rounded-full bg-white/10" />
            <Skeleton className="w-32 h-3 mt-2 bg-white/10" />
          </div>
          
          {/* Destination skeleton */}
          <div className="flex items-center gap-3">
            <div className="space-y-1.5">
              <Skeleton className="w-12 h-5 bg-white/20" />
              <Skeleton className="w-16 h-3 bg-white/10" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
      
      {/* Top left skeleton */}
      <div className="absolute top-4 left-4">
        <Skeleton className="w-28 h-8 rounded-full bg-white/10" />
      </div>
      
      {/* Center loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Plane className="w-8 h-8 text-white/40 animate-bounce" />
          </div>
          <p className="text-sm text-white/50 animate-pulse">Searching flights...</p>
        </div>
      </div>
    </Card>
  );
}

interface RouteMapProps {
  flight: Flight;
  className?: string;
  showAnimation?: boolean;
  height?: number;
  variant?: 'compact' | 'full';
}

export function RouteMap({ 
  flight, 
  className, 
  showAnimation = true, 
  height = 280,
  variant = 'full' 
}: RouteMapProps) {
  const originData = AIRPORT_COORDS[flight.origin.code];
  const destData = AIRPORT_COORDS[flight.destination.code];
  
  // Get layover/stop airports from segments
  const stopAirports = useMemo(() => {
    if (flight.stops === 0 || flight.segments.length <= 1) return [];
    
    // Get all connecting airports (arrival airports of all segments except the last)
    const stops: Array<{ code: string; city: string; coords: { lat: number; lng: number } | null }> = [];
    
    for (let i = 0; i < flight.segments.length - 1; i++) {
      const segment = flight.segments[i];
      const arrivalCode = segment.arrival.airport.code;
      const coords = AIRPORT_COORDS[arrivalCode] || null;
      stops.push({
        code: arrivalCode,
        city: segment.arrival.airport.city || coords?.city || arrivalCode,
        coords,
      });
    }
    
    return stops;
  }, [flight.segments, flight.stops]);
  
  const mapData = useMemo(() => {
    if (!originData || !destData) return null;
    
    // Collect all points including stops
    const allPoints = [originData, ...stopAirports.filter(s => s.coords).map(s => s.coords!), destData];
    
    const padding = 40;
    const minLat = Math.min(...allPoints.map(p => p.lat)) - 3;
    const maxLat = Math.max(...allPoints.map(p => p.lat)) + 3;
    const minLng = Math.min(...allPoints.map(p => p.lng)) - 8;
    const maxLng = Math.max(...allPoints.map(p => p.lng)) + 8;
    
    const width = 600;
    const svgHeight = height;
    
    const lngToX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (width - padding * 2) + padding;
    const latToY = (lat: number) => svgHeight - (((lat - minLat) / (maxLat - minLat)) * (svgHeight - padding * 2) + padding);
    
    const originX = lngToX(originData.lng);
    const originY = latToY(originData.lat);
    const destX = lngToX(destData.lng);
    const destY = latToY(destData.lat);
    
    // Calculate stop positions
    const stopPositions = stopAirports
      .filter(s => s.coords)
      .map(s => ({
        x: lngToX(s.coords!.lng),
        y: latToY(s.coords!.lat),
        code: s.code,
        city: s.city,
      }));
    
    // Build path through all points (origin -> stops -> destination)
    let path: string;
    const pathPoints = [
      { x: originX, y: originY },
      ...stopPositions,
      { x: destX, y: destY },
    ];
    
    if (pathPoints.length === 2) {
      // Direct flight - use curved path
      const midX = (originX + destX) / 2;
      const midY = (originY + destY) / 2;
      const distance = Math.sqrt(Math.pow(destX - originX, 2) + Math.pow(destY - originY, 2));
      const curveOffset = distance * 0.25;
      const angle = Math.atan2(destY - originY, destX - originX);
      const controlX = midX + Math.sin(angle) * curveOffset;
      const controlY = midY - Math.cos(angle) * curveOffset;
      path = `M ${originX} ${originY} Q ${controlX} ${controlY} ${destX} ${destY}`;
    } else {
      // Multi-leg flight - create curved segments between each point
      const pathParts: string[] = [];
      for (let i = 0; i < pathPoints.length - 1; i++) {
        const p1 = pathPoints[i];
        const p2 = pathPoints[i + 1];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const curveOffset = distance * 0.2;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const controlX = midX + Math.sin(angle) * curveOffset;
        const controlY = midY - Math.cos(angle) * curveOffset;
        
        if (i === 0) {
          pathParts.push(`M ${p1.x} ${p1.y} Q ${controlX} ${controlY} ${p2.x} ${p2.y}`);
        } else {
          pathParts.push(`Q ${controlX} ${controlY} ${p2.x} ${p2.y}`);
        }
      }
      path = pathParts.join(' ');
    }
    
    const distance = Math.sqrt(Math.pow(destX - originX, 2) + Math.pow(destY - originY, 2));
    
    return {
      width,
      height: svgHeight,
      originX,
      originY,
      destX,
      destY,
      stopPositions,
      path,
      distance,
    };
  }, [originData, destData, stopAirports, height]);

  if (!mapData) {
    return (
      <Card className={cn('flex items-center justify-center bg-neutral-50 dark:bg-neutral-900', className)} style={{ height }}>
        <div className="text-center">
          <Plane className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Map not available for this route</p>
        </div>
      </Card>
    );
  }

  const isCompact = variant === 'compact';

  return (
    <Card 
      className={cn(
        'relative overflow-hidden border-0 shadow-lg',
        className
      )}
      style={{ height }}
      role="img"
      aria-label={`Flight route from ${flight.origin.city} to ${flight.destination.city}`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
      
      {/* Stars/dots pattern */}
      <div className="absolute inset-0 opacity-40">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.1) % 2}s`,
              opacity: 0.3 + (i % 5) * 0.15,
            }}
          />
        ))}
      </div>
      
      {/* SVG Map */}
      <svg 
        viewBox={`0 0 ${mapData.width} ${mapData.height}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Route gradient */}
          <linearGradient id="routeGradientEnhanced" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="1" />
          </linearGradient>
          
          {/* Glow effect */}
          <filter id="glowEnhanced" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Drop shadow for markers */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
          
          {/* Animated dash pattern */}
          <pattern id="movingDash" patternUnits="userSpaceOnUse" width="20" height="4">
            <line x1="0" y1="2" x2="10" y2="2" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
              <animate attributeName="x1" from="0" to="20" dur="1s" repeatCount="indefinite"/>
              <animate attributeName="x2" from="10" to="30" dur="1s" repeatCount="indefinite"/>
            </line>
          </pattern>
        </defs>
        
        {/* Path shadow */}
        <path
          d={mapData.path}
          fill="none"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="8"
          strokeLinecap="round"
          transform="translate(0, 3)"
        />
        
        {/* Dashed background path */}
        <path
          d={mapData.path}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          strokeDasharray="12 8"
          strokeLinecap="round"
        />
        
        {/* Main route path with gradient */}
        <path
          d={mapData.path}
          fill="none"
          stroke="url(#routeGradientEnhanced)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#glowEnhanced)"
          className={cn(showAnimation && 'route-path-animated')}
          style={{
            strokeDasharray: 500,
            strokeDashoffset: 0,
          }}
        />
        
        {/* Origin marker */}
        <g transform={`translate(${mapData.originX}, ${mapData.originY})`} filter="url(#shadow)">
          <circle r="16" fill="rgba(52, 211, 153, 0.2)" className={cn(showAnimation && 'animate-ping')} style={{ animationDuration: '2s' }} />
          <circle r="12" fill="#34d399" />
          <circle r="6" fill="white" />
          <circle r="3" fill="#34d399" />
        </g>
        
        {/* Destination marker */}
        <g transform={`translate(${mapData.destX}, ${mapData.destY})`} filter="url(#shadow)">
          <circle r="16" fill="rgba(167, 139, 250, 0.2)" className={cn(showAnimation && 'animate-ping')} style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <circle r="12" fill="#a78bfa" />
          <circle r="6" fill="white" />
          <circle r="3" fill="#a78bfa" />
        </g>
        
        {/* Stop/Layover markers */}
        {mapData.stopPositions.map((stop, index) => (
          <g key={stop.code} transform={`translate(${stop.x}, ${stop.y})`} filter="url(#shadow)">
            {/* Outer glow ring */}
            <circle 
              r="12" 
              fill="rgba(251, 191, 36, 0.15)" 
              className={cn(showAnimation && 'animate-ping')} 
              style={{ animationDuration: '2.5s', animationDelay: `${0.25 + index * 0.2}s` }} 
            />
            {/* Main amber circle */}
            <circle r="8" fill="#f59e0b" />
            {/* Inner white ring */}
            <circle r="4" fill="white" />
            {/* Center dot */}
            <circle r="2" fill="#f59e0b" />
            {/* Stop label */}
            <text 
              y="-16" 
              textAnchor="middle" 
              fill="white" 
              fontSize="10" 
              fontWeight="600"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              {stop.code}
            </text>
          </g>
        ))}
        
        {/* Animated plane */}
        {showAnimation && (
          <g>
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path={mapData.path}
              rotate="auto"
            />
            <g transform="translate(-16, -16)">
              {/* Plane trail */}
              <ellipse cx="16" cy="16" rx="20" ry="8" fill="rgba(255,255,255,0.1)" transform="rotate(-90, 16, 16)" />
              {/* Plane body */}
              <circle cx="16" cy="16" r="14" fill="white" filter="url(#shadow)" />
              <path 
                d="M16 6 L12 16 L16 14 L20 16 Z M12 18 L16 22 L20 18 L16 20 Z" 
                fill="#3b82f6"
                transform="rotate(90, 16, 16)"
              />
            </g>
          </g>
        )}
      </svg>
      
      {/* Info overlay */}
      <div className={cn(
        "absolute inset-x-0 bottom-0 p-4",
        "bg-gradient-to-t from-black/60 via-black/30 to-transparent"
      )}>
        <div className="flex items-end justify-between gap-4">
          {/* Origin */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30">
              <MapPin className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{flight.origin.code}</p>
              <p className="text-xs text-white/70">{originData?.city || flight.origin.city}</p>
              {!isCompact && (
                <p className="text-xs text-emerald-400 font-medium">{formatTime(flight.departureTime)}</p>
              )}
            </div>
          </div>
          
          {/* Flight info */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Clock className="w-4 h-4 text-blue-300" aria-hidden="true" />
              <span className="text-sm font-medium text-white">{formatDuration(flight.duration)}</span>
            </div>
            {!isCompact && (
              <div className="mt-2 flex items-center gap-1">
                <Plane className="w-3 h-3 text-white/50" aria-hidden="true" />
                <span className="text-xs text-white/50">
                  {flight.airline.name} • {flight.segments[0]?.flightNumber}
                </span>
              </div>
            )}
          </div>
          
          {/* Destination */}
          <div className="flex items-center gap-3">
            <div>
              <p className="text-lg font-bold text-white text-right">{flight.destination.code}</p>
              <p className="text-xs text-white/70 text-right">{destData?.city || flight.destination.city}</p>
              {!isCompact && (
                <p className="text-xs text-purple-400 font-medium text-right">{formatTime(flight.arrivalTime)}</p>
              )}
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-400/30">
              <MapPin className="w-5 h-5 text-purple-400" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Stops indicator */}
      {flight.stops > 0 && (
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30">
            <span className="text-xs font-medium text-amber-300">
              {flight.stops === 1 ? '1 Stop' : `${flight.stops} Stops`}
            </span>
          </div>
        </div>
      )}
      
      {/* Airline logo area */}
      <div className="absolute top-4 left-4">
        <div className="px-2 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-2">
          <AirlineBadge airline={flight.airline} size={20} />
          <span className="text-xs font-medium text-white">{flight.airline.name}</span>
        </div>
      </div>
    </Card>
  );
}
