import type { ExamPart, ExamStream, ExamType } from "@/lib/types/predict";

export const EXAM_LABELS: Record<ExamType, string> = {
  matric: "Matric",
  fsc: "FSc",
  css: "CSS",
  mdcat: "MDCAT",
};

export const STREAM_LABELS: Record<ExamStream, string> = {
  pre_engineering: "Pre-Engineering",
  pre_medical: "Pre-Medical",
  commerce: "Commerce",
  arts: "Arts",
  computer_science: "Computer Science",
  biology: "Biology",
};

export const PART_LABELS: Record<ExamPart, string> = {
  part1: "Part 1",
  part2: "Part 2",
};

export function streamLabel(id: ExamStream): string {
  return STREAM_LABELS[id] ?? id;
}

export function partLabel(id: ExamPart): string {
  return PART_LABELS[id] ?? id;
}

export function examLabel(id: ExamType): string {
  return EXAM_LABELS[id] ?? id;
}

/** e.g. "fsc part 1 - pre_engineering" */
export function formatPaperScope(
  examType: ExamType,
  part?: ExamPart | null,
  stream?: ExamStream | null,
  fallback?: string | null
): string {
  if (part && stream) {
    const partSlug = part.replace(/^part/, "part ");
    return `${examType} ${partSlug} - ${stream}`;
  }
  return fallback?.trim() || examLabel(examType);
}

/** When DB has no rows yet — Matric & FSc part/stream matrix */
export const FALLBACK_STREAMS_BY_EXAM: Record<
  "matric" | "fsc",
  Record<ExamPart, ExamStream[]>
> = {
  matric: {
    part1: ["biology", "computer_science"],
    part2: ["biology", "computer_science"],
  },
  fsc: {
    part1: ["pre_engineering", "pre_medical", "commerce", "arts"],
    part2: ["pre_engineering", "pre_medical", "commerce", "arts"],
  },
};

export const FALLBACK_PARTS: ExamPart[] = ["part1", "part2"];

export function fallbackStreamsFor(
  examType: ExamType,
  part: ExamPart
): ExamStream[] {
  if (examType === "matric" || examType === "fsc") {
    return FALLBACK_STREAMS_BY_EXAM[examType][part] ?? [];
  }
  return [];
}

export function fallbackPartsFor(examType: ExamType): ExamPart[] {
  if (examType === "matric" || examType === "fsc") {
    return FALLBACK_PARTS;
  }
  return [];
}

export type ScopeOption<T extends string> = {
  id: T;
  label: string;
};
