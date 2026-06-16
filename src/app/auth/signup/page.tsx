"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { getOrigin } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

export default function SignupPage() {
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const password = watch("password", "");

  async function onSubmit(data: SignupInput) {
    setFormError(null);
    const supabase = createClient();
    const origin = getOrigin();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("already been registered") ||
        msg.includes("user already exists")
      ) {
        setFormError("exists");
        return;
      }
      setFormError(error.message);
      return;
    }

    setSuccessEmail(data.email);
  }

  async function handleResend() {
    if (!successEmail) return;
    setIsResending(true);
    setResendMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: successEmail,
      options: { emailRedirectTo: `${getOrigin()}/auth/callback` },
    });
    setIsResending(false);
    setResendMessage(
      error ? error.message : "Confirmation email sent. Check your inbox."
    );
  }

  if (successEmail) {
    return (
      <AuthShell title="Check your inbox">
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center md:py-4">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <h2 className="font-heading text-xl font-bold">Check your inbox</h2>
          <p className="mt-3 max-w-sm text-sm text-foreground-muted">
            We&apos;ve sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{successEmail}</span>.
            Click it to activate your account.
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="pm-btn pm-btn-ghost mt-8 min-h-11 w-full border border-border md:w-auto"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Didn't get it? Resend email"
            )}
          </button>
          {resendMessage && (
            <p className="mt-3 text-sm text-foreground-muted">{resendMessage}</p>
          )}
          <Link
            href="/auth/login"
            className="mt-6 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Back to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start predicting exam questions tailored for Pakistani boards."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary-hover">
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-5 pb-28 md:pb-0"
        noValidate
      >
        <AuthInput
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-2">
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {formError === "exists" ? (
          <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
            An account with this email already exists.{" "}
            <Link href="/auth/login" className="font-medium text-primary">
              Try signing in instead.
            </Link>
          </div>
        ) : formError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {formError}
          </div>
        ) : null}

        <div className="auth-fixed-cta mt-auto md:mt-2 md:static">
          <SubmitButton isLoading={isSubmitting}>Create account</SubmitButton>
        </div>
      </form>
    </AuthShell>
  );
}
