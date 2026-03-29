import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "ExpenseTracker — Smart Personal Finance",
  description: "Track your income, expenses, investments and loans in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
