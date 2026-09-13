"use client";

import { useEffect, useRef, useState } from "react";
import { Cloud, CloudOff } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { initialCloudSync, pushCloudState } from "@/lib/cloud/state-sync";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export function CloudSync() {
  const { user, configured } = useAuth();
  const hydrated = useEduFlowStore((state) => state.hydrated);
  const updatedAt = useEduFlowStore((state) => state.updatedAt);
  const [status, setStatus] = useState<"idle" | "syncing" | "synced" | "offline">("idle");
  const initializedFor = useRef<string | null>(null);
  const skipNext = useRef(false);

  useEffect(() => {
    if (!configured || !user || !hydrated || initializedFor.current === user.uid) return;
    initializedFor.current = user.uid;
    setStatus("syncing");
    initialCloudSync(user.uid).then(() => { skipNext.current = true; setStatus("synced"); }).catch(() => setStatus("offline"));
  }, [configured, hydrated, user]);

  useEffect(() => {
    if (!configured || !user || !hydrated || initializedFor.current !== user.uid) return;
    if (skipNext.current) { skipNext.current = false; return; }
    setStatus("syncing");
    const timer = window.setTimeout(() => pushCloudState().then(() => setStatus("synced")).catch(() => setStatus("offline")), 1200);
    return () => window.clearTimeout(timer);
  }, [configured, hydrated, updatedAt, user]);

  if (!configured || !user || status === "idle") return null;
  return <div className="fixed bottom-[calc(5.4rem+env(safe-area-inset-bottom))] right-3 z-[65] hidden items-center gap-2 border border-white/[0.08] bg-[#0d090a]/92 px-3 py-2 text-[9px] uppercase tracking-[.13em] text-[#807478] backdrop-blur md:flex md:bottom-4 md:right-4">{status === "offline" ? <CloudOff className="size-3.5 text-[#C52845]" /> : <Cloud className="size-3.5 text-[#A81736]" />}{status === "syncing" ? "Syncing" : status === "offline" ? "Local cache" : "Cloud synced"}</div>;
}
