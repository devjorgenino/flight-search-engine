'use client';

import { useMemo } from 'react';
import { Flight } from '@/types/flight';
import { Card, Skeleton } from '@/components/ui';
import { Plane, Clock, MapPin } from 'lucide-react';
import { cn, formatDuration, formatTime } from '@/lib/utils';

// Coordinates for European airports (expanded)
const AIRPORT_COORDS: Record<string, { lat: number; lng: number; city: string }> = {
  MAD: { lat: 40.4168, lng: -3.7038, city: 'Madrid' },
  BCN: { lat: 41.3851, lng: 2.1734, city: 'Barcelona' },
  LHR: { lat: 51.4700, lng: -0.4543, city: 'London' },
  CDG: { lat: 49.0097, lng: 2.5479, city: 'Paris' },
  FCO: { lat: 41.8003, lng: 12.2389, city: 'Rome' },
  AMS: { lat: 52.3105, lng: 4.7683, city: 'Amsterdam' },
  FRA: { lat: 50.0379, lng: 8.5622, city: 'Frankfurt' },
  MUC: { lat: 48.3537, lng: 11.7750, city: 'Munich' },
  LIS: { lat: 38.7742, lng: -9.1342, city: 'Lisbon' },
  ATH: { lat: 37.9364, lng: 23.9445, city: 'Athens' },
  VIE: { lat: 48.1103, lng: 16.5697, city: 'Vienna' },
  ZRH: { lat: 47.4647, lng: 8.5492, city: 'Zurich' },
  BRU: { lat: 50.9010, lng: 4.4856, city: 'Brussels' },
  DUB: { lat: 53.4264, lng: -6.2499, city: 'Dublin' },
  CPH: { lat: 55.6180, lng: 12.6560, city: 'Copenhagen' },
  OSL: { lat: 60.1939, lng: 11.1004, city: 'Oslo' },
  ARN: { lat: 59.6498, lng: 17.9238, city: 'Stockholm' },
  HEL: { lat: 60.3172, lng: 24.9633, city: 'Helsinki' },
  WAW: { lat: 52.1657, lng: 20.9671, city: 'Warsaw' },
  PRG: { lat: 50.1008, lng: 14.2600, city: 'Prague' },
  MXP: { lat: 45.6306, lng: 8.7231, city: 'Milan' },
  BER: { lat: 52.3667, lng: 13.5033, city: 'Berlin' },
  PMI: { lat: 39.5517, lng: 2.7388, city: 'Palma' },
  AGP: { lat: 36.6749, lng: -4.4991, city: 'Malaga' },
  SVQ: { lat: 37.4180, lng: -5.8931, city: 'Seville' },
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
  
  const mapData = useMemo(() => {
    if (!originData || !destData) return null;
    
    const padding = 40;
    const minLat = Math.min(originData.lat, destData.lat) - 3;
    const maxLat = Math.max(originData.lat, destData.lat) + 3;
    const minLng = Math.min(originData.lng, destData.lng) - 8;
    const maxLng = Math.max(originData.lng, destData.lng) + 8;
    
    const width = 600;
    const svgHeight = height;
    
    const lngToX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (width - padding * 2) + padding;
    const latToY = (lat: number) => svgHeight - (((lat - minLat) / (maxLat - minLat)) * (svgHeight - padding * 2) + padding);
    
    const originX = lngToX(originData.lng);
    const originY = latToY(originData.lat);
    const destX = lngToX(destData.lng);
    const destY = latToY(destData.lat);
    
    // Calculate curve control point for arc
    const midX = (originX + destX) / 2;
    const midY = (originY + destY) / 2;
    const distance = Math.sqrt(Math.pow(destX - originX, 2) + Math.pow(destY - originY, 2));
    const curveOffset = distance * 0.25;
    
    const angle = Math.atan2(destY - originY, destX - originX);
    const controlX = midX + Math.sin(angle) * curveOffset;
    const controlY = midY - Math.cos(angle) * curveOffset;
    
    return {
      width,
      height: svgHeight,
      originX,
      originY,
      destX,
      destY,
      controlX,
      controlY,
      path: `M ${originX} ${originY} Q ${controlX} ${controlY} ${destX} ${destY}`,
      distance,
    };
  }, [originData, destData, height]);

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
        <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-xs font-bold text-neutral-900">
            {flight.airline.code.charAt(0)}
          </div>
          <span className="text-xs font-medium text-white">{flight.airline.name}</span>
        </div>
      </div>
    </Card>
  );
}
