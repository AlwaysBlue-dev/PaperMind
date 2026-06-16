import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { STATS_FALLBACK, type StatsResponse } from "@/lib/types/stats";

export type { StatsResponse };

const FALLBACK = STATS_FALLBACK;

async function countTable(table: string): Promise<number | null> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json(FALLBACK);
  }

  const [papers, questions, predictions, boards] = await Promise.all([
    countTable("papers"),
    countTable("questions"),
    countTable("predictions"),
    countTable("boards"),
  ]);

  const stats: StatsResponse = {
    papers: papers ?? FALLBACK.papers,
    questions: questions ?? FALLBACK.questions,
    predictions: predictions ?? FALLBACK.predictions,
    boards: boards ?? FALLBACK.boards,
  };

  return NextResponse.json(stats, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
