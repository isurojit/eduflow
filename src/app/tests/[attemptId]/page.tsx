"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TestResultView } from "@/components/tests/test-result-view";
import { useEduFlowStore } from "@/store/use-eduflow-store";
export default function TestResultPage() {
  const params = useParams<{ attemptId: string }>(); const router = useRouter(); const store = useEduFlowStore();
  const attempt = store.testAttempts.find((item) => item.id === params.attemptId);
  useEffect(() => { if (!store.hydrated) return; if (!store.profile) router.replace("/"); else if (!attempt) router.replace("/tests"); }, [store.hydrated, store.profile, attempt, router]);
  if (!store.hydrated || !store.profile || !attempt) return <div className="min-h-screen bg-[#090708]" />;
  return <TestResultView attempt={attempt} />;
}
