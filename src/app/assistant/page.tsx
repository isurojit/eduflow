import { Suspense } from "react";
import { StudyAssistantView } from "@/components/assistant/study-assistant-view";

export default function AssistantPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#090708]" />}><StudyAssistantView /></Suspense>;
}
