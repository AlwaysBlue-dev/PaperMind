"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, id, className = "", ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            autoComplete={props.autoComplete ?? "current-password"}
            className={`auth-input min-h-11 w-full rounded-xl border bg-card py-2.5 pl-4 pr-12 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-60 md:text-sm ${
              error ? "border-red-500/60" : "border-border"
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="pm-focus-ring absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
