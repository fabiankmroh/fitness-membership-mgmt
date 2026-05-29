"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { startTimer } from "@/lib/timing";

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

function getOptionalNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}

function getOptionalInteger(value) {
  const number = getOptionalNumber(value);
  return number === null ? null : Math.floor(number);
}

function getFormDataList(formData, fieldName) {
  return formData.getAll(fieldName).map((value) => String(value || "").trim());
}

function getLessonExercises(formData) {
  const exerciseCatalogIds = getFormDataList(formData, "exerciseCatalogId");
  const customCategoryIds = getFormDataList(formData, "customCategoryId");
  const customNames = getFormDataList(formData, "customName");
  const sets = getFormDataList(formData, "sets");
  const reps = getFormDataList(formData, "reps");
  const weightKg = getFormDataList(formData, "weightKg");
  const memos = getFormDataList(formData, "exerciseMemo");
  const sortOrders = getFormDataList(formData, "sortOrder");

  const rowCount = Math.max(
    exerciseCatalogIds.length,
    customNames.length,
    reps.length
  );
  const exercises = [];

  for (let index = 0; index < rowCount; index += 1) {
    const exerciseCatalogId = exerciseCatalogIds[index] || null;
    const customName = customNames[index] || "";
    const customCategoryId = exerciseCatalogId
      ? null
      : customCategoryIds[index] || null;

    if (!exerciseCatalogId && !customName) {
      continue;
    }

    if (!exerciseCatalogId && !customCategoryId) {
      throw new Error("Custom exercise category is required.");
    }

    exercises.push({
      customCategoryId,
      customName,
      exerciseCatalogId,
      memo: memos[index] || "",
      reps: getOptionalInteger(reps[index]),
      sets: getOptionalInteger(sets[index]),
      sortOrder: getOptionalInteger(sortOrders[index]) ?? exercises.length,
      weightKg: getOptionalNumber(weightKg[index])
    });
  }

  if (exercises.length === 0) {
    throw new Error("At least one exercise is required.");
  }

  return exercises;
}

export async function createMemberAction(formData) {
  const actionTimer = startTimer("createMemberAction");
  const totalLessons = getLessonNumber(formData, "totalLessons");
  const remainingLessons = Math.min(
    getLessonNumber(formData, "remainingLessons", totalLessons),
    totalLessons
  );

  const queryTimer = startTimer("createMemberAction member.create");
  const member = await prisma.member.create({
    data: {
      name: getRequiredText(formData, "name"),
      phone: getOptionalText(formData, "phone"),
      memo: getOptionalText(formData, "memo"),
      totalLessons,
      remainingLessons
    }
  });
  queryTimer.end();

  revalidatePath("/members");
  actionTimer.end();
  redirect(`/members/${member.id}?memberCreated=1`);
}

export async function updateMemberAction(formData) {
  const actionTimer = startTimer("updateMemberAction");
  const id = getRequiredText(formData, "id");
  const totalLessons = getLessonNumber(formData, "totalLessons");
  const remainingLessons = Math.min(
    getLessonNumber(formData, "remainingLessons", totalLessons),
    totalLessons
  );

  const queryTimer = startTimer("updateMemberAction member.update");
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
  queryTimer.end();

  revalidatePath("/members");
  revalidatePath(`/members/${id}`);
  actionTimer.end();
}

export async function deleteMemberAction(formData) {
  const actionTimer = startTimer("deleteMemberAction");
  const id = getRequiredText(formData, "id");

  const queryTimer = startTimer("deleteMemberAction member.delete");
  await prisma.member.delete({
    where: {
      id
    }
  });
  queryTimer.end();

  revalidatePath("/members");
  actionTimer.end();
  redirect("/members");
}

export async function createLessonAction(previousState, formData) {
  const actionTimer = startTimer("createLessonAction");

  try {
    const memberId = getRequiredText(formData, "memberId");
    const lessonExercises = getLessonExercises(formData);
    const notes = getOptionalText(formData, "notes");
    const signatureData = getOptionalText(formData, "signatureData");

    const transactionTimer = startTimer("createLessonAction transaction");
    const lesson = await prisma.$transaction(async (tx) => {
      const memberQueryTimer = startTimer(
        "createLessonAction transaction member.findUnique"
      );
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
      memberQueryTimer.end();

      if (!member) {
        throw new Error("Member not found.");
      }

      if (member.remainingLessons <= 0) {
        throw new Error("No remaining lessons.");
      }

      const lessonNumber = member.totalLessons - member.remainingLessons + 1;

      const updateTimer = startTimer(
        "createLessonAction transaction member.updateMany"
      );
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
      updateTimer.end();

      if (updateResult.count !== 1) {
        throw new Error("No remaining lessons.");
      }

      const createLessonTimer = startTimer(
        "createLessonAction transaction lessonLog.create"
      );
      const createdLesson = await tx.lessonLog.create({
        data: {
          memberId,
          lessonNumber,
          exercises: {
            create: lessonExercises
          },
          notes,
          signatureData
        }
      });
      createLessonTimer.end();

      return createdLesson;
    });
    transactionTimer.end();

    revalidatePath("/members");
    revalidatePath(`/members/${memberId}`);
    actionTimer.end();

    return {
      error: "",
      ok: true,
      redirectTo: `/members/${memberId}?lessonCreated=${lesson.lessonNumber}`
    };
  } catch (error) {
    actionTimer.end("error");

    return {
      error:
        error.message === "No remaining lessons."
          ? "잔여 레슨이 없습니다."
          : error.message === "At least one exercise is required."
            ? "운동을 하나 이상 선택해 주세요."
          : "레슨 저장 중 문제가 발생했습니다.",
      ok: false,
      redirectTo: ""
    };
  }
}
