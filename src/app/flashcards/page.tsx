"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FlashcardsIndex } from "@/components/flashcards/flashcards-index";
import { useEduFlowStore } from "@/store/use-eduflow-store";
export default function FlashcardsPage(){ const router=useRouter(); const hydrated=useEduFlowStore(s=>s.hydrated); const profile=useEduFlowStore(s=>s.profile); useEffect(()=>{ if(hydrated&&!profile) router.replace("/"); },[hydrated,profile,router]); if(!hydrated||!profile) return <div className="min-h-screen bg-[#090708]"/>; return <FlashcardsIndex/>; }
