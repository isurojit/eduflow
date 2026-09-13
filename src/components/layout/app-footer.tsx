import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-4 py-6 text-center sm:px-7 lg:px-10">
      <p className="text-[11px] tracking-wide text-[#62585b]">
        © {new Date().getFullYear()} EduFlow ·{" "}
        <Link
          href="/creators"
          className="text-[#9f9195] transition hover:text-white"
        >
          Designed & developed by the EduFlow Team
        </Link>
      </p>
    </footer>
  );
}
