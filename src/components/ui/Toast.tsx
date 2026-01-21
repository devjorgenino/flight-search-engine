'use client';

import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { X, TrendingDown, TrendingUp, Check, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'price-drop' | 'price-rise';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    const duration = toast.duration ?? 5000;
    const timeout = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => clearTimeout(timeout);
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons: Record<ToastType, ReactNode> = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    'price-drop': <TrendingDown className="w-5 h-5" />,
    'price-rise': <TrendingUp className="w-5 h-5" />,
  };

  const colors: Record<ToastType, string> = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    'price-drop': 'bg-emerald-500 text-white',
    'price-rise': 'bg-amber-500 text-white',
  };

  const bgColors: Record<ToastType, string> = {
    success: 'bg-white dark:bg-neutral-800 border-emerald-200 dark:border-emerald-800',
    error: 'bg-white dark:bg-neutral-800 border-red-200 dark:border-red-800',
    info: 'bg-white dark:bg-neutral-800 border-blue-200 dark:border-blue-800',
    'price-drop': 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-emerald-300 dark:border-emerald-700',
    'price-rise': 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50 border-amber-300 dark:border-amber-700',
  };

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 pr-10 rounded-xl border shadow-lg max-w-sm',
        'transition-all duration-300 ease-out',
        bgColors[toast.type],
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        toast.type === 'price-drop' && 'animate-pulse-once'
      )}
    >
      <div className={cn('flex-shrink-0 p-2 rounded-lg', colors[toast.type])}>
        {icons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{toast.message}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 text-neutral-400" />
      </button>
    </div>
  );
}

// Animated price badge component
export function PriceAlertBadge({ 
  type, 
  percentage,
  className 
}: { 
  type: 'drop' | 'rise'; 
  percentage: number;
  className?: string;
}) {
  const isDropping = type === 'drop';
  
  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold',
        'animate-bounce-once',
        isDropping 
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        className
      )}
    >
      {isDropping ? (
        <TrendingDown className="w-3 h-3" />
      ) : (
        <TrendingUp className="w-3 h-3" />
      )}
      <span>{percentage}%</span>
    </div>
  );
}
