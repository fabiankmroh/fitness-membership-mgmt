import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMemberAction, updateMemberAction } from "../actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }) {
  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: {
      id
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

      <form action={deleteMemberAction} className="deletePanel">
        <input name="id" type="hidden" value={member.id} />
        <div>
          <h2>회원 삭제</h2>
          <p>삭제하면 PostgreSQL 데이터베이스에서 이 회원 정보가 제거됩니다.</p>
        </div>
        <button className="dangerButton" type="submit">
          이 회원 삭제
        </button>
      </form>
    </main>
  );
}
