"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import { GlobalSearchDialog } from "@/components/search/global-search-dialog";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AuthGate } from "@/components/auth/auth-gate";
// import { CloudSync } from "@/components/auth/cloud-sync";

function AppRuntimeExtras() {
  const pathname = usePathname();

  const hideAppExtras =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/creators") ||
    pathname.startsWith("/assistant");

  if (hideAppExtras) {
    return null;
  }

  return (
    <>
      <GlobalSearchDialog />
      <NotificationCenter />
      <MobileNav />
    </>
  );
}

function Runtime({ children }: { children: React.ReactNode }) {
  const hydrate = useEduFlowStore((state) => state.hydrate);
  const refreshNotifications = useEduFlowStore(
    (state) => state.refreshNotifications,
  );
  useEffect(() => hydrate(), [hydrate]);
  useEffect(() => {
    const timer = window.setInterval(refreshNotifications, 60_000);
    return () => window.clearInterval(timer);
  }, [refreshNotifications]);
  return (
    <AuthGate>
      {children}
      <AppRuntimeExtras />
    </AuthGate>
  );
}

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Runtime>{children}</Runtime>
    </AuthProvider>
  );
}
