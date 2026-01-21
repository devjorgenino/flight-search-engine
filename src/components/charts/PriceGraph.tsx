'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui';
import { useFilteredFlights, useFlightStats } from '@/hooks/useFilteredFlights';
import { useFlightStore } from '@/stores/useFlightStore';
import { formatPrice } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface PriceDataPoint {
  hour: string;
  price: number;
  count: number;
  label: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PriceDataPoint }>;
  label?: string;
}

// Custom tooltip component
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl border border-slate-200 dark:border-slate-700 p-3">
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {data.label}
      </p>
      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
        {formatPrice(data.price)}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {data.count} flight{data.count !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export function PriceGraph() {
  const filteredFlights = useFilteredFlights();
  const { minPrice, avgPrice } = useFlightStats();
  const isLoading = useFlightStore((state) => state.isLoading);
  const allFlights = useFlightStore((state) => state.flights);

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

      data.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        price: avgPrice,
        count: hourData.count,
        label: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`,
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

  if (allFlights.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <Card variant="bordered" padding="lg">
        <div className="h-48 flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading chart...</div>
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card variant="bordered" padding="lg">
        <div className="h-48 flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400">
            No data available for chart
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="bordered" padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Price by Departure Time
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Average price per departure hour
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Lowest</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatPrice(minPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Average</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {formatPrice(avgPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Trend</p>
            <div className="flex items-center gap-1">
              {priceTrend === 'up' && (
                <TrendingUp className="w-4 h-4 text-red-500" />
              )}
              {priceTrend === 'down' && (
                <TrendingDown className="w-4 h-4 text-emerald-500" />
              )}
              {priceTrend === 'neutral' && (
                <Minus className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={{
                fill: '#6366f1',
                strokeWidth: 2,
                stroke: '#fff',
                r: 4,
              }}
              activeDot={{
                fill: '#6366f1',
                strokeWidth: 2,
                stroke: '#fff',
                r: 6,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
