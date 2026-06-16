"use client";

import {
  EXAM_OPTIONS,
  isBoardEnabled,
  isExamTypeEnabled,
  isPartEnabled,
  isStreamEnabled,
  isSubjectEnabled,
  requiresPartAndStream,
  YEAR_RANGE_OPTIONS,
} from "@/components/predict/constants";
import { GenerateButton } from "@/components/predict/GenerateButton";
import { usePredictAutoDefaults } from "@/components/predict/usePredictAutoDefaults";
import { useBoards, useExamScope, useSubjects } from "@/components/predict/usePredictData";
import type { ExamPart, ExamStream, ExamType, YearRange } from "@/lib/types/predict";

type PredictFormDesktopProps = {
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
};

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="predict-select pm-focus-ring min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
            {o.disabled ? " (Coming soon)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PredictFormDesktop({
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
}: PredictFormDesktopProps) {
  const scopeFlow = requiresPartAndStream(examType);
  const { boards } = useBoards(examType, part, stream);
  const { parts, streams, loading: loadingScope } = useExamScope(
    examType,
    boardId,
    part
  );
  const { subjects } = useSubjects(examType, boardId, part, stream);

  usePredictAutoDefaults({
    enabled: true,
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

  return (
    <div className="hidden w-[360px] shrink-0 flex-col border-r border-border md:flex">
      <div className="sticky top-16 flex max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto px-5 py-6">
        <h1 className="font-heading text-xl font-bold">Predict</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          BISE Karachi · FSc Part 1 · Pre-Engineering · Chemistry
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <SelectField
            label="Exam type"
            value={examType ?? ""}
            onChange={(v) => {
              if (isExamTypeEnabled(v as ExamType)) onExamChange(v as ExamType);
            }}
            placeholder="Select exam"
            options={EXAM_OPTIONS.map((e) => ({
              value: e.type,
              label: e.label,
              disabled: !e.enabled,
            }))}
          />

          <SelectField
            label="Board"
            value={boardId ?? ""}
            onChange={(v) => {
              const board = boards.find((b) => b.id === v);
              if (board && isBoardEnabled(board)) onBoardChange(v);
            }}
            placeholder="Select board"
            disabled={!examType}
            options={boards.map((b) => ({
              value: b.id,
              label: b.name,
              disabled: !isBoardEnabled(b),
            }))}
          />

          {scopeFlow && (
            <>
              <SelectField
                label="Part"
                value={part ?? ""}
                onChange={(v) => {
                  if (isPartEnabled(v as ExamPart, examType))
                    onPartChange(v as ExamPart);
                }}
                placeholder={loadingScope ? "Loading…" : "Select part"}
                disabled={!boardId || loadingScope}
                options={parts.map((p) => ({
                  value: p.id,
                  label: p.label,
                  disabled: !isPartEnabled(p.id as ExamPart, examType),
                }))}
              />

              <SelectField
                label="Stream / group"
                value={stream ?? ""}
                onChange={(v) => {
                  if (isStreamEnabled(v as ExamStream, examType, part))
                    onStreamChange(v as ExamStream);
                }}
                placeholder={loadingScope ? "Loading…" : "Select stream"}
                disabled={!part || loadingScope}
                options={streams.map((s) => ({
                  value: s.id,
                  label: s.label,
                  disabled: !isStreamEnabled(
                    s.id as ExamStream,
                    examType,
                    part
                  ),
                }))}
              />
            </>
          )}

          <SelectField
            label="Subject"
            value={subjectId ?? ""}
            onChange={(v) => {
              const subject = subjects.find((s) => s.id === v);
              if (
                subject &&
                isSubjectEnabled(subject, { examType, part, stream })
              ) {
                onSubjectChange(v);
              }
            }}
            placeholder="Select subject"
            disabled={!boardId || (scopeFlow && (!part || !stream))}
            options={subjects.map((s) => ({
              value: s.id,
              label: s.name,
              disabled: !isSubjectEnabled(s, { examType, part, stream }),
            }))}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Year range
            </label>
            <div className="flex flex-col gap-2">
              {YEAR_RANGE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onYearRangeChange(value)}
                  className={`pm-focus-ring min-h-10 rounded-xl border px-3 text-left text-sm font-medium transition-all duration-200 ${
                    yearRange === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <GenerateButton
            disabled={!isComplete}
            isLoading={isLoading}
            onClick={onGenerate}
          />
        </div>
      </div>
    </div>
  );
}
