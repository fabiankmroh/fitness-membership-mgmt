import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteLessonAction } from "../../../actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DeleteLessonForm from "../DeleteLessonForm";

export const dynamic = "force-dynamic";

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(date);
}

function getExerciseName(exercise) {
  return exercise.exerciseCatalog?.name || exercise.customName || "운동명 없음";
}

function getExerciseCategoryName(exercise) {
  return (
    exercise.exerciseCatalog?.category?.name ||
    exercise.customCategory?.name ||
    "부위 없음"
  );
}

export default async function LessonDetailPage({ params, searchParams }) {
  const user = await requireUser();
  const { id, lessonId } = await params;
  const resolvedSearchParams = await searchParams;
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

  return (
    <main className="shell narrowShell">
      <Link className="backLink" href={`/members/${lesson.member.id}`}>
        ← {lesson.member.name} 회원 상세
      </Link>

      {resolvedSearchParams?.lessonUpdated === "1" ? (
        <div className="successNotice" role="status">
          레슨 기록이 수정되었습니다.
        </div>
      ) : null}

      <section className="pageHeader">
        <div>
          <p className="eyebrow">Lesson Detail</p>
          <h1>Lesson #{lesson.lessonNumber}</h1>
          <p className="subtitle">{formatDate(lesson.createdAt)}</p>
        </div>
        <div className="detailActions">
          <Link
            className="secondaryButton"
            href={`/members/${lesson.member.id}/lessons/${lesson.id}/edit`}
          >
            레슨 수정
          </Link>
          <DeleteLessonForm
            action={deleteLessonAction}
            lessonId={lesson.id}
            lessonNumber={lesson.lessonNumber}
            memberId={lesson.member.id}
          />
        </div>
      </section>

      <section className="panel lessonDetail">
        <div className="lessonDetailBlock">
          <p className="sectionLabel">운동 내용</p>
          {lesson.exercises.length === 0 ? (
            <p>운동 기록 없음</p>
          ) : (
            <div className="lessonExerciseDetailRows">
              {lesson.exercises.map((exercise) => (
                <article className="lessonExerciseDetailRow" key={exercise.id}>
                  <div>
                    <strong>{getExerciseName(exercise)}</strong>
                    <span>{getExerciseCategoryName(exercise)}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>세트</dt>
                      <dd>{exercise.sets ?? "-"}</dd>
                    </div>
                    <div>
                      <dt>reps</dt>
                      <dd>{exercise.reps ?? "-"}</dd>
                    </div>
                    <div>
                      <dt>중량</dt>
                      <dd>
                        {exercise.weightKg === null
                          ? "-"
                          : `${exercise.weightKg.toString()}kg`}
                      </dd>
                    </div>
                  </dl>
                  {exercise.memo ? <p>{exercise.memo}</p> : null}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="lessonDetailBlock">
          <p className="sectionLabel">메모</p>
          <p>{lesson.notes || "메모 없음"}</p>
        </div>

        {lesson.signatureData ? (
          <div className="lessonDetailBlock">
            <p className="sectionLabel">회원 서명</p>
            <div className="signaturePreview">
              <img alt={`${lesson.member.name} 회원 서명`} src={lesson.signatureData} />
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
