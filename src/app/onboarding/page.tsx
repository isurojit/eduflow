"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export default function OnboardingPage() {
  const router = useRouter();
  const hydrated = useEduFlowStore((s) => s.hydrated);
  const profile = useEduFlowStore((s) => s.profile);
  useEffect(() => { if (hydrated && profile) router.replace("/dashboard"); }, [hydrated, profile, router]);
  if (!hydrated || profile) return <div className="min-h-screen" />;
  return <OnboardingFlow />;
}
