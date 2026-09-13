"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, TimerReset, TrendingUp, Sparkles, UploadCloud, Bot } from "lucide-react";
import { Logo } from "@/components/common/logo";

const previewRows = [
  ["Physics", "Motion", "42%"],
  ["Mathematics", "Algebra", "68%"],
  ["Computer Science", "Algorithms", "25%"],
] as const;

export function LandingScreen() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const paperY = useTransform(scrollY, [0, 600], [0, reduceMotion ? 0 : 80]);
  const railY = useTransform(scrollY, [0, 600], [0, reduceMotion ? 0 : -45]);

  return (
    <main className="relative min-h-screen overflow-hidden px-5 pb-16 pt-5 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(#ffffff08_1px,transparent_1px),linear-gradient(90deg,#ffffff08_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      <header className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between border-b border-white/[0.07] pb-5">
        <Logo />
        <div className="flex items-center gap-2"><Link href="/creators" className="focus-ring hidden min-h-11 items-center px-3 text-xs text-[#807478] hover:text-white sm:inline-flex">Creators</Link><Link href="/auth" className="focus-ring hidden min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-[#D5C9CC] transition hover:border-white/20 hover:text-white sm:inline-flex">Login <ArrowRight className="size-4" /></Link></div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-90px)] max-w-[1440px] items-center gap-14 py-16 lg:grid-cols-[0.94fr_1.06fr] lg:py-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, ease: [0.22,1,0.36,1] }} className="max-w-2xl">
          <p className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B8AAAE]">
            <span className="h-px w-8 bg-[#C52845]" /> AI enriched learning system
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.7rem,14vw,7.4rem)] sm:text-[clamp(3.25rem,8vw,7.4rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-[#F7F2F3]">
            Study smarter.<br /><span className="text-[#A81736]">Grow every day.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#B8AAAE] sm:text-lg">
            Plan, study, upload your own material, research trusted sources and let an action-capable AI copilot help organize the work around your real learning history.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/auth?next=/onboarding" className="focus-ring inline-flex min-h-12 items-center gap-3 rounded-full bg-[#A81736] px-6 text-sm font-semibold text-white shadow-[0_12px_38px_rgba(168,23,54,.22)] transition hover:bg-[#C52845] active:scale-[.98]">Get Started <ArrowRight className="size-4" /></Link>
            <a href="#preview" className="focus-ring inline-flex min-h-12 items-center rounded-full px-3 text-sm font-medium text-[#B8AAAE] transition hover:text-white">
              Explore EduFlow
            </a>
          </div>
          <div className="mt-10 flex flex-wrap sm:mt-12 gap-x-7 gap-y-3 border-t border-white/[0.07] pt-6 text-xs text-[#807478]">
            <span>Firebase login</span><span>MongoDB cloud sync</span><span>Gemini-ready AI</span><span>Document intelligence</span>
          </div>
        </motion.div>

        <div id="preview" className="relative mx-auto w-full max-w-[700px] lg:mx-0">
          <motion.div style={{ y: paperY }} className="absolute -right-6 -top-7 hidden h-[78%] w-[72%] rotate-[4deg] border border-[#ffffff0d] bg-[#130b0d] lg:block" />
          <motion.div style={{ y: railY }} className="absolute -bottom-8 -left-6 hidden w-56 border-l border-[#78152A] pl-4 text-[10px] uppercase tracking-[.22em] text-[#6f6266] lg:block">
            <div className="mb-8">Plan</div><div className="mb-8">Focus</div><div>Improve</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: .985, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: .12, duration: .7, ease: [0.22,1,0.36,1] }} className="relative overflow-hidden border border-white/[0.09] bg-[#11090B]/95 shadow-[0_30px_90px_rgba(0,0,0,.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-7">
              <div><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Tuesday · Study desk</p><p className="mt-1 text-sm font-medium text-[#E8DFE1]">Good afternoon, Aisha.</p></div>
              <div className="size-9 rounded-full border border-white/10 bg-[#241217]" />
            </div>
            <div className="grid gap-0 md:grid-cols-[1.2fr_.8fr]">
              <section className="border-b border-white/[0.07] p-5 sm:p-7 md:border-b-0 md:border-r">
                <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Today&apos;s progress</p>
                <div className="mt-6 flex items-end justify-between gap-5">
                  <div><span className="font-[family-name:var(--font-display)] text-6xl font-medium tracking-[-.06em]">3</span><span className="ml-2 text-sm text-[#807478]">of 5 planned</span></div>
                  <span className="text-xs text-[#B8AAAE]">60%</span>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden bg-white/[0.06]"><motion.div initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ delay: .65, duration: .8 }} className="h-full bg-[#A81736]" /></div>
                <div className="mt-8 space-y-1">
                  {previewRows.map(([subject, topic, progress]) => <div key={subject} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 border-t border-white/[0.06] py-3 text-xs"><span className="text-[#E7DCDF]">{subject}</span><span className="text-[#807478]">{topic}</span><span className="text-[#B8AAAE]">{progress}</span></div>)}
                </div>
              </section>
              <section className="p-5 sm:p-7">
                <div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Active focus</p><TimerReset className="size-4 text-[#A81736]" /></div>
                <div className="mt-8 font-[family-name:var(--font-display)] text-5xl tracking-[-.06em]">25:00</div>
                <p className="mt-2 text-xs text-[#807478]">Physics · Motion</p>
                <div className="mt-8 border-t border-white/[0.07] pt-5">
                  <p className="text-[10px] uppercase tracking-[.18em] text-[#807478]">Why this is next</p>
                  <p className="mt-2 text-sm leading-6 text-[#B8AAAE]">Incomplete topic · planned before your next practice test.</p>
                </div>
              </section>
            </div>
            <div className="grid grid-cols-3 border-t border-white/[0.07]">
              {[ [CheckCircle2,"Topics","12"], [TrendingUp,"Avg score","—"], [TimerReset,"Study","0m"] ].map(([Icon,label,value]) => {
                const I = Icon as typeof CheckCircle2;
                return <div key={label as string} className="border-r border-white/[0.07] px-4 py-4 last:border-r-0 sm:px-6"><I className="mb-3 size-4 text-[#78152A]"/><p className="text-lg font-medium">{value as string}</p><p className="text-[10px] uppercase tracking-[.16em] text-[#807478]">{label as string}</p></div>;
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
