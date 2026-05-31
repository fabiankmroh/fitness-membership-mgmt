"use server";

import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/siteUrl";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordResetAction(formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    redirect("/reset-password?sent=1");
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/update-password`
  });

  redirect("/reset-password?sent=1");
}
