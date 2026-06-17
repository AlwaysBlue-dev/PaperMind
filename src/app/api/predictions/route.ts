import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import {
  parseExamPartParam,
  parseExamStreamParam,
  parseExamTypeParam,
} from "@/lib/exam-params";
import { incrementPredictionsViewed } from "@/lib/profile/db";
import {
  computeChapterHeatmap,
  generatePredictions,
  getSubjectStats,
} from "@/lib/prediction-engine";
import {
  resolveBoardId,
  resolveSubjectId,
  resolveSubjectQueryIds,
} from "@/lib/prediction/resolve-ids";
import type { QuestionScope } from "@/lib/prediction/db";
import {
  countQuestions,
  fetchCachedPredictions,
  formatDbError,
  mapPredictionRow,
  savePredictions,
} from "@/lib/prediction/db";
import { resolveTargetYear } from "@/lib/predict/target-year";
import type { YearRange } from "@/lib/types/predict";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examType = parseExamTypeParam(searchParams.get("examType"));
  const subjectIdRaw = searchParams.get("subjectId");
  const boardIdRaw = searchParams.get("boardId");
  const part = parseExamPartParam(searchParams.get("part"));
  const stream = parseExamStreamParam(searchParams.get("stream"));
  const targetYear = resolveTargetYear(searchParams.get("targetYear"));
  const skipCache =
    searchParams.get("refresh") === "1" ||
    searchParams.get("regenerate") === "1";
  const yearRangeParam = parseInt(searchParams.get("yearRange") ?? "10", 10);
  const yearRange = ([5, 10] as YearRange[]).includes(
    yearRangeParam as YearRange
  )
    ? (yearRangeParam as YearRange)
    : 10;

  const emptyMeta = {
    papersAnalysed: 0,
    questionsFound: 0,
    yearsCovered: 0,
    chapters: [] as {
      chapterNumber: number;
      chapterName: string;
      yearsAppeared: number;
      windowYears: number;
      rate: number;
    }[],
  };

  if (!examType || !subjectIdRaw || !boardIdRaw) {
    return NextResponse.json(
      {
        noData: true,
        message: "examType, subjectId, and boardId are required",
        predictions: [],
        meta: emptyMeta,
      },
      { status: 400 }
    );
  }

  if ((examType === "fsc" || examType === "matric") && (!part || !stream)) {
    return NextResponse.json(
      {
        noData: true,
        message: "part and stream are required for this exam type",
        predictions: [],
        meta: emptyMeta,
      },
      { status: 400 }
    );
  }

  if (!process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({
      noData: true,
      message:
        "Database connection not configured. Please set SUPABASE_SERVICE_KEY.",
      predictions: [],
      meta: emptyMeta,
    });
  }

  try {
    const boardId = await resolveBoardId(boardIdRaw);
    const subjectId = await resolveSubjectId(subjectIdRaw, boardId, {
      part,
      stream,
    });
    const subjectQueryIds = await resolveSubjectQueryIds(subjectId, boardId, {
      part,
      stream,
      examType,
    });

    const scope: QuestionScope = {
      examType,
      boardId,
      subjectId,
      part,
      stream,
      boardIds: [...new Set([boardIdRaw, boardId])],
      subjectIds: [...new Set([subjectIdRaw, ...subjectQueryIds])],
    };

    const questionCount = await countQuestions(scope, yearRange, targetYear);
    if (questionCount < 10) {
      return NextResponse.json({
        noData: true,
        message:
          "We're still building our database for this selection. We need at least 10 past questions in your chosen year range.",
        predictions: [],
        meta: { ...emptyMeta, questionsFound: questionCount },
        examType,
        part: part ?? undefined,
        stream: stream ?? undefined,
      });
    }

    const cached = skipCache
      ? []
      : await fetchCachedPredictions(scope, targetYear, yearRange);

    let predictionRows = cached;

    if (predictionRows.length === 0) {
      const generated = await generatePredictions(scope, targetYear, yearRange);

      if (generated.length === 0) {
        return NextResponse.json({
          noData: true,
          message:
            "Not enough past paper data in the selected year range to generate predictions.",
          predictions: [],
          meta: { ...emptyMeta, questionsFound: questionCount },
          examType,
          part: part ?? undefined,
          stream: stream ?? undefined,
        });
      }

      predictionRows = await savePredictions(
        generated.map((p) => ({
          exam_type: scope.examType,
          part: scope.part ?? null,
          stream: scope.stream ?? null,
          subject_id: scope.subjectId,
          board_id: scope.boardId,
          target_year: p.target_year,
          year_range: yearRange,
          question_text: p.questionText,
          chapter_name: p.chapterName,
          chapter_number: p.chapterNumber,
          question_type: p.questionType,
          probability_score: p.probabilityScore,
          frequency_count: p.frequencyCount,
          total_years: p.totalYears,
          years_appeared: p.yearsAppeared,
          last_appeared_year: p.lastAppearedYear,
          trend: p.trend,
          is_syllabus_flagged: p.isSyllabusFlagged,
          marks: p.marks,
        }))
      );
    }

    const [stats, chapters] = await Promise.all([
      getSubjectStats(scope, targetYear, yearRange),
      computeChapterHeatmap(scope, targetYear, yearRange),
    ]);

    const patternContext = stats.yearWindow
      ? { targetYear, maxYear: stats.yearWindow.to }
      : undefined;

    const user = await getServerUser();
    if (user) {
      incrementPredictionsViewed(user.id).catch(() => {});
    }

    return NextResponse.json({
      predictions: predictionRows.map((row) =>
        mapPredictionRow(row, patternContext)
      ),
      meta: {
        ...stats,
        chapters,
      },
      targetYear,
      examType,
      subjectId,
      boardId,
      part: part ?? undefined,
      stream: stream ?? undefined,
      yearRange,
    });
  } catch (err) {
    const detail = formatDbError(err);
    console.error("Predictions API error:", err);
    return NextResponse.json({
      noData: true,
      message:
        detail.includes("not found") || detail.includes("Seed")
          ? detail
          : `Failed to generate predictions: ${detail || "Please try again."}`,
      predictions: [],
      meta: emptyMeta,
      examType,
      part: part ?? undefined,
      stream: stream ?? undefined,
    });
  }
}
