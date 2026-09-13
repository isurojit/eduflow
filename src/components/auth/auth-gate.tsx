"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

const PUBLIC_PREFIXES = ["/auth", "/creators"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, configured } = useAuth();
  const publicPage = pathname === "/" || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (!configured || loading || publicPage || user) return;
    router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
  }, [configured, loading, pathname, publicPage, router, user]);

  if (!configured || publicPage) return <>{children}</>;
  if (loading || !user) return <div className="min-h-screen bg-[#090708]" />;
  return <>{children}</>;
}
