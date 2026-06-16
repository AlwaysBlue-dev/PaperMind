import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { removeSavedPrediction } from "@/lib/saved/db";

export async function DELETE(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const savedId = body.savedId as string | undefined;

  if (!savedId) {
    return NextResponse.json(
      { error: "savedId is required" },
      { status: 400 }
    );
  }

  try {
    const result = await removeSavedPrediction(user.id, savedId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Remove saved error:", err);
    return NextResponse.json(
      { error: "Failed to remove saved prediction" },
      { status: 500 }
    );
  }
}
