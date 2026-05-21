"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function getRequiredText(formData, fieldName) {
  const value = String(formData.get(fieldName) || "").trim();

  if (!value) {
    throw new Error(`${fieldName} is required.`);
  }

  return value;
}

function getOptionalText(formData, fieldName) {
  return String(formData.get(fieldName) || "").trim();
}

function getLessonNumber(formData, fieldName, fallback = 0) {
  const number = Number(formData.get(fieldName) || fallback);

  if (!Number.isFinite(number) || number < 0) {
    return fallback;
  }

  return Math.floor(number);
}

export async function createMemberAction(formData) {
  const totalLessons = getLessonNumber(formData, "totalLessons");
  const remainingLessons = Math.min(
    getLessonNumber(formData, "remainingLessons", totalLessons),
    totalLessons
  );

  const member = await prisma.member.create({
    data: {
      name: getRequiredText(formData, "name"),
      phone: getOptionalText(formData, "phone"),
      memo: getOptionalText(formData, "memo"),
      totalLessons,
      remainingLessons
    }
  });

  revalidatePath("/members");
  redirect(`/members/${member.id}`);
}

export async function updateMemberAction(formData) {
  const id = getRequiredText(formData, "id");
  const totalLessons = getLessonNumber(formData, "totalLessons");
  const remainingLessons = Math.min(
    getLessonNumber(formData, "remainingLessons", totalLessons),
    totalLessons
  );

  await prisma.member.update({
    where: {
      id
    },
    data: {
      name: getRequiredText(formData, "name"),
      phone: getOptionalText(formData, "phone"),
      memo: getOptionalText(formData, "memo"),
      totalLessons,
      remainingLessons
    }
  });

  revalidatePath("/members");
  revalidatePath(`/members/${id}`);
}

export async function deleteMemberAction(formData) {
  const id = getRequiredText(formData, "id");

  await prisma.member.delete({
    where: {
      id
    }
  });

  revalidatePath("/members");
  redirect("/members");
}
