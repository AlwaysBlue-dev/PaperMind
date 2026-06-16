import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { updateStudiedStatus } from "@/lib/saved/db";

export async function PATCH(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const savedId = body.savedId as string | undefined;
  const isStudied = body.isStudied as boolean | undefined;

  if (!savedId || typeof isStudied !== "boolean") {
    return NextResponse.json(
      { error: "savedId and isStudied are required" },
      { status: 400 }
    );
  }

  try {
    await updateStudiedStatus(user.id, savedId, isStudied);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update studied error:", err);
    return NextResponse.json(
      { error: "Failed to update studied status" },
      { status: 500 }
    );
  }
}
