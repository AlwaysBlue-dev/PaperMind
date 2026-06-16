import type { ExamPart, ExamStream, ExamType, Subject } from "@/lib/types/predict";

const SUBJECTS: Subject[] = [
  {
    id: "khi-physics",
    name: "Physics",
    board_id: "bise-karachi",
    exam_type: "fsc",
    part: "part1",
    stream: "pre_engineering",
    is_active: false,
  },
  {
    id: "khi-chemistry",
    name: "Chemistry",
    board_id: "bise-karachi",
    exam_type: "fsc",
    part: "part1",
    stream: "pre_engineering",
    is_active: true,
  },
  {
    id: "khi-mathematics",
    name: "Mathematics",
    board_id: "bise-karachi",
    exam_type: "fsc",
    part: "part1",
    stream: "pre_engineering",
    is_active: false,
  },
  {
    id: "khi-english",
    name: "English",
    board_id: "bise-karachi",
    exam_type: "fsc",
    part: "part1",
    stream: "pre_engineering",
    is_active: false,
  },
  {
    id: "khi-urdu",
    name: "Urdu",
    board_id: "bise-karachi",
    exam_type: "fsc",
    part: "part1",
    stream: "pre_engineering",
    is_active: false,
  },
  {
    id: "khi-islamiat",
    name: "Islamiat",
    board_id: "bise-karachi",
    exam_type: "fsc",
    part: "part1",
    stream: "pre_engineering",
    is_active: false,
  },
  {
    id: "khi-pakistan-studies",
    name: "Pakistan Studies",
    board_id: "bise-karachi",
    exam_type: "fsc",
    part: "part1",
    stream: "pre_engineering",
    is_active: false,
  },
  // MDCAT — national entry test (no board)
  {
    id: "mdcat-biology",
    name: "Biology",
    board_id: "",
    exam_type: "mdcat",
    is_active: false,
  },
  {
    id: "mdcat-chemistry",
    name: "Chemistry",
    board_id: "",
    exam_type: "mdcat",
    is_active: false,
  },
  {
    id: "mdcat-physics",
    name: "Physics",
    board_id: "",
    exam_type: "mdcat",
    is_active: false,
  },
  {
    id: "mdcat-english",
    name: "English",
    board_id: "",
    exam_type: "mdcat",
    is_active: false,
  },
  {
    id: "mdcat-logical-reasoning",
    name: "Logical Reasoning",
    board_id: "",
    exam_type: "mdcat",
    is_active: false,
  },
];

export type SubjectFilter = {
  examType: ExamType;
  boardId?: string | null;
  part?: ExamPart | null;
  stream?: ExamStream | null;
};

export function filterFallbackSubjects({
  examType,
  boardId,
  part,
  stream,
}: SubjectFilter): Subject[] {
  if (examType === "mdcat") {
    return SUBJECTS.filter((s) => s.exam_type === "mdcat");
  }

  return SUBJECTS.filter((s) => {
    if (s.exam_type !== examType || s.board_id !== boardId) return false;
    if (part && s.part && s.part !== part) return false;
    if (stream && s.stream && s.stream !== stream) return false;
    return true;
  });
}

export function filterFallbackSubjectsByExam(examType: ExamType): Subject[] {
  return SUBJECTS.filter((s) => s.exam_type === examType);
}
