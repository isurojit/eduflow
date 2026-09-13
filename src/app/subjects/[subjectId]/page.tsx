"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SubjectDetailView } from "@/components/subjects/subject-detail-view";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export default function SubjectPage() {
  const params = useParams<{ subjectId: string }>();
  const router = useRouter();
  const hydrated = useEduFlowStore((state) => state.hydrated);
  const profile = useEduFlowStore((state) => state.profile);
  const subject = useEduFlowStore((state) => state.subjects.find((item) => item.id === params.subjectId));
  useEffect(() => {
    if (!hydrated) return;
    if (!profile) router.replace("/");
    else if (!subject) router.replace("/subjects");
  }, [hydrated, profile, subject, router]);
  if (!hydrated || !profile || !subject) return <div className="min-h-screen bg-[#090708]" />;
  return <SubjectDetailView subject={subject} />;
}
