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

export async function createLessonAction(formData) {
  const memberId = getRequiredText(formData, "memberId");
  const exercises = getRequiredText(formData, "exercises");
  const notes = getOptionalText(formData, "notes");
  const signatureData = getOptionalText(formData, "signatureData");

  const lesson = await prisma.$transaction(async (tx) => {
    const member = await tx.member.findUnique({
      where: {
        id: memberId
      },
      select: {
        id: true,
        totalLessons: true,
        remainingLessons: true
      }
    });

    if (!member) {
      throw new Error("Member not found.");
    }

    if (member.remainingLessons <= 0) {
      throw new Error("No remaining lessons.");
    }

    const lessonNumber = member.totalLessons - member.remainingLessons + 1;

    const updateResult = await tx.member.updateMany({
      where: {
        id: memberId,
        remainingLessons: {
          gt: 0
        }
      },
      data: {
        remainingLessons: {
          decrement: 1
        }
      }
    });

    if (updateResult.count !== 1) {
      throw new Error("No remaining lessons.");
    }

    return tx.lessonLog.create({
      data: {
        memberId,
        lessonNumber,
        exercises,
        notes,
        signatureData
      }
    });
  });

  revalidatePath("/members");
  revalidatePath(`/members/${memberId}`);
  redirect(`/members/${memberId}/lessons/${lesson.id}`);
}
