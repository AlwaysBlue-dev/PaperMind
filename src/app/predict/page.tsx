import type { Metadata } from "next";
import { Suspense } from "react";
import { PredictPageClient } from "@/components/predict/PredictPageClient";
import { PredictLoadingSkeleton } from "@/components/ui/PageSkeletons";

export const metadata: Metadata = {
  title: "Predict — AI Exam Question Predictions",
  description:
    "Select your exam, board, and subject to generate AI-powered question predictions from years of past papers.",
};

export default function PredictPage() {
  return (
    <Suspense fallback={<PredictLoadingSkeleton />}>
      <PredictPageClient />
    </Suspense>
  );
}
