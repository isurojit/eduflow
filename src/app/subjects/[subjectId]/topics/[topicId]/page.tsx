"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopicWorkspace } from "@/components/subjects/topic-workspace";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export default function TopicPage() {
  const params = useParams<{ subjectId: string; topicId: string }>();
  const router = useRouter();
  const store = useEduFlowStore();
  const subject = store.subjects.find((item) => item.id === params.subjectId);
  const topic = subject?.topics.find((item) => item.id === params.topicId);
  useEffect(() => {
    if (!store.hydrated) return;
    if (!store.profile) router.replace("/");
    else if (!subject) router.replace("/subjects");
    else if (!topic) router.replace(`/subjects/${params.subjectId}`);
  }, [store.hydrated, store.profile, subject, topic, params.subjectId, router]);
  if (!store.hydrated || !store.profile || !subject || !topic) return <div className="min-h-screen bg-[#090708]" />;
  return <TopicWorkspace subject={subject} topic={topic} />;
}
