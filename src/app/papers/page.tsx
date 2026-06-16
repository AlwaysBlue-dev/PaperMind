import type { Metadata } from "next";
import { PapersPageClient } from "@/components/papers/PapersPageClient";

export const metadata: Metadata = {
  title: "Past Papers",
  description: "Browse archived BISE, FBISE, and FPSC exam papers.",
};

export default function PapersPage() {
  return <PapersPageClient />;
}
