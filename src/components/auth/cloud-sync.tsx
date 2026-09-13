"use client";

import { useEffect, useRef, useState } from "react";
import { Cloud, CloudOff } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  initialCloudSync,
  pushCloudState,
  resetCloudRevision,
} from "@/lib/cloud/state-sync";
import { useEduFlowStore } from "@/store/use-eduflow-store";

type SyncStatus = "idle" | "syncing" | "synced" | "offline";

export function CloudSync() {
  const { user, configured } = useAuth();

  const hydrated = useEduFlowStore((state) => state.hydrated);

  const updatedAt = useEduFlowStore((state) => state.updatedAt);

  const [status, setStatus] = useState<SyncStatus>("idle");

  const initializedFor = useRef<string | null>(null);
  const initialSyncRunning = useRef(false);
  const skipNextPush = useRef(false);

  useEffect(() => {
    if (!configured || !user || !hydrated) {
      return;
    }

    if (initializedFor.current === user.uid) {
      return;
    }

    if (initialSyncRunning.current) {
      return;
    }

    let cancelled = false;

    initialSyncRunning.current = true;
    setStatus("syncing");

    initialCloudSync(user.uid)
      .then((result) => {
        if (cancelled) {
          return;
        }

        initializedFor.current = user.uid;

        if (result === "downloaded") {
          skipNextPush.current = true;
        }

        setStatus("synced");
      })
      .catch((error) => {
        console.error("Initial cloud sync failed:", error);

        if (!cancelled) {
          setStatus("offline");
        }
      })
      .finally(() => {
        initialSyncRunning.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [configured, hydrated, user]);

  useEffect(() => {
    if (
      !configured ||
      !user ||
      !hydrated ||
      initializedFor.current !== user.uid
    ) {
      return;
    }

    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }

    let cancelled = false;

    setStatus("syncing");

    const timer = window.setTimeout(() => {
      pushCloudState()
        .then(() => {
          if (!cancelled) {
            setStatus("synced");
          }
        })
        .catch((error) => {
          console.error("Cloud state push failed:", error);

          if (!cancelled) {
            setStatus("offline");
          }
        });
    }, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [configured, hydrated, updatedAt, user]);

  useEffect(() => {
    const uid = user?.uid ?? null;

    if (initializedFor.current && initializedFor.current !== uid) {
      resetCloudRevision();

      initializedFor.current = null;
      skipNextPush.current = false;
      setStatus("idle");
    }
  }, [user]);

  if (!configured || !user || status === "idle") {
    return null;
  }

  return (
    <div className="fixed bottom-[calc(5.4rem+env(safe-area-inset-bottom))] right-3 z-[65] hidden items-center gap-2 border border-white/[0.08] bg-[#0d090a]/92 px-3 py-2 text-[9px] uppercase tracking-[.13em] text-[#807478] backdrop-blur md:bottom-4 md:right-4 md:flex">
      {status === "offline" ? (
        <CloudOff className="size-3.5 text-[#C52845]" />
      ) : (
        <Cloud className="size-3.5 text-[#A81736]" />
      )}

      {status === "syncing"
        ? "Syncing"
        : status === "offline"
          ? "Local cache"
          : "Cloud synced"}
    </div>
  );
}
