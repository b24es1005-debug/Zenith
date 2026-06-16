"use server";

import { signIn, signOut } from "@/auth";

function resolveCallbackUrl(formData: FormData) {
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (callbackUrl && callbackUrl.startsWith("/")) {
    return callbackUrl;
  }

  return "/dashboard";
}

export async function signInWithGoogle(formData: FormData) {
  await signIn("google", { redirectTo: resolveCallbackUrl(formData) });
}

export async function signInWithGitHub(formData: FormData) {
  await signIn("github", { redirectTo: resolveCallbackUrl(formData) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}