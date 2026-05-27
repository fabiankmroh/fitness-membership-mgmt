import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
    timeStyle: "short"
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

export default async function LessonDetailPage({ params }) {
  const { id, lessonId } = await params;
  const lesson = await prisma.lessonLog.findUnique({
    where: {
      id: lessonId
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

  if (!lesson || lesson.memberId !== id) {
    notFound();
  }

  return (
    <main className="shell narrowShell">
      <Link className="backLink" href={`/members/${lesson.member.id}`}>
        ← {lesson.member.name} 회원 상세
      </Link>

      <section className="pageHeader">
        <div>
          <p className="eyebrow">Lesson Detail</p>
          <h1>Lesson #{lesson.lessonNumber}</h1>
          <p className="subtitle">{formatDate(lesson.createdAt)}</p>
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
