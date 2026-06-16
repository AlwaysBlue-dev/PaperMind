import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai-providers";
import {
  defaultMarks,
  fetchPredictionById,
  fetchSubjectName,
  updatePredictionModelAnswer,
} from "@/lib/prediction/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const predictionId = body.predictionId as string | undefined;

    if (!predictionId) {
      return NextResponse.json(
        { error: "predictionId is required" },
        { status: 400 }
      );
    }

    const prediction = await fetchPredictionById(predictionId);
    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      );
    }

    if (prediction.model_answer) {
      return NextResponse.json({
        modelAnswer: prediction.model_answer,
        provider: "cached",
        cached: true,
      });
    }

    const subjectName = await fetchSubjectName(prediction.subject_id);
    const marks = prediction.marks ?? defaultMarks(prediction.question_type);

    const prompt = `You are an expert Pakistani board exam tutor. Write a model answer exactly as a top student would write it in a BISE/FBISE board exam, following Pakistani textbook style and terminology.

Question (${marks} marks, ${prediction.question_type}): ${prediction.question_text}
Subject: ${subjectName} | Chapter: ${prediction.chapter_name}

Format rules:
- 2-mark answers: 4-6 lines
- 5-mark answers: 150-200 words with numbered points
- 8+ mark answers: 300-350 words with clear structure, derivation steps, and a summary line
- Use plain text only — no markdown headers, but you can use numbered lists (1. 2. 3.) for steps
- Describe any diagrams in words (e.g. 'Diagram: a circuit showing...')`;

    const { text, provider } = await generateAIResponse(prompt);

    await updatePredictionModelAnswer(predictionId, text);

    return NextResponse.json({ modelAnswer: text, provider, cached: false });
  } catch (err) {
    console.error("Model answer API error:", err);
    return NextResponse.json(
      { error: "Failed to generate model answer" },
      { status: 500 }
    );
  }
}
