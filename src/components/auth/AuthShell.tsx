import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
};

export function AuthShell({ children, title, subtitle, footer }: AuthShellProps) {
  return (
    <div className="auth-page relative flex min-h-[calc(100dvh-4.5rem)] flex-1 flex-col md:min-h-[calc(100dvh-4rem)] md:items-center md:justify-center md:px-6 md:py-12">
      <div className="auth-blob-bg pointer-events-none absolute inset-0 hidden md:block" aria-hidden />

      <div className="relative flex w-full flex-1 flex-col md:max-w-[440px]">
        <div className="flex flex-1 flex-col px-5 pt-6 md:px-0 md:pt-0">
          <div className="mb-8 md:mb-6">
            <Link
              href="/"
              className="font-heading text-lg font-bold tracking-tight text-foreground"
            >
              Paper<span className="text-primary">Mind</span>
            </Link>
            <h1 className="font-heading mt-6 text-2xl font-bold tracking-tight md:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-foreground-muted md:text-base">
                {subtitle}
              </p>
            )}
          </div>

          <div className="auth-card flex flex-1 flex-col md:rounded-xl md:border md:border-card-border md:bg-card md:p-8 md:shadow-(--card-shadow)">
            {children}
          </div>

          {footer && (
            <div className="mt-6 pb-6 text-center text-sm text-foreground-muted md:pb-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
