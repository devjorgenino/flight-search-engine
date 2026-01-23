import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 dark:from-neutral-800 dark:to-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600',
    success: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 dark:from-emerald-950/50 dark:to-teal-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60',
    warning: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 dark:from-amber-950/50 dark:to-orange-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60',
    error: 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 dark:from-rose-950/50 dark:to-red-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60',
    accent: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 dark:from-emerald-950/50 dark:to-teal-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60',
    info: 'bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 dark:from-blue-950/50 dark:to-sky-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
