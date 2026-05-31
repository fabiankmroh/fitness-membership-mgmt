"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

function getRequiredText(formData, fieldName) {
  const value = String(formData.get(fieldName) || "").trim();

  if (!value) {
    throw new Error(`${fieldName} is required.`);
  }

  return value;
}

function assertStrongEnoughPassword(password) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
}

function validateInviteCode(formData) {
  const expectedCode = process.env.TRAINER_SIGNUP_CODE;
  const code = getRequiredText(formData, "inviteCode");

  if (!expectedCode || code !== expectedCode) {
    throw new Error("Invalid invite code.");
  }
}

export async function createTrainerWithInviteAction(formData) {
  try {
    validateInviteCode(formData);

    const email = getRequiredText(formData, "email").toLowerCase();
    const name = getRequiredText(formData, "name");
    const password = String(formData.get("password") || "");
    assertStrongEnoughPassword(password);

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: "TRAINER"
      }
    });

    if (error || !data.user) {
      throw new Error(error?.message || "Could not create user.");
    }

    try {
      await prisma.appUser.create({
        data: {
          id: data.user.id,
          email,
          name,
          role: "TRAINER"
        }
      });
    } catch (profileError) {
      await supabase.auth.admin.deleteUser(data.user.id);
      throw profileError;
    }
  } catch {
    redirect("/signup?error=1");
  }

  redirect("/login?created=1");
}
