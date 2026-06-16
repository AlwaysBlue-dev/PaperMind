import type { ExamPart, ExamStream, ExamType } from "@/lib/types/predict";

export type Paper = {
  id: string;
  boardId: string;
  boardName: string;
  subjectId: string;
  subjectName: string;
  examType: ExamType;
  part: ExamPart | null;
  stream: ExamStream | null;
  classLevel: string;
  year: number;
  questionCount: number;
  pdfPath: string | null;
  downloadUrl: string | null;
};

export type PapersResponse = {
  papers: Paper[];
  total: number;
  page: number;
  hasMore: boolean;
};
