"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

const DISCLAIMERS = [
  "PaperMind predictions are a study guide — they help you focus on high-probability chapters and topics from past board papers.",
  "We do not guarantee that any predicted question will appear on your actual exam paper.",
  "Question text shown is taken from past papers as a reference for the topic — your exam may ask the same concept differently.",
  "Use these results to plan your revision, not as a substitute for covering the full syllabus.",
];

const TERMS = [
  {
    term: "Probability %",
    description:
      "How strongly this topic ranks compared to others. Higher means more important to revise — not a guaranteed chance of appearing.",
  },
  {
    term: "Chapter frequency",
    description:
      "Shows how often a chapter was tested across past papers, e.g. 7/9 means it appeared in 7 out of 9 exam years in your selected range.",
  },
  {
    term: "Trend",
    description:
      "Whether this topic is appearing more often lately (up), less often (down), or about the same (stable) compared to earlier years.",
  },
  {
    term: "Last seen",
    description:
      "The most recent exam year this topic appeared in past papers.",
  },
  {
    term: "Due",
    description:
      "This topic has not shown up for longer than it usually does — it may be overdue to come back.",
  },
  {
    term: "Cyclical",
    description:
      "This topic repeats on a fairly steady schedule, and that pattern lines up with the exam year we are predicting for.",
  },
  {
    term: "Regular",
    description:
      "This topic appears at fairly consistent intervals in past papers, without being clearly due or cyclical this year.",
  },
  {
    term: "MCQ / Short / Long",
    description:
      "Question format from past papers — multiple choice, short answer, or long/structured answer.",
  },
];

export function PredictHowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="h-4 w-4" />
          </span>
          <span>
            <span className="block font-heading text-sm font-semibold sm:text-base">
              Please read
            </span>
            <span className="block text-xs text-foreground-muted">
              Disclaimer &amp; terms to know
            </span>
          </span>
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-foreground-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-foreground-muted" />
        )}
      </button>

      {open ? (
        <div className="space-y-5 border-t border-border px-4 py-4 sm:px-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Disclaimer
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-4 text-sm text-foreground-muted">
              {DISCLAIMERS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Terms to know
            </p>
            <dl className="mt-2 space-y-3 text-sm">
              {TERMS.map(({ term, description }) => (
                <div key={term}>
                  <dt className="font-medium text-foreground">{term}</dt>
                  <dd className="mt-0.5 text-foreground-muted">{description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
