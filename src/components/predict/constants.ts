import {
  BookOpen,
  GraduationCap,
  Microscope,
  Stethoscope,
} from "lucide-react";
import {
  EXAM_CATALOG,
  isExamTypeEnabled,
  isPartEnabled,
  isStreamEnabled,
  LAUNCH_DEFAULTS,
  matchesLaunchScope,
} from "@/lib/data/exam-catalog";
import type { ExamPart, ExamStream, ExamType } from "@/lib/types/predict";

export {
  EXAM_CATALOG,
  LAUNCH_DEFAULTS,
  isExamTypeEnabled,
  isPartEnabled,
  isStreamEnabled,
  matchesLaunchScope,
};

const EXAM_ICONS = {
  matric: GraduationCap,
  fsc: BookOpen,
  css: Microscope,
  mdcat: Stethoscope,
} as const;

export const EXAM_OPTIONS = EXAM_CATALOG.map((item) => ({
  type: item.id,
  label: item.label,
  subtitle: item.subtitle ?? "",
  icon: EXAM_ICONS[item.id],
  enabled: item.enabled,
}));

export const YEAR_RANGE_OPTIONS = [
  { value: 5 as const, label: "Last 5 years" },
  { value: 10 as const, label: "Last 10 years" },
];

export const LOADING_MESSAGES = [
  "Scanning past papers...",
  "Detecting patterns...",
  "Scoring questions...",
  "Almost ready...",
];

export function parseExamPart(v: string | null): ExamPart | null {
  if (v === "part1" || v === "part2") return v;
  return null;
}

export function parseExamStream(v: string | null): ExamStream | null {
  const valid: ExamStream[] = [
    "pre_engineering",
    "pre_medical",
    "commerce",
    "arts",
    "computer_science",
    "biology",
  ];
  return valid.includes(v as ExamStream) ? (v as ExamStream) : null;
}

export function isBoardEnabled(
  board: { id: string; name?: string; is_active?: boolean } | string
): boolean {
  if (typeof board === "string") {
    return board === LAUNCH_DEFAULTS.boardId;
  }
  if (board.is_active === false) return false;
  return board.name === LAUNCH_DEFAULTS.boardName;
}

export function isSubjectEnabled(
  subject: { id: string; name?: string; is_active?: boolean } | string,
  scope?: {
    examType?: ExamType | null;
    part?: ExamPart | null;
    stream?: ExamStream | null;
  }
): boolean {
  if (typeof subject === "string") {
    return subject === LAUNCH_DEFAULTS.subjectId;
  }
  if (subject.is_active === false) return false;
  if (scope?.examType && scope?.part && scope?.stream) {
    return matchesLaunchScope({
      examType: scope.examType,
      part: scope.part,
      stream: scope.stream,
      subjectName: subject.name,
    });
  }
  return subject.name === LAUNCH_DEFAULTS.subjectName;
}

export function requiresPartAndStream(examType: ExamType | null): boolean {
  return examType === "matric" || examType === "fsc";
}

/** Regional boards apply to Matric, FSc, and CSS — not MDCAT */
export function requiresBoard(examType: ExamType | null): boolean {
  return examType === "matric" || examType === "fsc" || examType === "css";
}
