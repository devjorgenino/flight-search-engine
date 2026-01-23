'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card } from '@/components/ui';
import { useFilteredFlights, useFlightStats } from '@/hooks/useFilteredFlights';
import { useFlightStore } from '@/stores/useFlightStore';
import { formatPrice, cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, BarChart3, Clock, Sparkles } from 'lucide-react';

interface PriceDataPoint {
  hour: string;
  price: number;
  count: number;
  label: string;
  minPrice: number;
  maxPrice: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PriceDataPoint }>;
  label?: string;
}

// Custom tooltip component with improved design
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div 
      className={cn(
        "bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700",
        "shadow-xl backdrop-blur-sm p-4 min-w-[160px]",
        "animate-in fade-in-0 zoom-in-95 duration-150"
      )}
      role="tooltip"
    >
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-emerald-500" />
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {data.label}
        </p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Avg Price</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatPrice(data.price)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Range</span>
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 tabular-nums">
            {formatPrice(data.minPrice)} - {formatPrice(data.maxPrice)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-neutral-100 dark:border-neutral-700">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Flights</span>
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {data.count} available
          </span>
        </div>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  accent = false 
}: { 
  label: string; 
  value: string; 
  icon: typeof TrendingDown;
  trend?: 'up' | 'down' | 'neutral';
  accent?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
      accent 
        ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800" 
        : "bg-neutral-50 dark:bg-neutral-800/50"
    )}>
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center",
        accent 
          ? "bg-emerald-100 dark:bg-emerald-900/50" 
          : "bg-white dark:bg-neutral-700 shadow-sm"
      )}>
        <Icon className={cn(
          "w-4 h-4",
          trend === 'up' && "text-rose-500",
          trend === 'down' && "text-emerald-500",
          trend === 'neutral' && "text-neutral-400",
          !trend && (accent ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500")
        )} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
          {label}
        </p>
        <p className={cn(
          "text-sm font-bold tabular-nums",
          accent ? "text-emerald-700 dark:text-emerald-300" : "text-neutral-900 dark:text-neutral-100"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function PriceGraph() {
  const filteredFlights = useFilteredFlights();
  const { minPrice, maxPrice, avgPrice } = useFlightStats();
  const isLoading = useFlightStore((state) => state.isLoading);
  const allFlights = useFlightStore((state) => state.flights);
  const filters = useFlightStore((state) => state.filters);
  const [hoveredHour, setHoveredHour] = useState<string | null>(null);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.airlines.length > 0 ||
      filters.stops.length < 3 ||
      filters.departureTimeSlots.length < 4
    );
  }, [filters]);

  // Group flights by departure hour and calculate average price
  const chartData = useMemo(() => {
    if (filteredFlights.length === 0) return [];

    const hourlyData = new Map<number, { prices: number[]; count: number }>();

    filteredFlights.forEach((flight) => {
      const hour = new Date(flight.departureTime).getHours();
      const existing = hourlyData.get(hour) || { prices: [], count: 0 };
      existing.prices.push(flight.price.amount);
      existing.count++;
      hourlyData.set(hour, existing);
    });

    // Create data points for all hours that have flights
    const data: PriceDataPoint[] = [];
    const sortedHours = Array.from(hourlyData.keys()).sort((a, b) => a - b);

    sortedHours.forEach((hour) => {
      const hourData = hourlyData.get(hour)!;
      const avgPrice = Math.round(
        hourData.prices.reduce((a, b) => a + b, 0) / hourData.prices.length
      );
      const minP = Math.min(...hourData.prices);
      const maxP = Math.max(...hourData.prices);

      data.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        price: avgPrice,
        count: hourData.count,
        label: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`,
        minPrice: minP,
        maxPrice: maxP,
      });
    });

    return data;
  }, [filteredFlights]);

  // Price trend indicator
  const priceTrend = useMemo(() => {
    if (chartData.length < 2) return 'neutral';
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    const diff = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'neutral';
  }, [chartData]);

  // Best hour to book
  const bestHour = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  }, [chartData]);

  if (allFlights.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <Card variant="bordered" padding="lg" className="overflow-hidden">
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center animate-pulse">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">
              Analyzing price trends...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card variant="bordered" padding="lg">
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-neutral-500 dark:text-neutral-400">
              No price data available
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      variant="bordered" 
      padding="none" 
      className="overflow-hidden"
      role="region"
      aria-label="Price trends by departure time"
    >
      {/* Header */}
      <div className="p-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Price by Departure Time
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                {hasActiveFilters && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Filtered results
                  </>
                )}
                {!hasActiveFilters && `${filteredFlights.length} flights analyzed`}
              </p>
            </div>
          </div>

          {/* Best time indicator */}
          {bestHour && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Best time: <span className="font-bold">{bestHour.hour}</span> ({formatPrice(bestHour.price)})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 py-4 bg-neutral-50/50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-800">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard 
            label="Lowest" 
            value={formatPrice(minPrice)} 
            icon={TrendingDown}
            accent={true}
          />
          <StatCard 
            label="Average" 
            value={formatPrice(avgPrice)} 
            icon={Minus}
          />
          <StatCard 
            label="Highest" 
            value={formatPrice(maxPrice)} 
            icon={TrendingUp}
          />
          <StatCard 
            label="Trend" 
            value={priceTrend === 'up' ? 'Rising' : priceTrend === 'down' ? 'Falling' : 'Stable'} 
            icon={priceTrend === 'up' ? TrendingUp : priceTrend === 'down' ? TrendingDown : Minus}
            trend={priceTrend as 'up' | 'down' | 'neutral'}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        <div className="h-56" role="img" aria-label="Area chart showing average flight prices by departure hour">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseMove={(e) => {
                if (e.activeLabel) setHoveredHour(e.activeLabel as string);
              }}
              onMouseLeave={() => setHoveredHour(null)}
            >
              <defs>
                <linearGradient id="priceGradientEnhanced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-700"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
                className="text-neutral-400"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `€${value}`}
                width={50}
                className="text-neutral-400"
              />
              {/* Reference line for average */}
              <ReferenceLine 
                y={avgPrice} 
                stroke="#94a3b8" 
                strokeDasharray="6 6" 
                strokeWidth={1}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                fill="url(#priceGradientEnhanced)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isHovered = hoveredHour === payload.hour;
                  const isLowest = payload.price === minPrice;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : isLowest ? 5 : 4}
                      fill={isLowest ? "#10b981" : "white"}
                      stroke={isLowest ? "#10b981" : "#14b8a6"}
                      strokeWidth={2}
                      className="transition-all duration-150"
                    />
                  );
                }}
                activeDot={{
                  fill: '#10b981',
                  strokeWidth: 3,
                  stroke: '#fff',
                  r: 7,
                  className: 'drop-shadow-md',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <span>Avg Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-neutral-300 dark:bg-neutral-600" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 4px, transparent 4px, transparent 8px)' }} />
            <span>Overall Avg</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
