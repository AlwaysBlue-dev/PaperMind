"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { LOADING_MESSAGES } from "@/components/predict/constants";

type LoadingOverlayProps = {
  contained?: boolean;
};

export function LoadingOverlay({ contained = false }: LoadingOverlayProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={
        contained
          ? "absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-background/90 backdrop-blur-sm"
          : "fixed inset-0 z-60 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm md:hidden"
      }
      role="status"
      aria-live="polite"
      aria-label="Generating predictions"
    >
      <div className="relative flex h-24 w-20 items-center justify-center">
        <FileText
          className="h-16 w-14 text-muted-foreground/40"
          strokeWidth={1.25}
        />
        <div className="scan-line absolute inset-x-1 top-0 h-0.5 bg-primary shadow-[0_0_12px_var(--primary)]" />
      </div>
      <p className="mt-6 text-sm font-medium text-foreground transition-opacity duration-200">
        {LOADING_MESSAGES[msgIndex]}
      </p>
    </div>
  );
}
