"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { getOrigin } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setFormError(null);
    const supabase = createClient();
    const origin = getOrigin();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${origin}/auth/reset-password`,
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    setSubmittedEmail(data.email);
  }

  if (submittedEmail) {
    return (
      <AuthShell title="Check your email">
        <div className="py-4 text-sm text-foreground-muted">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{submittedEmail}</span>, a
          reset link has been sent.
        </div>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-hover"
        >
          Back to login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/auth/login" className="font-medium text-primary hover:text-primary-hover">
          Back to login
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-5 pb-28 md:pb-0"
        noValidate
      >
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {formError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {formError}
          </div>
        )}

        <div className="auth-fixed-cta mt-auto md:mt-2 md:static">
          <SubmitButton isLoading={isSubmitting}>Send reset link</SubmitButton>
        </div>
      </form>
    </AuthShell>
  );
}
