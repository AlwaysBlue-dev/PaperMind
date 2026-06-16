"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("message") === "password_reset";
  const confirmationFailed = searchParams.get("error") === "confirmation_failed";

  const [formError, setFormError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    setNeedsConfirmation(false);
    setResendMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        setNeedsConfirmation(true);
        setPendingEmail(data.email);
        return;
      }
      if (
        msg.includes("invalid login credentials") ||
        msg.includes("invalid credentials")
      ) {
        setFormError("Incorrect email or password");
        return;
      }
      setFormError(error.message);
      return;
    }

    router.push("/predict");
    router.refresh();
  }

  async function handleResendConfirmation() {
    const email = pendingEmail ?? getValues("email");
    if (!email) return;

    setIsResending(true);
    setResendMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setIsResending(false);
    setResendMessage(
      error ? error.message : "Confirmation email sent. Check your inbox."
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your predictions and saved questions."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-primary hover:text-primary-hover">
            Sign up
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-5 pb-28 md:pb-0"
        noValidate
      >
        {resetSuccess && (
          <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            Your password has been updated. Sign in with your new password.
          </div>
        )}

        {confirmationFailed && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            Email confirmation failed. The link may have expired — try signing in
            to resend a confirmation email.
          </div>
        )}

        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="mt-2 text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {needsConfirmation && (
          <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
            <p className="text-foreground">
              Please confirm your email before logging in. Check your inbox for
              the confirmation link.
            </p>
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={isResending}
              className="mt-3 flex min-h-10 items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover disabled:opacity-60"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Resend confirmation email"
              )}
            </button>
            {resendMessage && (
              <p className="mt-2 text-xs text-foreground-muted">{resendMessage}</p>
            )}
          </div>
        )}

        {formError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {formError}
          </div>
        )}

        <div className="auth-fixed-cta mt-auto md:mt-2 md:static">
          <SubmitButton isLoading={isSubmitting}>Sign in</SubmitButton>
        </div>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
