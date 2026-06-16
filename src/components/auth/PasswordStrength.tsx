"use client";

type PasswordStrengthProps = {
  password: string;
};

type Segment = {
  filled: boolean;
  color: "red" | "amber" | "green";
};

function getSegments(password: string): Segment[] {
  const hasLength = password.length >= 8;
  const hasUpperAndNumber = /[A-Z]/.test(password) && /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return [
    { filled: hasLength, color: hasLength ? "amber" : "red" },
    {
      filled: hasUpperAndNumber,
      color: hasUpperAndNumber ? "amber" : hasLength ? "amber" : "red",
    },
    {
      filled: hasSpecial && hasLength && hasUpperAndNumber,
      color:
        hasSpecial && hasLength && hasUpperAndNumber
          ? "green"
          : hasUpperAndNumber
            ? "amber"
            : "red",
    },
  ];
}

const colorMap = {
  red: "bg-red-500",
  amber: "bg-accent",
  green: "bg-success",
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const segments = getSegments(password);

  return (
    <div className="flex flex-col gap-1.5" aria-label="Password strength">
      <div className="flex gap-1.5">
        {segments.map((segment, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              segment.filled ? colorMap[segment.color] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Use 8+ characters with uppercase, numbers, and a special character
      </p>
    </div>
  );
}
