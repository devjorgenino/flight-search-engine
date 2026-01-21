import { Skeleton } from '@/components/ui';

export function FlightCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Airline */}
        <div className="flex items-center gap-3 md:w-32">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-16 h-4 md:hidden" />
        </div>

        {/* Times */}
        <div className="flex-1 flex items-center gap-4">
          <div className="text-center md:text-left">
            <Skeleton className="w-16 h-8 mb-1" />
            <Skeleton className="w-10 h-4" />
          </div>

          <div className="flex-1 flex flex-col items-center px-4">
            <Skeleton className="w-12 h-3 mb-2" />
            <Skeleton className="w-full h-0.5" />
            <Skeleton className="w-14 h-3 mt-2" />
          </div>

          <div className="text-center md:text-right">
            <Skeleton className="w-16 h-8 mb-1" />
            <Skeleton className="w-10 h-4" />
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between md:flex-col md:items-end gap-2 md:w-36 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-16 h-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
