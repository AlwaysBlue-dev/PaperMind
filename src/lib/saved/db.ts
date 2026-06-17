import { createAdminClient } from "@/lib/supabase/admin";
import { firstRelation } from "@/lib/supabase/relation";
import { mapPredictionRow } from "@/lib/prediction/db";
import type { SavedPredictionItem } from "@/lib/types/saved";

type PredictionJoin = {
  id: string;
  subject_id: string;
  board_id: string;
  target_year: number;
  question_text: string;
  chapter_name: string;
  chapter_number: number;
  question_type: string;
  probability_score: number;
  frequency_count: number;
  total_years: number;
  years_appeared: number[];
  last_appeared_year: number;
  trend: string;
  is_syllabus_flagged: boolean;
  marks: number | null;
  subjects: { id: string; name: string } | { id: string; name: string }[] | null;
};

type SavedRow = {
  id: string;
  user_id: string;
  prediction_id: string;
  is_studied: boolean;
  created_at: string;
  predictions: PredictionJoin & {
    subjects: { id: string; name: string } | null;
  };
};

type RawSavedRow = Omit<SavedRow, "predictions"> & {
  predictions: PredictionJoin | PredictionJoin[];
};

function normalizeSavedRow(row: RawSavedRow): SavedRow | null {
  const prediction = firstRelation(row.predictions);
  if (!prediction) return null;
  return {
    ...row,
    predictions: {
      ...prediction,
      subjects: firstRelation(prediction.subjects),
    },
  };
}

export async function toggleSavePrediction(
  userId: string,
  predictionId: string
): Promise<{ saved: boolean; saveCount: number }> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("user_saved_predictions")
    .select("id")
    .eq("user_id", userId)
    .eq("prediction_id", predictionId)
    .maybeSingle();

  const { data: prediction } = await supabase
    .from("predictions")
    .select("save_count")
    .eq("id", predictionId)
    .single();

  const currentCount = prediction?.save_count ?? 0;

  if (existing) {
    await supabase
      .from("user_saved_predictions")
      .delete()
      .eq("id", existing.id);

    const newCount = Math.max(0, currentCount - 1);
    await supabase
      .from("predictions")
      .update({ save_count: newCount })
      .eq("id", predictionId);

    return { saved: false, saveCount: newCount };
  }

  await supabase.from("user_saved_predictions").insert({
    user_id: userId,
    prediction_id: predictionId,
    is_studied: false,
  });

  const newCount = currentCount + 1;
  await supabase
    .from("predictions")
    .update({ save_count: newCount })
    .eq("id", predictionId);

  return { saved: true, saveCount: newCount };
}

export async function fetchSavedPredictionIds(
  userId: string,
  predictionIds: string[]
): Promise<string[]> {
  if (predictionIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("user_saved_predictions")
    .select("prediction_id")
    .eq("user_id", userId)
    .in("prediction_id", predictionIds);

  return (data ?? []).map((r) => r.prediction_id);
}

export async function fetchUserSavedPredictions(
  userId: string
): Promise<SavedPredictionItem[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("user_saved_predictions")
    .select(
      `
      id,
      user_id,
      prediction_id,
      is_studied,
      created_at,
      predictions (
        id,
        subject_id,
        board_id,
        target_year,
        question_text,
        chapter_name,
        chapter_number,
        question_type,
        probability_score,
        frequency_count,
        total_years,
        years_appeared,
        last_appeared_year,
        trend,
        is_syllabus_flagged,
        marks,
        subjects ( id, name )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as RawSavedRow[])
    .map(normalizeSavedRow)
    .filter((row): row is SavedRow => row !== null)
    .map((row) => {
      const p = row.predictions;
      const mapped = mapPredictionRow({
        ...p,
        board_id: p.board_id,
        target_year: p.target_year,
        question_text: p.question_text,
        chapter_name: p.chapter_name,
        chapter_number: p.chapter_number,
        question_type: p.question_type as "short" | "long" | "mcq",
        probability_score: p.probability_score,
        frequency_count: p.frequency_count,
        total_years: p.total_years,
        years_appeared: p.years_appeared,
        last_appeared_year: p.last_appeared_year,
        trend: p.trend,
        is_syllabus_flagged: p.is_syllabus_flagged,
        marks: p.marks,
        model_answer: null,
        model_answer_generated_at: null,
        created_at: row.created_at,
        subject_id: p.subject_id,
      }, {
        targetYear: p.target_year,
        maxYear: p.target_year - 1,
      });

      return {
        ...mapped,
        savedId: row.id,
        isStudied: row.is_studied,
        subjectId: p.subject_id,
        subjectName: p.subjects?.name ?? "Unknown subject",
        savedAt: row.created_at,
      };
    });
}

export async function updateStudiedStatus(
  userId: string,
  savedId: string,
  isStudied: boolean
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("user_saved_predictions")
    .update({ is_studied: isStudied })
    .eq("id", savedId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function removeSavedPrediction(
  userId: string,
  savedId: string
): Promise<{ predictionId: string }> {
  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("user_saved_predictions")
    .select("prediction_id")
    .eq("id", savedId)
    .eq("user_id", userId)
    .single();

  if (!row) throw new Error("Not found");

  await supabase
    .from("user_saved_predictions")
    .delete()
    .eq("id", savedId)
    .eq("user_id", userId);

  const { data: prediction } = await supabase
    .from("predictions")
    .select("save_count")
    .eq("id", row.prediction_id)
    .single();

  const newCount = Math.max(0, (prediction?.save_count ?? 1) - 1);
  await supabase
    .from("predictions")
    .update({ save_count: newCount })
    .eq("id", row.prediction_id);

  return { predictionId: row.prediction_id };
}
