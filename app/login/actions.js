"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getRedirectPath(formData) {
  const next = String(formData.get("next") || "/members");

  return next.startsWith("/") && !next.startsWith("//") ? next : "/members";
}

export async function loginAction(formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = getRedirectPath(formData);
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
