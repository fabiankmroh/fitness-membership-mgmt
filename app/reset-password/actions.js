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

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password/confirm`
  });

  if (error) {
    console.error("Password reset email failed", {
      code: error.code,
      message: error.message,
      status: error.status
    });

    if (error.status === 429) {
      redirect("/reset-password?error=rate-limit");
    }

    if (error.message?.toLowerCase().includes("not authorized")) {
      redirect("/reset-password?error=unauthorized-email");
    }

    redirect("/reset-password?error=send");
  }

  redirect("/reset-password?sent=1");
}
