import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AccuracyShowcase } from "@/components/landing/AccuracyShowcase";
import { ExamSelector } from "@/components/landing/ExamSelector";
import { FinalCta } from "@/components/landing/FinalCta";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { StatsBar } from "@/components/landing/StatsBar";
import { TrustLine } from "@/components/landing/TrustLine";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://papermind.app";

export const metadata: Metadata = {
  title: "PaperMind — Know what's coming before you open the paper",
  description:
    "AI analyses 10+ years of BISE, FBISE and FPSC past papers to predict your exam questions. Built for Matric, FSc, CSS, and MDCAT students in Pakistan.",
  openGraph: {
    title: "PaperMind — AI Exam Question Prediction",
    description:
      "Stop guessing. Start predicting. AI-powered exam prep for Pakistani students.",
    url: appUrl,
    siteName: "PaperMind",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PaperMind — AI Exam Question Prediction",
    description:
      "AI analyses past papers to predict your exam questions. Matric, FSc, CSS & MDCAT.",
  },
};

export default function Home() {
  return (
    <div className="landing-page flex flex-1 flex-col">
      {/* Hero */}
      <section className="landing-hero relative overflow-hidden">
        <div className="landing-hero-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="landing-container relative grid gap-10 pb-12 pt-8 md:grid-cols-2 md:items-center md:gap-12 md:py-20 lg:gap-16">
          <div className="flex flex-col gap-6 md:gap-8">
            <span className="pm-badge-high w-fit">
              <Sparkles className="h-3 w-3" />
              Built for Pakistani students
            </span>

            <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
              Know what&apos;s coming{" "}
              <span className="text-accent">before you open the paper</span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-foreground-muted md:text-lg">
              AI analyses 10+ years of BISE, FBISE and FPSC past papers to
              predict your exam questions
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/predict"
                className="landing-primary-btn inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-primary-hover active:scale-[0.98] sm:w-auto"
              >
                Predict my paper
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/papers"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-border bg-transparent px-7 text-base font-medium text-foreground transition-all duration-200 hover:bg-muted active:scale-[0.98] sm:w-auto"
              >
                Browse past papers
              </Link>
            </div>

            <TrustLine />
          </div>

          <HeroPreview />
        </div>
      </section>

      <HowItWorks />
      <ExamSelector />
      <StatsBar />
      <AccuracyShowcase />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
