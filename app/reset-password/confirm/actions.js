"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(value) {
  const next = String(value || "/update-password");

  return next.startsWith("/") && !next.startsWith("//") ? next : "/update-password";
}

export async function confirmPasswordResetAction(formData) {
  const tokenHash = String(formData.get("token_hash") || "");
  const type = String(formData.get("type") || "recovery");
  const next = getSafeNextPath(formData.get("next"));

  if (!tokenHash || type !== "recovery") {
    redirect("/reset-password/confirm?error=invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type
  });

  if (error) {
    redirect("/reset-password/confirm?error=expired");
  }

  redirect(next);
}
