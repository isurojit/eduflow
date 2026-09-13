import { BookOpenText, Sparkles } from "lucide-react";

export function Logo() {
  return (
    <div className="inline-flex items-center gap-2.5 font-semibold tracking-[-0.03em] text-[#F7F2F3]">
      <span className="grid size-9 place-items-center rounded-[12px] border border-[#ffffff14] bg-[#78152A] shadow-[inset_0_1px_0_#ffffff18]"><BookOpenText className="size-4.5" aria-hidden="true" /></span>
      <span className="text-lg">EduFlow</span>
      <span className="hidden items-center gap-1 border border-[#78152A]/50 bg-[#180C10] px-2 py-1 text-[8px] uppercase tracking-[.16em] text-[#c77687] xl:inline-flex"><Sparkles className="size-2.5" />AI Enriched</span>
    </div>
  );
}
