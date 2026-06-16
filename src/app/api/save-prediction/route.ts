import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { toggleSavePrediction } from "@/lib/saved/db";

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const predictionId = body.predictionId as string | undefined;

  if (!predictionId) {
    return NextResponse.json(
      { error: "predictionId is required" },
      { status: 400 }
    );
  }

  try {
    const result = await toggleSavePrediction(user.id, predictionId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Save prediction error:", err);
    return NextResponse.json(
      { error: "Failed to save prediction" },
      { status: 500 }
    );
  }
}
