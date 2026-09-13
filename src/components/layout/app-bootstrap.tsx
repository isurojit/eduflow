"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useEduFlowStore } from "@/store/use-eduflow-store";
import { GlobalSearchDialog } from "@/components/search/global-search-dialog";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import {
  createEmptyState,
  setStorageUser,
  storage,
} from "@/lib/storage/storage";
import { CloudSync } from "@/components/auth/cloud-sync";

function AppRuntimeExtras() {
  const pathname = usePathname();

  const hideAppExtras =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/creators");

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
  const { user, loading, configured } = useAuth();

  const activeUid = useRef<string | null | undefined>(undefined);

  const refreshNotifications = useEduFlowStore(
    (state) => state.refreshNotifications,
  );

  useEffect(() => {
    if (configured && loading) {
      return;
    }

    const uid = user?.uid ?? null;

    if (activeUid.current === uid) {
      return;
    }

    activeUid.current = uid;

    setStorageUser(uid);

    const nextState = uid ? storage.load() : createEmptyState();

    useEduFlowStore.setState({
      ...nextState,
      hydrated: true,
    });
  }, [configured, loading, user]);

  useEffect(() => {
    const timer = window.setInterval(refreshNotifications, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [refreshNotifications]);

  return (
    <AuthGate>
      {children}
      <AppRuntimeExtras />
      <CloudSync />
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
