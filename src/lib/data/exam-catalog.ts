import type { ExamPart, ExamStream, ExamType } from "@/lib/types/predict";

export type CatalogItem<T extends string = string> = {
  id: T;
  label: string;
  subtitle?: string;
  enabled: boolean;
};

/** Launch focus: BISE Karachi · FSc · Part 1 · Pre-Engineering · Chemistry */
export const LAUNCH_DEFAULTS = {
  examType: "fsc" as ExamType,
  boardId: "bise-karachi",
  boardName: "BISE Karachi",
  subjectId: "khi-chemistry",
  subjectName: "Chemistry",
  part: "part1" as ExamPart,
  stream: "pre_engineering" as ExamStream,
};

export const EXAM_CATALOG: CatalogItem<ExamType>[] = [
  { id: "matric", label: "Matric", subtitle: "Class 9–10", enabled: false },
  { id: "fsc", label: "FSc", subtitle: "Class 11–12", enabled: true },
  { id: "css", label: "CSS", subtitle: "Competitive", enabled: false },
  { id: "mdcat", label: "MDCAT", subtitle: "National medical entry test", enabled: false },
];

export function matchesLaunchScope(scope: {
  examType?: ExamType | null;
  part?: ExamPart | null;
  stream?: ExamStream | null;
  subjectName?: string | null;
}): boolean {
  const { examType, part, stream, subjectName } = scope;
  if (examType !== LAUNCH_DEFAULTS.examType) return false;
  if (part !== LAUNCH_DEFAULTS.part) return false;
  if (stream !== LAUNCH_DEFAULTS.stream) return false;
  if (subjectName != null && subjectName !== LAUNCH_DEFAULTS.subjectName) {
    return false;
  }
  return true;
}

export function isExamTypeEnabled(type: ExamType): boolean {
  return type === LAUNCH_DEFAULTS.examType;
}

export function isPartEnabled(
  part: ExamPart,
  examType?: ExamType | null
): boolean {
  if (!examType) return false;
  return matchesLaunchScope({ examType, part, stream: LAUNCH_DEFAULTS.stream });
}

export function isStreamEnabled(
  stream: ExamStream,
  examType?: ExamType | null,
  part?: ExamPart | null
): boolean {
  if (!examType || !part) return false;
  return matchesLaunchScope({ examType, part, stream });
}
