import { Sparkles, TrendingUp, Zap } from "lucide-react";

const predictions = [
  {
    chapter: "Chapter 5: Electrostatics",
    probability: 87,
    topic: "Coulomb's Law & electric field",
  },
  {
    chapter: "Chapter 8: Current Electricity",
    probability: 79,
    topic: "Ohm's law numericals",
  },
  {
    chapter: "Chapter 12: Magnetism",
    probability: 72,
    topic: "Force on a current-carrying conductor",
  },
];

export function HeroPreview() {
  return (
    <div className="animate-float relative mx-auto w-full max-w-sm md:max-w-none">
      <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" aria-hidden />
      <div className="pm-card relative overflow-hidden p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-foreground-muted">
                Matric Physics · 2025
              </p>
              <p className="text-sm font-semibold">Prediction preview</p>
            </div>
          </div>
          <span className="pm-badge-high">
            <TrendingUp className="h-3 w-3" />
            Live
          </span>
        </div>

        <div className="space-y-3">
          {predictions.map((item, i) => (
            <div
              key={item.chapter}
              className="rounded-xl border border-border bg-muted/50 p-3.5 transition-colors"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.chapter}</p>
                  <p className="mt-0.5 truncate text-xs text-foreground-muted">
                    {item.topic}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                    item.probability >= 80
                      ? "bg-accent/20 text-accent"
                      : "bg-primary/15 text-primary"
                  }`}
                >
                  {item.probability}%
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${item.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-foreground-muted">
          <Zap className="h-3.5 w-3.5 text-accent" />
          Based on 12 years of BISE Lahore papers
        </div>
      </div>
    </div>
  );
}
