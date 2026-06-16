"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  EXAM_OPTIONS,
  isBoardEnabled,
  isExamTypeEnabled,
  isPartEnabled,
  isStreamEnabled,
  isSubjectEnabled,
  requiresPartAndStream,
} from "@/components/predict/constants";
import { GenerateButton } from "@/components/predict/GenerateButton";
import {
  SelectionCard,
  SelectionGrid,
  YearPills,
} from "@/components/predict/SelectionCards";
import { StepIndicator } from "@/components/predict/StepIndicator";
import { usePredictAutoDefaults } from "@/components/predict/usePredictAutoDefaults";
import {
  useBoards,
  useExamScope,
  useSubjects,
} from "@/components/predict/usePredictData";
import type { ExamPart, ExamStream, ExamType, YearRange } from "@/lib/types/predict";

type PredictFormMobileProps = {
  examType: ExamType | null;
  boardId: string | null;
  part: ExamPart | null;
  stream: ExamStream | null;
  subjectId: string | null;
  yearRange: YearRange | null;
  onExamChange: (v: ExamType) => void;
  onBoardChange: (v: string) => void;
  onPartChange: (v: ExamPart) => void;
  onStreamChange: (v: ExamStream) => void;
  onSubjectChange: (v: string) => void;
  onYearRangeChange: (v: YearRange) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isComplete: boolean;
  hydrated?: boolean;
};

const STEP_TITLES = [
  "Exam type",
  "Board",
  "Part",
  "Stream / group",
  "Subject",
  "Year range",
];

const TOTAL_STEPS = STEP_TITLES.length;

export function PredictFormMobile({
  examType,
  boardId,
  part,
  stream,
  subjectId,
  yearRange,
  onExamChange,
  onBoardChange,
  onPartChange,
  onStreamChange,
  onSubjectChange,
  onYearRangeChange,
  onGenerate,
  isLoading,
  isComplete,
  hydrated = true,
}: PredictFormMobileProps) {
  const [step, setStep] = useState(1);
  const scopeFlow = requiresPartAndStream(examType);
  const { boards, loading: loadingBoards } = useBoards(examType, part, stream);
  const { parts, streams, loading: loadingScope } = useExamScope(
    examType,
    boardId,
    part
  );
  const { subjects, loading: loadingSubjects } = useSubjects(
    examType,
    boardId,
    part,
    stream
  );

  usePredictAutoDefaults({
    enabled: hydrated,
    examType,
    boardId,
    part,
    stream,
    subjectId,
    boards,
    parts,
    streams,
    subjects,
    onBoardChange,
    onPartChange,
    onStreamChange,
    onSubjectChange,
  });

  function handleExamSelect(type: ExamType) {
    if (!isExamTypeEnabled(type)) return;
    onExamChange(type);
    setStep(2);
  }

  function handleBoardSelect(id: string) {
    const board = boards.find((b) => b.id === id);
    if (!board || !isBoardEnabled(board)) return;
    onBoardChange(id);
    setStep(scopeFlow ? 3 : 5);
  }

  function handlePartSelect(id: ExamPart) {
    if (!isPartEnabled(id, examType)) return;
    onPartChange(id);
    setStep(4);
  }

  function handleStreamSelect(id: ExamStream) {
    if (!isStreamEnabled(id, examType, part)) return;
    onStreamChange(id);
    setStep(5);
  }

  function handleSubjectSelect(id: string) {
    const subject = subjects.find((s) => s.id === id);
    if (!subject || !isSubjectEnabled(subject, { examType, part, stream })) {
      return;
    }
    onSubjectChange(id);
    setStep(6);
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="flex flex-col md:hidden">
      <div className="border-b border-border px-5 py-4">
        <h1 className="font-heading text-xl font-bold">Predict</h1>
        <p className="mt-0.5 text-sm text-foreground-muted">
          Step {step} of {TOTAL_STEPS} — {STEP_TITLES[step - 1]}
        </p>
      </div>

      <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

      <div className="px-5 pb-36">
        <div className="mb-4 flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="pm-focus-ring flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <h2 className="font-heading text-lg font-semibold">
            {STEP_TITLES[step - 1]}
          </h2>
        </div>

        {step === 1 && (
          <SelectionGrid>
            {EXAM_OPTIONS.map(({ type, label, subtitle, icon: Icon, enabled }) => (
              <SelectionCard
                key={type}
                label={label}
                subtitle={subtitle}
                selected={examType === type}
                comingSoon={!enabled}
                onClick={() => handleExamSelect(type)}
                icon={<Icon className="h-5 w-5" />}
              />
            ))}
          </SelectionGrid>
        )}

        {step === 2 && (
          <div className="space-y-2.5">
            {loadingBoards ? (
              <p className="text-sm text-foreground-muted">Loading boards…</p>
            ) : boards.length === 0 ? (
              <p className="text-sm text-foreground-muted">No boards found.</p>
            ) : (
              boards.map((b) => (
                <SelectionCard
                  key={b.id}
                  label={b.name}
                  selected={boardId === b.id}
                  comingSoon={!isBoardEnabled(b)}
                  onClick={() => handleBoardSelect(b.id)}
                />
              ))
            )}
          </div>
        )}

        {step === 3 && (
          <SelectionGrid>
            {loadingScope ? (
              <p className="col-span-2 text-sm text-foreground-muted">
                Loading parts…
              </p>
            ) : (
              parts.map((p) => (
                <SelectionCard
                  key={p.id}
                  label={p.label}
                  selected={part === p.id}
                  comingSoon={!isPartEnabled(p.id as ExamPart, examType)}
                  onClick={() => handlePartSelect(p.id as ExamPart)}
                />
              ))
            )}
          </SelectionGrid>
        )}

        {step === 4 && (
          <div className="space-y-2.5">
            {loadingScope ? (
              <p className="text-sm text-foreground-muted">Loading streams…</p>
            ) : (
              streams.map((s) => (
                <SelectionCard
                  key={s.id}
                  label={s.label}
                  selected={stream === s.id}
                  comingSoon={
                    !isStreamEnabled(s.id as ExamStream, examType, part)
                  }
                  onClick={() => handleStreamSelect(s.id as ExamStream)}
                />
              ))
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2.5">
            {loadingSubjects ? (
              <p className="text-sm text-foreground-muted">Loading subjects…</p>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-foreground-muted">No subjects found.</p>
            ) : (
              subjects.map((s) => (
                <SelectionCard
                  key={s.id}
                  label={s.name}
                  selected={subjectId === s.id}
                  comingSoon={!isSubjectEnabled(s, { examType, part, stream })}
                  onClick={() => handleSubjectSelect(s.id)}
                />
              ))
            )}
          </div>
        )}

        {step === 6 && (
          <YearPills value={yearRange} onChange={onYearRangeChange} />
        )}
      </div>

      <div className="predict-mobile-cta fixed inset-x-0 z-40 border-t border-border bg-nav-bg px-5 py-3 backdrop-blur-lg">
        <GenerateButton
          disabled={!isComplete}
          isLoading={isLoading}
          onClick={onGenerate}
        />
      </div>
    </div>
  );
}
