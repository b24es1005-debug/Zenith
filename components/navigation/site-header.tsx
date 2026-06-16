"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ProfileDropdown } from "@/components/navigation/profile-dropdown";

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30">
            Z
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Zenith</span>
            <span className="block text-xs text-white/50">Astronomy planning platform</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-1 overflow-x-auto text-sm text-white/70 sm:gap-3">
          <Link className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-white" href="/meetups">
            Meetups
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-white" href="/map">
            Map
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-white" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-white" href="/login">
            Login
          </Link>
          {status === "authenticated" && session?.user ? <ProfileDropdown user={session.user} /> : null}
        </nav>
      </div>
    </header>
  );
}