import type { Metadata } from "next";
import Link from "next/link";
import { signInWithGitHub, signInWithGoogle } from "@/app/actions/auth";
import { auth } from "@/auth";
import { hasGitHubAuthEnvironment } from "@/lib/env";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Zenith with Google or GitHub to access your astronomy dashboard and meetup tools.",
  openGraph: {
    title: "Zenith Sign In",
    description: "Sign in with Google or GitHub to continue to Zenith.",
  },
};

type LoginPageProps = {
  searchParams?: Promise<{ callbackUrl?: string | string[] }> | { callbackUrl?: string | string[] };
};

function normalizeCallbackUrl(callbackUrl: string | string[] | undefined) {
  if (typeof callbackUrl === "string" && callbackUrl.startsWith("/")) {
    return callbackUrl;
  }

  return "/dashboard";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const callbackUrl = normalizeCallbackUrl(resolvedSearchParams?.callbackUrl);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-200/70">Welcome back</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Sign in to Zenith</h1>
          <p className="text-sm leading-6 text-white/60">
            Use Google or GitHub to access your dashboard, saved locations, and meetup planning tools.
          </p>
        </div>

        <div className="space-y-3">
          <form action={signInWithGoogle}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              Continue with Google
            </button>
          </form>

          {hasGitHubAuthEnvironment() ? (
            <form action={signInWithGitHub}>
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Continue with GitHub
              </button>
            </form>
          ) : null}
        </div>

        <p className="mt-6 text-center text-xs text-white/45">
          By continuing you agree to the Zenith terms and privacy policy.
        </p>

        <div className="mt-8 text-center text-sm text-white/60">
          <Link href="/" className="text-cyan-200 transition hover:text-cyan-100">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}