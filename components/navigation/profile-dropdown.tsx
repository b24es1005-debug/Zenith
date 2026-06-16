"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";

type ProfileDropdownProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name ?? user.email ?? "user"}`}
        className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-cyan-400/20 text-xs font-semibold text-cyan-100">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? user.email ?? "User"} width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            (user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()
          )}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-40 truncate font-medium text-white">{user.name ?? "Explorer"}</span>
          <span className="block max-w-40 truncate text-xs text-white/60">{user.email}</span>
        </span>
        <span className="text-white/60">▾</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl" role="menu">
          <div className="px-3 py-2 text-sm text-white/70">
            Signed in as
            <div className="truncate font-medium text-white">{user.name ?? user.email}</div>
          </div>

          <div className="my-2 h-px bg-white/10" />

          <Link
            href="/dashboard"
            className="block rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <form action={signOutAction}>
            <button
              type="submit"
              className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-500/10 hover:text-rose-100"
            >
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}