import { Loader2 } from "lucide-react";

type SubmitButtonProps = {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function SubmitButton({
  children,
  isLoading = false,
  disabled = false,
  className = "",
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`pm-btn pm-btn-primary w-full min-h-11 text-base disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
