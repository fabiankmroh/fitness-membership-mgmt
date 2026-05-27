import Link from "next/link";
import { notFound } from "next/navigation";
import { createLessonAction } from "../../../actions";
import { prisma } from "@/lib/prisma";
import SignaturePad from "../SignaturePad";

export const dynamic = "force-dynamic";

export default async function NewLessonPage({ params }) {
  const { id } = await params;
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

  if (!member) {
    notFound();
  }

  const canCreateLesson = member.remainingLessons > 0;

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
        <form action={createLessonAction} className="panel formPanel lessonForm">
          <input name="memberId" type="hidden" value={member.id} />

          <label>
            운동 내용
            <textarea
              name="exercises"
              placeholder="예: 스쿼트 3세트, 벤치프레스 3세트, 유산소 15분"
              required
              rows="6"
            />
          </label>

          <label>
            메모
            <textarea
              name="notes"
              placeholder="컨디션, 다음 수업에서 확인할 점, 주의사항 등을 적습니다."
              rows="4"
            />
          </label>

          <SignaturePad />

          <div className="formActions">
            <button className="primaryButton" type="submit">
              레슨 저장
            </button>
          </div>
        </form>
      ) : (
        <section className="panel lessonBlocked">
          <h2>잔여 레슨이 없습니다.</h2>
          <p>회원 정보에서 레슨 횟수를 먼저 추가한 뒤 새 레슨을 기록할 수 있습니다.</p>
        </section>
      )}
    </main>
  );
}
