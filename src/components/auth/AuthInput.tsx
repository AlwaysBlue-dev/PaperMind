import { forwardRef, type InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput({ label, error, id, className = "", ...props }, ref) {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`auth-input min-h-11 w-full rounded-xl border bg-card px-4 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-60 md:text-sm ${
            error ? "border-red-500/60" : "border-border"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
