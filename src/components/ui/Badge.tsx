import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 dark:from-neutral-800 dark:to-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600',
    success: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 dark:from-emerald-950 dark:to-emerald-900 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    warning: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 dark:from-amber-950 dark:to-amber-900 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    error: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 dark:from-red-950 dark:to-red-900 dark:text-red-400 border border-red-200 dark:border-red-800',
    accent: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 dark:from-emerald-950 dark:to-emerald-900 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
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
