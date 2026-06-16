import { createAdminClient } from "@/lib/supabase/admin";
import type { ExamType } from "@/lib/types/predict";
import type { ProfileData } from "@/lib/types/saved";

export async function ensureProfile(userId: string, email: string) {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({
      id: userId,
      email,
      predictions_viewed: 0,
    });
  }
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, exam_type, predictions_viewed, created_at, full_name, email")
    .eq("id", userId)
    .maybeSingle();

  const { count: savedCount } = await supabase
    .from("user_saved_predictions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: studiedCount } = await supabase
    .from("user_saved_predictions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_studied", true);

  const { data: authUser } = await supabase.auth.admin.getUserById(userId);

  const user = authUser.user;
  if (!user) return null;

  const fullName =
    (profile?.full_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";

  return {
    fullName,
    email: profile?.email ?? user.email ?? "",
    memberSince:
      profile?.created_at ?? user.created_at ?? new Date().toISOString(),
    examType: (profile?.exam_type as ExamType | null) ?? null,
    stats: {
      saved: savedCount ?? 0,
      studied: studiedCount ?? 0,
      predictionsViewed: profile?.predictions_viewed ?? 0,
    },
  };
}

export async function updateExamType(
  userId: string,
  examType: ExamType
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, exam_type: examType, updated_at: new Date().toISOString() });

  if (error) throw error;
}

export async function incrementPredictionsViewed(userId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("predictions_viewed")
    .eq("id", userId)
    .maybeSingle();

  const current = profile?.predictions_viewed ?? 0;
  await supabase
    .from("profiles")
    .upsert({
      id: userId,
      predictions_viewed: current + 1,
      updated_at: new Date().toISOString(),
    });
}

export async function deleteUserAccount(userId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("user_saved_predictions").delete().eq("user_id", userId);
  await supabase.from("profiles").delete().eq("id", userId);
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
}
