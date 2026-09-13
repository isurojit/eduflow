import type { ActiveFocusSession } from "@/types/domain";

export function focusElapsedSeconds(session: ActiveFocusSession, nowMs = Date.now()) {
  if (session.status !== "running" || !session.runStartedAt) return Math.min(session.plannedSeconds, session.elapsedSeconds);
  const runStart = new Date(session.runStartedAt).getTime();
  if (!Number.isFinite(runStart)) return Math.min(session.plannedSeconds, session.elapsedSeconds);
  return Math.min(session.plannedSeconds, session.elapsedSeconds + Math.max(0, Math.floor((nowMs - runStart) / 1000)));
}

export function focusRemainingSeconds(session: ActiveFocusSession, nowMs = Date.now()) {
  return Math.max(0, session.plannedSeconds - focusElapsedSeconds(session, nowMs));
}

export function formatTimer(seconds: number) {
  const safe = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
