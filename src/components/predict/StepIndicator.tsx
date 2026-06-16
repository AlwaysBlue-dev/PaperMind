type StepIndicatorProps = {
  currentStep: number;
  totalSteps?: number;
};

export function StepIndicator({ currentStep, totalSteps = 4 }: StepIndicatorProps) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-4"
      aria-label={`Step ${currentStep} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isComplete = step < currentStep;

        return (
          <span
            key={step}
            className={`h-2 rounded-full transition-all duration-200 ${
              isActive
                ? "w-6 bg-primary"
                : isComplete
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-border"
            }`}
          />
        );
      })}
    </div>
  );
}
