import type { Board, ExamPart, ExamStream, ExamType } from "@/lib/types/predict";

/** Mirrors Supabase seed; used when API is unavailable or to fill gaps */
export const FALLBACK_BOARDS: Board[] = [
  // —— FSc ——
  {
    id: "bise-karachi",
    name: "BISE Karachi",
    exam_type: "fsc",
    is_active: true,
  },
  {
    id: "fbise-fsc",
    name: "FBISE",
    exam_type: "fsc",
    is_active: false,
  },
  // —— Matric ——
  { id: "bise-lahore", name: "BISE Lahore", exam_type: "matric", is_active: false },
  {
    id: "bise-rawalpindi",
    name: "BISE Rawalpindi",
    exam_type: "matric",
    is_active: false,
  },
  { id: "bise-multan", name: "BISE Multan", exam_type: "matric", is_active: false },
  {
    id: "bise-peshawar",
    name: "BISE Peshawar",
    exam_type: "matric",
    is_active: false,
  },
  // —— CSS ——
  { id: "fpsc", name: "FPSC (CSS)", exam_type: "css", is_active: false },
];

export type BoardFilter = {
  examType: ExamType;
  part?: ExamPart | null;
  stream?: ExamStream | null;
};

export function filterFallbackBoards({ examType }: BoardFilter): Board[] {
  // MDCAT is a national entry test — no regional board
  if (examType === "mdcat") return [];
  return FALLBACK_BOARDS.filter((b) => b.exam_type === examType);
}
