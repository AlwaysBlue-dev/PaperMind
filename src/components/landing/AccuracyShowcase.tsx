import { CheckCircle2 } from "lucide-react";

const verifiedPredictions = [
  {
    topic: "Electrostatics — Coulomb's Law numerical",
    probability: 91,
    verified: true,
  },
  {
    topic: "Current Electricity — Ohm's law circuit",
    probability: 84,
    verified: true,
  },
  {
    topic: "Electromagnetic Induction — Faraday's law",
    probability: 76,
    verified: true,
  },
  {
    topic: "Nuclear Physics — half-life calculation",
    probability: 68,
    verified: false,
  },
];

export function AccuracyShowcase() {
  return (
    <section className="landing-section">
      <div className="landing-container">
        <div className="pm-card overflow-hidden">
          <div className="border-b border-border bg-muted/40 px-5 py-4 md:px-8 md:py-5">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
              Accuracy showcase
            </p>
            <h2 className="font-heading mt-1 text-xl font-bold md:text-2xl">
              For 2024 Matric Physics, we identified these patterns
            </h2>
          </div>

          <div className="divide-y divide-border">
            {verifiedPredictions.map((item) => (
              <div
                key={item.topic}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium md:text-base">{item.topic}</p>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    Predicted {item.probability}% likely
                  </p>
                </div>
                {item.verified && (
                  <span className="pm-badge-success w-fit shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    Appeared in actual paper
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
