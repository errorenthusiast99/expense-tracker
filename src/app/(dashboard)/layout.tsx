"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isChecked, initialize } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isChecked && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isChecked, isAuthenticated, router]);

  // Show spinner while Supabase resolves the initial session
  if (!isChecked || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar className="hidden h-screen md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar showMenuButton onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          {children}
        </main>
      </div>

      <Dialog open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <DialogContent className="w-[85vw] max-w-xs p-0 md:hidden">
          <Sidebar className="h-[100dvh] border-r-0" onNavigate={() => setMobileSidebarOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
