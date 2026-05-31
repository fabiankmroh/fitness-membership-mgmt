"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getRequiredFormattedPhone } from "@/lib/phone";
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

function getRequiredPositiveInteger(formData, fieldName) {
  const number = Number(formData.get(fieldName));

  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }

  return number;
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
  const user = await requireUser();
  const actionTimer = startTimer("createMemberAction");
  const totalLessons = getLessonNumber(formData, "totalLessons");
  const remainingLessons = Math.min(
    getLessonNumber(formData, "remainingLessons", totalLessons),
    totalLessons
  );

  const queryTimer = startTimer("createMemberAction member.create");
  const member = await prisma.member.create({
    data: {
      ownerUserId: user.id,
      name: getRequiredText(formData, "name"),
      phone: getRequiredFormattedPhone(formData),
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
  const user = await requireUser();
  const actionTimer = startTimer("updateMemberAction");
  const id = getRequiredText(formData, "id");
  const totalLessons = getLessonNumber(formData, "totalLessons");
  const remainingLessons = Math.min(
    getLessonNumber(formData, "remainingLessons", totalLessons),
    totalLessons
  );

  const queryTimer = startTimer("updateMemberAction member.update");
  const result = await prisma.member.updateMany({
    where: {
      id,
      ownerUserId: user.id
    },
    data: {
      name: getRequiredText(formData, "name"),
      phone: getRequiredFormattedPhone(formData),
      memo: getOptionalText(formData, "memo"),
      totalLessons,
      remainingLessons
    }
  });
  queryTimer.end();

  if (result.count !== 1) {
    throw new Error("Member not found.");
  }

  revalidatePath("/members");
  revalidatePath(`/members/${id}`);
  actionTimer.end();
}

export async function deleteMemberAction(formData) {
  const user = await requireUser();
  const actionTimer = startTimer("deleteMemberAction");
  const id = getRequiredText(formData, "id");

  const queryTimer = startTimer("deleteMemberAction member.delete");
  const result = await prisma.member.deleteMany({
    where: {
      id,
      ownerUserId: user.id
    }
  });
  queryTimer.end();

  if (result.count !== 1) {
    throw new Error("Member not found.");
  }

  revalidatePath("/members");
  actionTimer.end();
  redirect("/members");
}

export async function createLessonAction(previousState, formData) {
  const user = await requireUser();
  const actionTimer = startTimer("createLessonAction");

  try {
    const memberId = getRequiredText(formData, "memberId");
    const lessonExercises = getLessonExercises(formData);
    const notes = getOptionalText(formData, "notes");
    const signatureData = getOptionalText(formData, "signatureData");

    const transactionTimer = startTimer("createLessonAction transaction");
    const lesson = await prisma.$transaction(async (tx) => {
      const memberQueryTimer = startTimer(
        "createLessonAction transaction member.findFirst"
      );
      const member = await tx.member.findFirst({
        where: {
          id: memberId,
          ownerUserId: user.id
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
          ownerUserId: user.id,
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
    refresh();
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

export async function updateLessonAction(previousState, formData) {
  const user = await requireUser();
  const actionTimer = startTimer("updateLessonAction");

  try {
    const memberId = getRequiredText(formData, "memberId");
    const lessonId = getRequiredText(formData, "lessonId");
    const lessonExercises = getLessonExercises(formData);
    const notes = getOptionalText(formData, "notes");
    const signatureData = getOptionalText(formData, "signatureData");

    const transactionTimer = startTimer("updateLessonAction transaction");
    const lesson = await prisma.$transaction(async (tx) => {
      const existingLesson = await tx.lessonLog.findFirst({
        where: {
          id: lessonId,
          memberId,
          member: {
            ownerUserId: user.id
          }
        },
        select: {
          id: true,
          memberId: true
        }
      });

      if (!existingLesson) {
        throw new Error("Lesson not found.");
      }

      await tx.lessonExercise.deleteMany({
        where: {
          lessonLogId: lessonId
        }
      });

      return tx.lessonLog.update({
        where: {
          id: lessonId
        },
        data: {
          exercises: {
            create: lessonExercises
          },
          notes,
          signatureData
        }
      });
    });
    transactionTimer.end();

    revalidatePath("/members");
    revalidatePath(`/members/${memberId}`);
    revalidatePath(`/members/${memberId}/lessons/${lessonId}`);
    actionTimer.end();

    return {
      error: "",
      ok: true,
      redirectTo: `/members/${memberId}/lessons/${lesson.id}?lessonUpdated=1`
    };
  } catch (error) {
    actionTimer.end("error");

    return {
      error:
        error.message === "At least one exercise is required."
          ? "운동을 하나 이상 선택해 주세요."
          : "레슨 수정 중 문제가 발생했습니다.",
      ok: false,
      redirectTo: ""
    };
  }
}

export async function deleteLessonAction(formData) {
  const user = await requireUser();
  const actionTimer = startTimer("deleteLessonAction");
  let memberId = "";

  try {
    memberId = getRequiredText(formData, "memberId");
    const lessonId = getRequiredText(formData, "lessonId");

    const transactionTimer = startTimer("deleteLessonAction transaction");
    await prisma.$transaction(async (tx) => {
      const lessonQueryTimer = startTimer(
        "deleteLessonAction transaction lessonLog.findFirst"
      );
      const lesson = await tx.lessonLog.findFirst({
        where: {
          id: lessonId,
          memberId,
          member: {
            ownerUserId: user.id
          }
        },
        select: {
          id: true,
          memberId: true
        }
      });
      lessonQueryTimer.end();

      if (!lesson) {
        throw new Error("Lesson not found.");
      }

      const memberQueryTimer = startTimer(
        "deleteLessonAction transaction member.findFirst"
      );
      const member = await tx.member.findFirst({
        where: {
          id: memberId,
          ownerUserId: user.id
        },
        select: {
          remainingLessons: true,
          totalLessons: true
        }
      });
      memberQueryTimer.end();

      if (!member) {
        throw new Error("Member not found.");
      }

      const deleteTimer = startTimer(
        "deleteLessonAction transaction lessonLog.delete"
      );
      await tx.lessonLog.delete({
        where: {
          id: lessonId
        }
      });
      deleteTimer.end();

      const updateTimer = startTimer(
        "deleteLessonAction transaction member.updateMany"
      );
      const updateResult = await tx.member.updateMany({
        where: {
          id: memberId,
          ownerUserId: user.id
        },
        data: {
          remainingLessons: Math.min(
            member.remainingLessons + 1,
            member.totalLessons
          )
        }
      });
      updateTimer.end();

      if (updateResult.count !== 1) {
        throw new Error("Member not found.");
      }
    });
    transactionTimer.end();

    revalidatePath("/members");
    revalidatePath(`/members/${memberId}`);
    actionTimer.end();
  } catch (error) {
    actionTimer.end("error");
    throw error;
  }

  redirect(`/members/${memberId}?lessonDeleted=1`);
}

export async function createLessonCreditTransactionAction(formData) {
  const user = await requireUser();
  const memberId = getRequiredText(formData, "memberId");
  const lessonCount = getRequiredPositiveInteger(formData, "lessonCount");
  const memo = getOptionalText(formData, "memo");

  await prisma.$transaction(async (tx) => {
    const member = await tx.member.findFirst({
      where: {
        id: memberId,
        ownerUserId: user.id
      },
      select: {
        id: true
      }
    });

    if (!member) {
      throw new Error("Member not found.");
    }

    await tx.lessonCreditTransaction.create({
      data: {
        memberId,
        lessonCount,
        memo
      }
    });

    const updateResult = await tx.member.updateMany({
      where: {
        id: memberId,
        ownerUserId: user.id
      },
      data: {
        remainingLessons: {
          increment: lessonCount
        },
        totalLessons: {
          increment: lessonCount
        }
      }
    });

    if (updateResult.count !== 1) {
      throw new Error("Member not found.");
    }
  });

  revalidatePath("/members");
  revalidatePath(`/members/${memberId}`);
  refresh();
  redirect(`/members/${memberId}?creditAdded=${lessonCount}`);
}

export async function deleteLessonCreditTransactionAction(formData) {
  const user = await requireUser();
  const actionTimer = startTimer("deleteLessonCreditTransactionAction");
  let memberId = "";

  try {
    memberId = getRequiredText(formData, "memberId");
    const transactionId = getRequiredText(formData, "transactionId");

    const transactionTimer = startTimer(
      "deleteLessonCreditTransactionAction transaction"
    );
    await prisma.$transaction(async (tx) => {
      const creditQueryTimer = startTimer(
        "deleteLessonCreditTransactionAction transaction lessonCreditTransaction.findFirst"
      );
      const transaction = await tx.lessonCreditTransaction.findFirst({
        where: {
          id: transactionId,
          memberId,
          member: {
            ownerUserId: user.id
          }
        },
        select: {
          id: true,
          lessonCount: true,
          memberId: true
        }
      });
      creditQueryTimer.end();

      if (!transaction) {
        throw new Error("Lesson credit transaction not found.");
      }

      const memberQueryTimer = startTimer(
        "deleteLessonCreditTransactionAction transaction member.findFirst"
      );
      const member = await tx.member.findFirst({
        where: {
          id: memberId,
          ownerUserId: user.id
        },
        select: {
          remainingLessons: true,
          totalLessons: true
        }
      });
      memberQueryTimer.end();

      if (!member) {
        throw new Error("Member not found.");
      }

      const deleteTimer = startTimer(
        "deleteLessonCreditTransactionAction transaction lessonCreditTransaction.delete"
      );
      await tx.lessonCreditTransaction.delete({
        where: {
          id: transactionId
        }
      });
      deleteTimer.end();

      const updateTimer = startTimer(
        "deleteLessonCreditTransactionAction transaction member.updateMany"
      );
      const updateResult = await tx.member.updateMany({
        where: {
          id: memberId,
          ownerUserId: user.id
        },
        data: {
          remainingLessons: Math.max(
            0,
            member.remainingLessons - transaction.lessonCount
          ),
          totalLessons: Math.max(
            0,
            member.totalLessons - transaction.lessonCount
          )
        }
      });
      updateTimer.end();

      if (updateResult.count !== 1) {
        throw new Error("Member not found.");
      }
    });
    transactionTimer.end();

    revalidatePath("/members");
    revalidatePath(`/members/${memberId}`);
    refresh();
    actionTimer.end();
  } catch (error) {
    actionTimer.end("error");
    throw error;
  }

  redirect(`/members/${memberId}?creditDeleted=1`);
}
