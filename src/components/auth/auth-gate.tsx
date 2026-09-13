"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useEduFlowStore } from "@/store/use-eduflow-store";

const PUBLIC_PREFIXES = ["/auth", "/creators"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, configured } = useAuth();
  const hydrated = useEduFlowStore((state) => state.hydrated);
  const profile = useEduFlowStore((state) => state.profile);
  const publicPage =
    pathname === "/" ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (!configured || loading) return;

    if (!user && !publicPage) {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (
      user &&
      hydrated &&
      !profile &&
      !pathname.startsWith("/onboarding") &&
      !pathname.startsWith("/auth")
    ) {
      router.replace("/onboarding");
    }
  }, [
    configured,
    hydrated,
    loading,
    pathname,
    profile,
    publicPage,
    router,
    user,
  ]);

  if (!configured || publicPage) return <>{children}</>;
  if (loading || !user || !hydrated) {
    return <div className="min-h-screen bg-[#090708]" />;
  }
  return <>{children}</>;
}
