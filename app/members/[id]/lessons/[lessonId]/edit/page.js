import Link from "next/link";
import { notFound } from "next/navigation";
import { getExerciseCatalogForForm } from "@/lib/exerciseCatalog";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LessonForm from "../../LessonForm";

export const dynamic = "force-dynamic";

function formatDecimal(value) {
  return value === null || value === undefined ? "" : value.toString();
}

export default async function EditLessonPage({ params }) {
  const user = await requireUser();
  const { id, lessonId } = await params;
  const lesson = await prisma.lessonLog.findFirst({
    where: {
      id: lessonId,
      memberId: id,
      member: {
        ownerUserId: user.id
      }
    },
    include: {
      member: {
        select: {
          id: true,
          name: true
        }
      },
      exercises: {
        orderBy: {
          sortOrder: "asc"
        },
        include: {
          customCategory: true,
          exerciseCatalog: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });

  if (!lesson) {
    notFound();
  }

  const exerciseCategories = await getExerciseCatalogForForm();
  const initialSelectedExercises = lesson.exercises.map((exercise) => ({
    categoryId:
      exercise.exerciseCatalog?.categoryId || exercise.customCategoryId || "",
    categoryName:
      exercise.exerciseCatalog?.category?.name ||
      exercise.customCategory?.name ||
      "부위 없음",
    customId: exercise.exerciseCatalogId ? "" : exercise.id,
    customName: exercise.customName,
    exerciseCatalogId: exercise.exerciseCatalogId || "",
    memo: exercise.memo,
    name: exercise.exerciseCatalog?.name || exercise.customName || "운동명 없음",
    reps: exercise.reps === null ? "" : String(exercise.reps),
    sets: exercise.sets === null ? "" : String(exercise.sets),
    weightKg: formatDecimal(exercise.weightKg)
  }));

  return (
    <main className="shell narrowShell">
      <Link
        className="backLink"
        href={`/members/${lesson.member.id}/lessons/${lesson.id}`}
      >
        ← Lesson #{lesson.lessonNumber}
      </Link>

      <section className="pageHeader">
        <div>
          <p className="eyebrow">Edit Lesson</p>
          <h1>레슨 수정</h1>
          <p className="subtitle">
            잘못 입력한 운동, 횟수, 중량, 메모를 수정할 수 있습니다.
          </p>
        </div>
      </section>

      <LessonForm
        exerciseCategories={exerciseCategories}
        initialNotes={lesson.notes}
        initialSelectedExercises={initialSelectedExercises}
        initialSignatureData={lesson.signatureData}
        lessonId={lesson.id}
        memberId={lesson.member.id}
        mode="edit"
      />
    </main>
  );
}
