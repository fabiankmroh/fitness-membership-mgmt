import Link from "next/link";
import { notFound } from "next/navigation";
import { getExerciseCatalogForForm } from "@/lib/exerciseCatalog";
import { prisma } from "@/lib/prisma";
import { startTimer } from "@/lib/timing";
import LessonForm from "../LessonForm";

export const dynamic = "force-dynamic";

export default async function NewLessonPage({ params }) {
  const pageTimer = startTimer("/members/[id]/lessons/new page");
  const { id } = await params;
  const memberQueryTimer = startTimer(
    "/members/[id]/lessons/new member.findUnique"
  );
  const member = await prisma.member.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      name: true,
      totalLessons: true,
      remainingLessons: true
    }
  });
  memberQueryTimer.end();

  if (!member) {
    pageTimer.end("notFound");
    notFound();
  }

  const canCreateLesson = member.remainingLessons > 0;
  let exerciseCategories = [];

  if (canCreateLesson) {
    const catalogQueryTimer = startTimer(
      "/members/[id]/lessons/new exerciseCatalog"
    );
    exerciseCategories = await getExerciseCatalogForForm();
    catalogQueryTimer.end();
  }

  pageTimer.end();

  return (
    <main className="shell narrowShell">
      <Link className="backLink" href={`/members/${member.id}`}>
        ← {member.name} 회원 상세
      </Link>

      <section className="pageHeader detailHeader">
        <div>
          <p className="eyebrow">New Lesson</p>
          <h1>새 레슨 등록</h1>
          <p className="subtitle">
            수업 내용과 메모를 저장하고, 저장 시 잔여 레슨이 1회 차감됩니다.
          </p>
        </div>

        <div className="lessonBadge">
          <strong>{member.remainingLessons}회</strong>
          <span>남음 / {member.totalLessons}회</span>
        </div>
      </section>

      {canCreateLesson ? (
        <LessonForm
          exerciseCategories={exerciseCategories}
          memberId={member.id}
        />
      ) : (
        <section className="panel lessonBlocked">
          <h2>잔여 레슨이 없습니다.</h2>
          <p>회원 정보에서 레슨 횟수를 먼저 추가한 뒤 새 레슨을 기록할 수 있습니다.</p>
        </section>
      )}
    </main>
  );
}
