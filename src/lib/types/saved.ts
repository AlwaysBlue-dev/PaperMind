import type { ExamType } from "@/lib/types/predict";
import type { Prediction, Trend } from "@/lib/types/predict";

export type SavedPredictionItem = Prediction & {
  savedId: string;
  isStudied: boolean;
  subjectId: string;
  subjectName: string;
  savedAt: string;
};

export type SavedListResponse = {
  items: SavedPredictionItem[];
  studiedCount: number;
  totalCount: number;
  subjects: { id: string; name: string }[];
};

export type ProfileData = {
  fullName: string;
  email: string;
  memberSince: string;
  examType: ExamType | null;
  stats: {
    saved: number;
    studied: number;
    predictionsViewed: number;
  };
};

export type StudiedFilter = "all" | "studied" | "not_studied";

export function mapTrend(trend: string): Trend {
  if (trend === "rising" || trend === "new") return "up";
  if (trend === "falling") return "down";
  return "flat";
}
