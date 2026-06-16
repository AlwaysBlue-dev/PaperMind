"use client";

import { useEffect } from "react";
import {
  isBoardEnabled,
  isPartEnabled,
  isStreamEnabled,
  isSubjectEnabled,
  LAUNCH_DEFAULTS,
} from "@/components/predict/constants";
import type { Board, ExamPart, ExamStream, ExamType, Subject } from "@/lib/types/predict";

type UsePredictAutoDefaultsArgs = {
  enabled: boolean;
  examType: ExamType | null;
  boardId: string | null;
  part: ExamPart | null;
  stream: ExamStream | null;
  subjectId: string | null;
  boards: Board[];
  parts: { id: string }[];
  streams: { id: string }[];
  subjects: Subject[];
  onBoardChange: (v: string) => void;
  onPartChange: (v: ExamPart) => void;
  onStreamChange: (v: ExamStream) => void;
  onSubjectChange: (v: string) => void;
};

export function usePredictAutoDefaults({
  enabled,
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
}: UsePredictAutoDefaultsArgs) {
  useEffect(() => {
    if (!enabled || !boards.length) return;
    const enabledBoard = boards.find((b) => isBoardEnabled(b));
    if (!enabledBoard) return;
    const listed = boards.some((b) => b.id === boardId);
    if (!boardId || (boardId === LAUNCH_DEFAULTS.boardId && !listed)) {
      onBoardChange(enabledBoard.id);
    }
  }, [enabled, boards, boardId, onBoardChange]);

  useEffect(() => {
    if (!enabled || !parts.length || !examType) return;
    const launchPart = parts.find((p) =>
      isPartEnabled(p.id as ExamPart, examType)
    );
    if (!launchPart) return;
    const listed = parts.some((p) => p.id === part);
    if (!part || (part === LAUNCH_DEFAULTS.part && !listed)) {
      onPartChange(launchPart.id as ExamPart);
    }
  }, [enabled, parts, part, examType, onPartChange]);

  useEffect(() => {
    if (!enabled || !streams.length || !examType || !part) return;
    const launchStream = streams.find((s) =>
      isStreamEnabled(s.id as ExamStream, examType, part)
    );
    if (!launchStream) return;
    const listed = streams.some((s) => s.id === stream);
    if (!stream || (stream === LAUNCH_DEFAULTS.stream && !listed)) {
      onStreamChange(launchStream.id as ExamStream);
    }
  }, [enabled, streams, stream, examType, part, onStreamChange]);

  useEffect(() => {
    if (!enabled || !subjects.length) return;
    const urlSubject = subjectId
      ? subjects.find((s) => s.id === subjectId)
      : null;
    if (urlSubject && isSubjectEnabled(urlSubject, { examType, part, stream })) {
      return;
    }
    const enabledSubject = subjects.find((s) =>
      isSubjectEnabled(s, { examType, part, stream })
    );
    if (!enabledSubject) return;
    const listed = subjects.some((s) => s.id === subjectId);
    if (!subjectId || (subjectId === LAUNCH_DEFAULTS.subjectId && !listed)) {
      onSubjectChange(enabledSubject.id);
    }
  }, [
    enabled,
    subjects,
    subjectId,
    examType,
    part,
    stream,
    onSubjectChange,
  ]);
}
