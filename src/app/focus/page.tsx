"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FocusMode } from "@/components/focus/focus-mode";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export default function FocusPage() {
  const store = useEduFlowStore();
  const router = useRouter();
  useEffect(() => { if (store.hydrated && !store.profile) router.replace("/"); }, [store.hydrated, store.profile, router]);
  if (!store.hydrated || !store.profile) return <div className="min-h-screen bg-[#090708]" />;
  return <FocusMode />;
}
