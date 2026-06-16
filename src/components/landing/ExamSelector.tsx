"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Microscope,
  Stethoscope,
} from "lucide-react";
import { isExamTypeEnabled, LAUNCH_DEFAULTS } from "@/lib/data/exam-catalog";
import type { ExamType } from "@/lib/types/predict";

const exams = [
  {
    type: "matric" as ExamType,
    name: "Matric",
    subtitle: "Class 9–10",
    icon: GraduationCap,
    gradient: "from-primary/20 via-primary/5 to-transparent",
    iconColor: "text-primary",
  },
  {
    type: "fsc" as ExamType,
    name: "FSc",
    subtitle: "BISE Karachi · Part 1",
    icon: BookOpen,
    gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
    iconColor: "text-violet-500",
  },
  {
    type: "css" as ExamType,
    name: "CSS",
    subtitle: "Competitive",
    icon: Microscope,
    gradient: "from-accent/25 via-accent/5 to-transparent",
    iconColor: "text-accent",
  },
  {
    type: "mdcat" as ExamType,
    name: "MDCAT",
    subtitle: "Medical entry",
    icon: Stethoscope,
    gradient: "from-success/20 via-success/5 to-transparent",
    iconColor: "text-success",
  },
];

export function ExamSelector() {
  const router = useRouter();
  const [preferredExam, setPreferredExam] = useState<ExamType | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.examType) setPreferredExam(data.examType);
      })
      .catch(() => {});
  }, []);

  const orderedExams = useMemo(() => {
    if (!preferredExam) return exams;
    const preferred = exams.find((e) => e.type === preferredExam);
    const rest = exams.filter((e) => e.type !== preferredExam);
    return preferred ? [preferred, ...rest] : exams;
  }, [preferredExam]);

  function handleSelect(type: ExamType) {
    if (!isExamTypeEnabled(type)) return;
    const params = new URLSearchParams({
      examType: type,
      boardId: LAUNCH_DEFAULTS.boardId,
      part: LAUNCH_DEFAULTS.part,
      stream: LAUNCH_DEFAULTS.stream,
    });
    router.push(`/predict?${params}`);
  }

  return (
    <section className="landing-section">
      <div className="landing-container">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Pick your exam
          </h2>
          <p className="mt-2 text-foreground-muted">
            Launching with BISE Karachi FSc Part 1 Pre-Engineering — more boards
            and streams coming soon
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {orderedExams.map(
            ({ type, name, subtitle, icon: Icon, gradient, iconColor }) => {
              const enabled = isExamTypeEnabled(type);
              return (
                <button
                  key={type}
                  type="button"
                  disabled={!enabled}
                  onClick={() => handleSelect(type)}
                  className={`exam-card group relative flex min-h-[120px] flex-col items-start rounded-2xl border border-card-border bg-linear-to-br ${gradient} p-4 text-left transition-all duration-200 md:min-h-[140px] md:p-5 ${
                    enabled
                      ? "active:scale-95"
                      : "cursor-not-allowed opacity-70"
                  } ${preferredExam === type ? "ring-2 ring-primary/30" : ""}`}
                >
                  {!enabled && (
                    <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-foreground-muted">
                      Coming soon
                    </span>
                  )}
                  <span
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 ${iconColor} shadow-sm transition-transform duration-200 ${
                      enabled ? "group-hover:scale-105" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-heading text-base font-semibold md:text-lg">
                    {name}
                  </span>
                  <span className="mt-0.5 text-xs text-foreground-muted md:text-sm">
                    {subtitle}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
