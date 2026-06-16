import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import {
  deleteUserAccount,
  ensureProfile,
  getProfile,
  updateExamType,
} from "@/lib/profile/db";
import type { ExamType } from "@/lib/types/predict";

const VALID_EXAMS: ExamType[] = ["matric", "fsc", "css", "mdcat"];

export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureProfile(user.id, user.email ?? "");
    const profile = await getProfile(user.id);
    return NextResponse.json(profile);
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const examType = body.examType as ExamType | undefined;

  if (!examType || !VALID_EXAMS.includes(examType)) {
    return NextResponse.json(
      { error: "Valid examType is required" },
      { status: 400 }
    );
  }

  try {
    await ensureProfile(user.id, user.email ?? "");
    await updateExamType(user.id, examType);
    return NextResponse.json({ success: true, examType });
  } catch (err) {
    console.error("Profile PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteUserAccount(user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
