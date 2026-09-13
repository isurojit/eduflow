"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, BookOpenCheck, CalendarClock, CalendarDays, ChartNoAxesCombined, CircleGauge, FlaskConical, Goal, GraduationCap, Layers3, LayoutDashboard, StickyNote, TimerReset, FileText, SearchCode, UsersRound } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils/cn";
import { GlobalActions } from "@/components/common/global-actions";
import { UserMenu } from "@/components/auth/user-menu";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/planner", label: "Planner", icon: CalendarClock },
  { href: "/focus", label: "Focus", icon: TimerReset },
  { href: "/tests", label: "Tests", icon: FlaskConical },
  { href: "/revision", label: "Revision", icon: BookOpenCheck },
  { href: "/flashcards", label: "Flashcards", icon: Layers3 },
  { href: "/performance", label: "Performance", icon: ChartNoAxesCombined },
  { href: "/goals", label: "Goals", icon: Goal },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/streak", label: "Streak", icon: CircleGauge },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/assistant", label: "Assistant", icon: GraduationCap },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/research", label: "Research", icon: SearchCode },
  { href: "/creators", label: "Creators", icon: UsersRound },
];

export function AppHeader({ name, context }: { name?: string; context?: string }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#090708]/92 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-[1500px] items-center gap-2 px-4 sm:gap-4 sm:px-7 lg:px-10 xl:px-12">
        <Logo />
        <nav className="scrollbar-none ml-auto hidden items-center gap-1 overflow-x-auto md:flex" aria-label="Primary navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "focus-ring inline-flex min-h-10 items-center gap-2 px-2 text-xs sm:px-3 font-medium transition",
                  active ? "bg-[#180C10] text-[#F7F2F3]" : "text-[#807478] hover:bg-white/[0.04] hover:text-[#D8CDD0]",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                <span className={active ? "hidden xl:inline" : "hidden 2xl:inline"}>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto md:ml-0"><GlobalActions compact /></div>
        <UserMenu />
        {name ? (
          <div className="hidden min-w-0 border-l border-white/[0.08] pl-4 2xl:block">
            <p className="max-w-40 truncate text-xs font-medium text-[#D8CDD0]">{name}</p>
            {context ? <p className="mt-0.5 max-w-40 truncate text-[9px] uppercase tracking-[.14em] text-[#807478]">{context}</p> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
