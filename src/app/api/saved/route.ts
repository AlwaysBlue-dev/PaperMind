import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import {
  fetchSavedPredictionIds,
  fetchUserSavedPredictions,
} from "@/lib/saved/db";

export async function GET(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  try {
    if (idsParam) {
      const ids = idsParam.split(",").filter(Boolean);
      const savedIds = await fetchSavedPredictionIds(user.id, ids);
      return NextResponse.json({ savedIds });
    }

    const items = await fetchUserSavedPredictions(user.id);
    const subjects = [
      ...new Map(
        items.map((i) => [i.subjectId, { id: i.subjectId, name: i.subjectName }])
      ).values(),
    ];
    const studiedCount = items.filter((i) => i.isStudied).length;

    return NextResponse.json({
      items,
      studiedCount,
      totalCount: items.length,
      subjects,
    });
  } catch (err) {
    console.error("Fetch saved error:", err);
    return NextResponse.json(
      { error: "Failed to fetch saved predictions" },
      { status: 500 }
    );
  }
}
