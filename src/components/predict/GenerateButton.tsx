import { Sparkles } from "lucide-react";

type GenerateButtonProps = {
  disabled: boolean;
  isLoading?: boolean;
  onClick: () => void;
  className?: string;
};

export function GenerateButton({
  disabled,
  isLoading = false,
  onClick,
  className = "",
}: GenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`predict-generate-btn pm-btn pm-btn-primary w-full min-h-12 rounded-xl text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
        !disabled && !isLoading ? "predict-generate-ready" : ""
      } ${className}`}
    >
      <Sparkles className="h-4 w-4" />
      {isLoading ? "Generating…" : "Generate predictions"}
    </button>
  );
}
