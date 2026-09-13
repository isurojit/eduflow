"use client";

import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export function UserMenu() {
  const { user, configured, logout } = useAuth();
  if (!configured) return <Link href="/auth" title="Configure login" className="focus-ring grid min-h-10 min-w-10 place-items-center text-[#807478]"><LogIn className="size-4" /></Link>;
  if (!user) return <Link href="/auth" className="focus-ring inline-flex min-h-10 items-center gap-2 px-2 text-xs text-[#B8AAAE]"><LogIn className="size-4" /><span className="hidden 2xl:inline">Login</span></Link>;
  return <button onClick={() => void logout()} title={`Logout ${user.email ?? ""}`} className="focus-ring inline-flex min-h-10 items-center gap-2 px-2 text-xs text-[#B8AAAE]"><span className="grid size-7 place-items-center rounded-full bg-[#180C10]"><UserRound className="size-3.5" /></span><span className="hidden max-w-28 truncate 2xl:inline">{user.displayName || user.email}</span><LogOut className="size-3.5 text-[#807478]" /></button>;
}
