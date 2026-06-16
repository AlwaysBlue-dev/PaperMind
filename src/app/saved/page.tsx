"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { SavedPageLoader } from "@/components/saved/SavedPageLoader";
import { SavedSignInPrompt } from "@/components/saved/SavedSignInPrompt";

export default function SavedPage() {
  return (
    <AuthGuard fallback={<SavedSignInPrompt />}>
      <SavedPageLoader />
    </AuthGuard>
  );
}
