"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RevisionView } from "@/components/revision/revision-view";
import { useEduFlowStore } from "@/store/use-eduflow-store";
export default function RevisionTopicPage(){ const params=useParams<{subjectId:string;topicId:string}>(); const router=useRouter(); const store=useEduFlowStore(); const subject=store.subjects.find(s=>s.id===params.subjectId); const topic=subject?.topics.find(t=>t.id===params.topicId); useEffect(()=>{ if(!store.hydrated)return; if(!store.profile) router.replace("/"); else if(!subject||!topic) router.replace("/revision"); },[store.hydrated,store.profile,subject,topic,router]); if(!store.hydrated||!store.profile||!subject||!topic) return <div className="min-h-screen bg-[#090708]"/>; return <RevisionView subject={subject} topic={topic}/>; }
