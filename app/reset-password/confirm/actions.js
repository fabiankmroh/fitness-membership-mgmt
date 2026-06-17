"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function confirmPasswordResetAction(formData) {
  const tokenHash = String(formData.get("token_hash") || "");
  const type = String(formData.get("type") || "recovery");
  const password = String(formData.get("password") || "");

  if (!tokenHash || type !== "recovery") {
    redirect("/reset-password/confirm?error=invalid");
  }

  if (password.length < 8) {
    redirect("/reset-password/confirm?error=weak");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type
  });

  if (error) {
    redirect("/reset-password/confirm?error=expired");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password
  });

  if (updateError) {
    console.error("Password reset update failed", {
      code: updateError.code,
      message: updateError.message,
      status: updateError.status
    });

    redirect("/reset-password/confirm?error=update");
  }

  redirect("/login?passwordUpdated=1");
}
