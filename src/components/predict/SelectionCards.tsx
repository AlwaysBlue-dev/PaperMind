"use client";

import type { ReactNode } from "react";

type SelectionCardProps = {
  label: string;
  subtitle?: string;
  selected?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
  onClick: () => void;
  icon?: ReactNode;
};

export function SelectionCard({
  label,
  subtitle,
  selected = false,
  disabled = false,
  comingSoon = false,
  onClick,
  icon,
}: SelectionCardProps) {
  const isDisabled = disabled || comingSoon;

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`relative flex min-h-[72px] w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${
        isDisabled
          ? "cursor-not-allowed border-border bg-muted/40 opacity-70"
          : "active:scale-[0.98]"
      } ${
        !isDisabled && selected
          ? "border-primary bg-primary/8 ring-2 ring-primary/20"
          : !isDisabled
            ? "border-border bg-card hover:border-foreground-muted/30"
            : ""
      }`}
    >
      {comingSoon && (
        <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-foreground-muted">
          Coming soon
        </span>
      )}
      {icon && (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isDisabled ? "bg-muted text-muted-foreground" : "bg-muted text-primary"
          }`}
          suppressHydrationWarning
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1" suppressHydrationWarning>
        <span className="block font-medium">{label}</span>
        {subtitle ? (
          <span className="mt-0.5 block text-xs text-foreground-muted">
            {subtitle}
          </span>
        ) : null}
      </span>
    </button>
  );
}

type SelectionGridProps = {
  children: ReactNode;
};

export function SelectionGrid({ children }: SelectionGridProps) {
  return <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{children}</div>;
}

type YearPillsProps = {
  value: number | null;
  onChange: (value: 5 | 10) => void;
};

export function YearPills({ value, onChange }: YearPillsProps) {
  const options = [
    { v: 5 as const, label: "Last 5 years" },
    { v: 10 as const, label: "Last 10 years" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {options.map(({ v, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`min-h-12 rounded-xl border px-4 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
            value === v
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-foreground hover:bg-muted"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
