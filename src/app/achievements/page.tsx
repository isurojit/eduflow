"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AchievementsView } from "@/components/achievements/achievements-view";
import { useEduFlowStore } from "@/store/use-eduflow-store";
export default function AchievementsPage(){const router=useRouter();const hydrated=useEduFlowStore(s=>s.hydrated);const profile=useEduFlowStore(s=>s.profile);useEffect(()=>{if(hydrated&&!profile)router.replace("/");},[hydrated,profile,router]);if(!hydrated||!profile)return <div className="min-h-screen bg-[#090708]"/>;return <AchievementsView/>;}
