import type { QuestionType } from "@/lib/types/predict";

/** MCQ only clusters/matches with MCQ; short and long may pair together. */
export function typesCompatible(
  a: QuestionType,
  b: QuestionType
): boolean {
  if (a === b) return true;
  if (a === "mcq" || b === "mcq") return false;
  return (
    (a === "short" || a === "long") &&
    (b === "short" || b === "long")
  );
}

export function isWrittenType(type: QuestionType): boolean {
  return type === "short" || type === "long";
}
