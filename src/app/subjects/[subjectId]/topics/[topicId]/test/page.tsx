"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TestRunner } from "@/components/tests/test-runner";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export default function TopicTestPage() {
  const params = useParams<{ subjectId: string; topicId: string }>();
  const router = useRouter();
  const store = useEduFlowStore();
  const subject = store.subjects.find((item) => item.id === params.subjectId);
  const topic = subject?.topics.find((item) => item.id === params.topicId);
  useEffect(() => { if (!store.hydrated) return; if (!store.profile) router.replace("/"); else if (!subject || !topic) router.replace("/subjects"); }, [store.hydrated, store.profile, subject, topic, router]);
  if (!store.hydrated || !store.profile || !subject || !topic) return <div className="min-h-screen bg-[#090708]" />;
  return <TestRunner subject={subject} topic={topic} />;
}
