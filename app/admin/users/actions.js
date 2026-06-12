"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMasterUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/siteUrl";
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

export async function createTrainerAction(formData) {
  await requireMasterUser();

  let email = "";
  let name = "";
  let password = "";

  try {
    email = getRequiredText(formData, "email").toLowerCase();
    name = getRequiredText(formData, "name");
    password = String(formData.get("password") || "");
    assertStrongEnoughPassword(password);
  } catch {
    redirect("/admin/users?error=create");
  }

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
    redirect("/admin/users?error=create");
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
  } catch {
    await supabase.auth.admin.deleteUser(data.user.id);
    redirect("/admin/users?error=create");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function sendTrainerPasswordResetAction(formData) {
  await requireMasterUser();

  const userId = getRequiredText(formData, "userId");
  const appUser = await prisma.appUser.findUnique({
    where: {
      id: userId
    },
    select: {
      email: true
    }
  });

  if (!appUser) {
    redirect("/admin/users?error=reset");
  }

  const supabase = createAdminClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(appUser.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/update-password`
  });

  if (error) {
    redirect("/admin/users?error=reset");
  }

  redirect("/admin/users?reset=1");
}

export async function deleteTrainerAction(formData) {
  const { user } = await requireMasterUser();
  const userId = getRequiredText(formData, "userId");

  if (userId === user.id) {
    redirect("/admin/users?error=self");
  }

  const appUser = await prisma.appUser.findUnique({
    where: {
      id: userId
    },
    include: {
      _count: {
        select: {
          members: true
        }
      }
    }
  });

  if (!appUser || appUser.role === "MASTER") {
    redirect("/admin/users?error=delete");
  }

  if (appUser._count.members > 0) {
    redirect("/admin/users?error=members");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    redirect("/admin/users?error=delete");
  }

  await prisma.appUser.delete({
    where: {
      id: userId
    }
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?deleted=1");
}
