"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  BookOpenCheck,
  CalendarClock,
  CalendarDays,
  ChartNoAxesCombined,
  CircleGauge,
  FlaskConical,
  Goal,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  Menu,
  StickyNote,
  TimerReset,
  X,
  FileText,
  SearchCode,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const primary = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/planner", label: "Planner", icon: CalendarClock },
  { href: "/focus", label: "Focus", icon: TimerReset },
];

const more = [
  { href: "/tests", label: "Tests", icon: FlaskConical },
  { href: "/performance", label: "Performance", icon: ChartNoAxesCombined },
  { href: "/revision", label: "Revision", icon: BookOpenCheck },
  { href: "/flashcards", label: "Flashcards", icon: Layers3 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/goals", label: "Goals", icon: Goal },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/streak", label: "Streak", icon: CircleGauge },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/assistant", label: "AI Copilot", icon: GraduationCap },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/research", label: "Research", icon: SearchCode },
  { href: "/creators", label: "Creators", icon: UsersRound },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hidden = pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/creators") || pathname.startsWith("/onboarding") || pathname.startsWith("/focus");
  const moreActive = more.some((item) => isActive(pathname, item.href));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [open]);

  if (hidden) return null;

  return (
    <>
      <div className="h-[calc(4.75rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
      <nav
        className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/[0.09] bg-[#090708]/95 px-2 pb-[max(.45rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl md:hidden"
        aria-label="Mobile primary navigation"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {primary.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href} className={cn("focus-ring flex min-h-[54px] flex-col items-center justify-center gap-1 text-[10px] font-medium", active ? "bg-[#180C10] text-white" : "text-[#807478]")}> 
                <Icon className="size-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
          <button onClick={() => setOpen(true)} className={cn("focus-ring flex min-h-[54px] flex-col items-center justify-center gap-1 text-[10px] font-medium", moreActive ? "bg-[#180C10] text-white" : "text-[#807478]")} aria-label="Open more navigation">
            <Menu className="size-4" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end bg-black/65 backdrop-blur-sm md:hidden" role="dialog" aria-modal="true" aria-label="More navigation" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
          <section className="max-h-[88dvh] w-full overflow-y-auto rounded-t-[22px] border-t border-white/[0.1] bg-[#0d090a] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/[0.12]" />
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[.16em] text-[#807478]">EduFlow</p>
                <h2 className="mt-1 text-lg font-semibold">More tools</h2>
              </div>
              <button onClick={() => setOpen(false)} className="focus-ring grid min-h-11 min-w-11 place-items-center text-[#807478]" aria-label="Close navigation"><X className="size-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 py-4">
              {more.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={cn("focus-ring flex min-h-14 items-center gap-3 border px-3 text-sm", isActive(pathname, href) ? "border-[#78152A] bg-[#180C10] text-white" : "border-white/[0.08] text-[#B8AAAE]")}> 
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
