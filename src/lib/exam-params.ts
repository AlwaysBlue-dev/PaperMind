import type { ExamPart, ExamStream, ExamType } from "@/lib/types/predict";

const VALID_EXAMS: ExamType[] = ["matric", "fsc", "css", "mdcat"];
const VALID_PARTS: ExamPart[] = ["part1", "part2"];
const VALID_STREAMS: ExamStream[] = [
  "pre_engineering",
  "pre_medical",
  "commerce",
  "arts",
  "computer_science",
  "biology",
];

export function parseExamTypeParam(v: string | null): ExamType | null {
  return VALID_EXAMS.includes(v as ExamType) ? (v as ExamType) : null;
}

export function parseExamPartParam(v: string | null): ExamPart | null {
  return VALID_PARTS.includes(v as ExamPart) ? (v as ExamPart) : null;
}

export function parseExamStreamParam(v: string | null): ExamStream | null {
  return VALID_STREAMS.includes(v as ExamStream) ? (v as ExamStream) : null;
}

export function appendPredictionScopeParams(
  params: URLSearchParams,
  opts: {
    examType?: ExamType | null;
    part?: ExamPart | null;
    stream?: ExamStream | null;
  }
) {
  if (opts.examType) params.set("examType", opts.examType);
  if (opts.part) params.set("part", opts.part);
  if (opts.stream) params.set("stream", opts.stream);
}
