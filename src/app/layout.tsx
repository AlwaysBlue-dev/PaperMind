import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { BottomNav } from "@/components/navigation/BottomNav";
import { TopNav } from "@/components/navigation/TopNav";
import { PageTransition } from "@/components/ui/PageTransition";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PaperMind — AI Exam Question Prediction",
    template: "%s | PaperMind",
  },
  description:
    "AI-powered exam question prediction for Pakistani students — Matric, FSc, and CSS.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PaperMind",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground font-sans">
        <ToastProvider>
          <TopNav />
          <main className="flex flex-1 flex-col pb-nav-safe has-[.auth-layout]:pb-0">
            <PageTransition>{children}</PageTransition>
          </main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
