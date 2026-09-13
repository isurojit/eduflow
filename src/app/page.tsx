"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingScreen } from "@/components/landing/landing-screen";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export default function HomePage() {
  const router = useRouter();
  const hydrated = useEduFlowStore((state) => state.hydrated);
  const profile = useEduFlowStore((state) => state.profile);

  useEffect(() => {
    if (hydrated && profile) router.replace("/dashboard");
  }, [hydrated, profile, router]);

  if (!hydrated || profile) return <div className="min-h-screen bg-[#090708]" />;
  return <LandingScreen />;
}
