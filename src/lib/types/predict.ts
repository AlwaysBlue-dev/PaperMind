export type ExamType = "matric" | "fsc" | "css" | "mdcat";

/** FSc year: Part 1 = Class 11, Part 2 = Class 12 */
export type ExamPart = "part1" | "part2";

/** FSc faculty / group; Matric science groups use biology & computer_science */
export type ExamStream =
  | "pre_engineering"
  | "pre_medical"
  | "commerce"
  | "arts"
  | "computer_science"
  | "biology";

export type YearRange = 5 | 10;

export type QuestionType = "short" | "long" | "mcq";

export type Trend = "up" | "down" | "flat";

export type PatternHint = "due" | "cyclical" | "regular";

export type Board = {
  id: string;
  name: string;
  exam_type: ExamType;
  part?: ExamPart | null;
  stream?: ExamStream | null;
  is_active?: boolean;
};

export type Subject = {
  id: string;
  name: string;
  board_id: string;
  exam_type: ExamType;
  part?: ExamPart | null;
  stream?: ExamStream | null;
  is_active?: boolean;
};

export type Prediction = {
  id: string;
  questionText: string;
  chapterName: string;
  chapterNumber: number;
  questionType: QuestionType;
  probabilityScore: number;
  frequencyCount: number;
  totalYears: number;
  yearsAppeared: number[];
  lastAppearedYear: number;
  trend: Trend;
  patternHint?: PatternHint | null;
  isSyllabusFlagged: boolean;
  marks?: number;
};

export type PredictionMeta = {
  papersAnalysed: number;
  questionsFound: number;
  yearsCovered: number;
  /** Inclusive years of past papers used in this analysis */
  yearWindow?: { from: number; to: number };
  chapters: ChapterFrequency[];
};

export type ChapterFrequency = {
  chapterNumber: number;
  chapterName: string;
  /** Distinct exam years this chapter appeared in the analysis window */
  yearsAppeared: number;
  /** Distinct exam years with any questions in the window */
  windowYears: number;
  /** Share of exam years tested: yearsAppeared / windowYears (0–100) */
  rate: number;
};

export type PredictionsResponse = {
  predictions: Prediction[];
  meta: PredictionMeta;
  noData?: boolean;
  message?: string;
  targetYear?: number;
  yearRange?: YearRange;
  examType?: ExamType;
  subjectId?: string;
  boardId?: string;
  part?: ExamPart;
  stream?: ExamStream;
};

export type SortOption = "probability" | "chapter" | "recency";

export type FilterOption = "all" | "short" | "long" | "mcq";

/** Selection context passed to prediction APIs */
export type ExamSelection = {
  examType: ExamType;
  boardId: string;
  subjectId: string;
  part?: ExamPart | null;
  stream?: ExamStream | null;
  yearRange: YearRange;
};
