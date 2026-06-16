"use client";

import { useStats } from "@/components/landing/TrustLine";
import { CountUp } from "@/components/landing/CountUp";

const statItems = [
  { key: "papers" as const, label: "papers analysed" },
  { key: "questions" as const, label: "questions in database" },
  { key: "predictions" as const, label: "predictions generated" },
];

export function StatsBar() {
  const { stats } = useStats();

  return (
    <section className="landing-section border-y border-border bg-muted/50">
      <div className="landing-container">
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {statItems.map(({ key, label }) => (
            <div
              key={key}
              className="flex flex-col items-center px-4 py-8 text-center sm:py-10"
            >
              <p className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                <CountUp value={stats[key]} />
              </p>
              <p className="mt-2 text-sm text-foreground-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
