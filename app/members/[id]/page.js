import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMemberAction, updateMemberAction } from "../actions";
import DeleteMemberForm from "../DeleteMemberForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function MemberDetailPage({ params }) {
  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: {
      id
    },
    include: {
      lessons: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!member) {
    notFound();
  }

  return (
    <main className="shell narrowShell">
      <Link className="backLink" href="/members">
        ← 회원 목록
      </Link>

      <section className="pageHeader detailHeader">
        <div>
          <p className="eyebrow">Member Detail</p>
          <h1>{member.name}</h1>
          <p className="subtitle">
            잔여 레슨 횟수를 직접 조정할 수 있는 첫 번째 온라인 MVP 대상 화면입니다.
          </p>
        </div>

        <div className="lessonBadge">
          <strong>{member.remainingLessons}회</strong>
          <span>남음 / {member.totalLessons}회</span>
        </div>
      </section>

      <form action={updateMemberAction} className="panel formPanel">
        <input name="id" type="hidden" value={member.id} />

        <label>
          이름
          <input name="name" defaultValue={member.name} required />
        </label>

        <label>
          연락처
          <input name="phone" defaultValue={member.phone} />
        </label>

        <div className="lessonInputs">
          <label>
            총 레슨
            <input
              name="totalLessons"
              type="number"
              min="0"
              defaultValue={member.totalLessons}
            />
          </label>

          <label>
            잔여 레슨
            <input
              name="remainingLessons"
              type="number"
              min="0"
              defaultValue={member.remainingLessons}
            />
          </label>
        </div>

        <label>
          메모
          <textarea name="memo" rows="5" defaultValue={member.memo} />
        </label>

        <div className="formActions">
          <button className="primaryButton" type="submit">
            변경사항 저장
          </button>
        </div>
      </form>

      <section className="panel lessonLogSection">
        <div className="lessonLogHeader">
          <div>
            <p className="sectionLabel">Lesson Log</p>
            <h2>레슨 기록</h2>
          </div>

          {member.remainingLessons > 0 ? (
            <Link className="primaryButton" href={`/members/${member.id}/lessons/new`}>
              새 레슨 등록
            </Link>
          ) : (
            <button className="secondaryButton" disabled type="button">
              잔여 레슨 없음
            </button>
          )}
        </div>

        {member.lessons.length === 0 ? (
          <div className="lessonEmpty">
            <h3>아직 레슨 기록이 없습니다.</h3>
            <p>첫 수업을 마친 뒤 레슨 내용을 기록하면 여기에 쌓입니다.</p>
          </div>
        ) : (
          <div className="lessonRows">
            {member.lessons.map((lesson) => (
              <Link
                className="lessonRow"
                href={`/members/${member.id}/lessons/${lesson.id}`}
                key={lesson.id}
              >
                <strong>Lesson #{lesson.lessonNumber}</strong>
                <span>{lesson.notes || lesson.exercises}</span>
                <time dateTime={lesson.createdAt.toISOString()}>
                  {formatDate(lesson.createdAt)}
                </time>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="deletePanel">
        <div>
          <h2>회원 삭제</h2>
          <p>삭제하면 PostgreSQL 데이터베이스에서 이 회원 정보가 제거됩니다.</p>
        </div>
        <DeleteMemberForm
          action={deleteMemberAction}
          buttonText="이 회원 삭제"
          memberId={member.id}
          memberName={member.name}
        />
      </section>
    </main>
  );
}
