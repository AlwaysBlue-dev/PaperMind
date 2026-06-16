import Link from "next/link";
import { Sparkles } from "lucide-react";

export function FinalCta() {
  return (
    <section className="landing-section">
      <div className="landing-cta-gradient mx-0 px-5 py-16 text-center md:mx-auto md:max-w-6xl md:rounded-2xl md:px-12 md:py-20">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
          Stop guessing. Start predicting.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-primary-foreground/80 md:text-base">
          Join thousands of Pakistani students who study smarter with
          AI-powered exam insights.
        </p>
        <Link
          href="/predict"
          className="landing-cta-btn mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-card px-8 text-base font-semibold text-primary shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" />
          Predict my paper
        </Link>
      </div>
    </section>
  );
}
