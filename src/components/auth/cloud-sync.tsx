"use client";

import { useEffect, useRef, useState } from "react";
import { Cloud, CloudOff, RefreshCcw, TriangleAlert } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  CloudConflictError,
  downloadLatestCloudState,
  initialCloudSync,
  pushCloudState,
  resetCloudRevision,
} from "@/lib/cloud/state-sync";
import { useEduFlowStore } from "@/store/use-eduflow-store";

type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "conflict";

export function CloudSync() {
  const { user, configured } = useAuth();

  const hydrated = useEduFlowStore((state) => state.hydrated);

  const updatedAt = useEduFlowStore((state) => state.updatedAt);

  const [status, setStatus] = useState<SyncStatus>("idle");

  const initializedFor = useRef<string | null>(null);

  const initialSyncRunning = useRef(false);

  const skipNextPush = useRef(false);

  const resolvingConflict = useRef(false);

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

        if (cancelled) {
          return;
        }

        if (error instanceof CloudConflictError) {
          setStatus("conflict");
        } else {
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

    if (status === "conflict") {
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

          if (cancelled) {
            return;
          }

          if (error instanceof CloudConflictError) {
            setStatus("conflict");
          } else {
            setStatus("offline");
          }
        });
    }, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [configured, hydrated, updatedAt, user, status]);

  useEffect(() => {
    const uid = user?.uid ?? null;

    if (initializedFor.current && initializedFor.current !== uid) {
      resetCloudRevision();

      initializedFor.current = null;
      skipNextPush.current = false;
      setStatus("idle");
    }
  }, [user]);

  const useCloudVersion = async () => {
    if (resolvingConflict.current) {
      return;
    }

    resolvingConflict.current = true;

    setStatus("syncing");

    try {
      await downloadLatestCloudState();

      skipNextPush.current = true;

      if (user) {
        initializedFor.current = user.uid;
      }

      setStatus("synced");
    } catch (error) {
      console.error("Cloud conflict recovery failed:", error);

      setStatus("offline");
    } finally {
      resolvingConflict.current = false;
    }
  };

  if (!configured || !user || status === "idle") {
    return null;
  }

  if (status === "conflict") {
    return (
      <div className="fixed bottom-[calc(5.4rem+env(safe-area-inset-bottom))] right-3 z-[80] hidden max-w-sm border border-[#78152A] bg-[#140A0D]/95 p-4 text-xs text-[#D8CDD0] shadow-2xl backdrop-blur md:bottom-4 md:right-4 md:block">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#C52845]" />

          <div>
            <p className="font-semibold text-white">Sync conflict</p>

            <p className="mt-1 leading-5 text-[#9f9195]">
              This account was updated on another device. Your local changes
              have not been overwritten.
            </p>

            <button
              type="button"
              onClick={() => {
                void useCloudVersion();
              }}
              className="focus-ring mt-3 inline-flex min-h-9 items-center gap-2 border border-white/[0.1] px-3 text-[10px] font-semibold uppercase tracking-[.12em] text-white transition hover:bg-white/[0.05]"
            >
              <RefreshCcw className="size-3.5" />
              Use cloud version
            </button>
          </div>
        </div>
      </div>
    );
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
