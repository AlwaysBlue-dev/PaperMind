import { createAdminClient } from "@/lib/supabase/admin";
import type { ExamType } from "@/lib/types/predict";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Fallback slug → display name (when UI uses catalog IDs, DB uses UUIDs) */
const BOARD_SLUG_TO_NAME: Record<string, string> = {
  "bise-karachi": "BISE Karachi",
};

const SUBJECT_SLUG_TO_NAME: Record<string, string> = {
  "khi-physics": "Physics",
  "khi-chemistry": "Chemistry",
  "khi-mathematics": "Mathematics",
  "khi-english": "English",
  "khi-urdu": "Urdu",
  "khi-islamiat": "Islamiat",
  "khi-pakistan-studies": "Pakistan Studies",
};

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export async function resolveBoardId(raw: string): Promise<string> {
  if (isUuid(raw)) return raw;

  const supabase = createAdminClient();
  const name = BOARD_SLUG_TO_NAME[raw] ?? raw;

  const { data, error } = await supabase
    .from("boards")
    .select("id")
    .eq("name", name)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      `Board "${name}" not found in database. Seed BISE Karachi in Supabase first.`
    );
  }
  return data.id as string;
}

export async function resolveSubjectId(
  raw: string,
  boardId: string,
  opts?: { part?: string | null; stream?: string | null }
): Promise<string> {
  if (isUuid(raw)) return raw;

  const supabase = createAdminClient();
  const name = SUBJECT_SLUG_TO_NAME[raw] ?? raw;

  let query = supabase
    .from("subjects")
    .select("id")
    .eq("name", name);

  try {
    query = query.eq("board_id", boardId);
    if (opts?.part) query = query.eq("part", opts.part);
    if (opts?.stream) query = query.eq("stream", opts.stream);
    const { data, error } = await query.limit(1).maybeSingle();
    if (error?.message?.includes("column")) throw error;
    if (data?.id) return data.id as string;
  } catch {
    const { data, error } = await supabase
      .from("subjects")
      .select("id")
      .eq("name", name)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data?.id) {
      throw new Error(
        `Subject "${name}" not found for this board. Seed subjects in Supabase first.`
      );
    }
    return data.id as string;
  }

  throw new Error(
    `Subject "${name}" not found for this board. Seed subjects in Supabase first.`
  );
}

type SubjectScopeOpts = {
  part?: string | null;
  stream?: string | null;
  examType?: ExamType | null;
};

/**
 * All subject row IDs to query for past papers/questions.
 * Includes the scoped subject plus legacy rows (null part/stream) that share
 * the same name — data imported before part/stream was added often uses those.
 */
export async function resolveSubjectQueryIds(
  primarySubjectId: string,
  boardId: string,
  opts?: SubjectScopeOpts
): Promise<string[]> {
  const supabase = createAdminClient();

  const { data: primary, error: primaryErr } = await supabase
    .from("subjects")
    .select("id, name, exam_type, part, stream")
    .eq("id", primarySubjectId)
    .maybeSingle();

  if (primaryErr) throw primaryErr;
  if (!primary?.name) return [primarySubjectId];

  let query = supabase
    .from("subjects")
    .select("id, part, stream")
    .eq("board_id", boardId)
    .eq("name", primary.name);

  if (primary.exam_type) {
    query = query.eq("exam_type", primary.exam_type);
  }

  const { data: siblings, error } = await query;
  if (error?.message?.includes("column")) {
    return [primarySubjectId];
  }
  if (error) throw error;

  const ids = new Set<string>([primarySubjectId]);
  for (const row of siblings ?? []) {
    if (row.id === primarySubjectId) continue;
    const legacy = !row.part && !row.stream;
    const exact =
      !!opts?.part &&
      !!opts?.stream &&
      row.part === opts.part &&
      row.stream === opts.stream;
    if (legacy || exact) {
      ids.add(row.id as string);
    }
  }

  return [...ids];
}
