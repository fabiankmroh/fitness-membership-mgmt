import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const appUser = await prisma.appUser.findUnique({
    where: {
      id: user.id
    },
    select: {
      id: true,
      isActive: true
    }
  });

  if (!appUser?.isActive) {
    redirect("/login?error=inactive");
  }

  return user;
}

export async function requireMasterUser() {
  const user = await requireUser();
  const appUser = await prisma.appUser.findUnique({
    where: {
      id: user.id
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  });

  if (!appUser || appUser.role !== "MASTER" || !appUser.isActive) {
    redirect("/members");
  }

  return { appUser, user };
}
