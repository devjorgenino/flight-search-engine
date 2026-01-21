"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              "w-full h-11 rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900",
              "placeholder:text-neutral-400 placeholder:font-normal",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500",
              icon && "pl-10",
              error
                ? "border-red-500 focus-visible:ring-red-500 hover:border-red-400"
                : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm focus:bg-white focus:dark:bg-neutral-900",
              "dark:border-neutral-700 dark:hover:border-neutral-600",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={hintId}
            className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400"
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
