"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { createClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const password = watch("password", "");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setReady(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(data: ResetPasswordInput) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) {
      setFormError(error.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/auth/login?message=password_reset");
  }

  if (!ready) {
    return (
      <AuthShell title="Set new password" subtitle="Verifying your reset link…">
        <p className="text-sm text-foreground-muted">
          If this takes too long,{" "}
          <Link href="/auth/forgot-password" className="text-primary">
            request a new reset link
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set new password"
      subtitle="Choose a strong password for your account."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-5 pb-28 md:pb-0"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <PasswordInput
            label="New password"
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

        {formError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {formError}
          </div>
        )}

        <div className="auth-fixed-cta mt-auto md:mt-2 md:static">
          <SubmitButton isLoading={isSubmitting}>Update password</SubmitButton>
        </div>
      </form>
    </AuthShell>
  );
}
