import Link from "next/link";
import { createMemberAction, deleteMemberAction } from "./actions";
import DeleteMemberForm from "./DeleteMemberForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: {
      updatedAt: "desc"
    }
  });

  return (
    <main className="shell">
      <section className="pageHeader">
        <div>
          <p className="eyebrow">{"Member -> Manage"}</p>
          <h1>피트니스 회원 명부</h1>
          <p className="subtitle">
            회원 추가, 삭제, 잔여 레슨 횟수 관리를 먼저 안정적으로 만듭니다.
          </p>
        </div>
      </section>

      <section className="gridTwo">
        <form action={createMemberAction} className="panel formPanel">
          <div>
            <p className="sectionLabel">새 회원</p>
            <h2>회원 등록</h2>
          </div>

          <label>
            이름
            <input name="name" placeholder="예: 김민지" required />
          </label>

          <label>
            연락처
            <input name="phone" placeholder="예: 010-1234-5678" />
          </label>

          <div className="lessonInputs">
            <label>
              총 레슨
              <input
                name="totalLessons"
                type="number"
                min="0"
                defaultValue="30"
              />
            </label>

            <label>
              잔여 레슨
              <input
                name="remainingLessons"
                type="number"
                min="0"
                defaultValue="30"
              />
            </label>
          </div>

          <label>
            메모
            <textarea
              name="memo"
              rows="4"
              placeholder="목표, 주의사항, 결제 메모 등을 적어둘 수 있습니다."
            />
          </label>

          <button className="primaryButton" type="submit">
            회원 추가
          </button>
        </form>

        <section className="memberList">
          <div className="listHeader">
            <div>
              <p className="sectionLabel">회원 목록</p>
              <h2>{members.length}명</h2>
            </div>
          </div>

          {members.length === 0 ? (
            <div className="emptyState">
              <h3>아직 등록된 회원이 없습니다.</h3>
              <p>왼쪽 양식에서 첫 회원을 추가하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="cards">
              {members.map((member) => (
                <article className="memberCard" key={member.id}>
                  <div>
                    <Link className="memberName" href={`/members/${member.id}`}>
                      {member.name}
                    </Link>
                    <p className="muted">{member.phone || "연락처 없음"}</p>
                  </div>

                  <div className="lessonMeter">
                    <span>
                      {member.remainingLessons}회 남음 / {member.totalLessons}회
                    </span>
                    <div className="meterTrack">
                      <div
                        className="meterFill"
                        style={{
                          width:
                            member.totalLessons === 0
                              ? "0%"
                              : `${Math.round(
                                  (member.remainingLessons /
                                    member.totalLessons) *
                                    100
                                )}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="cardActions">
                    <Link className="secondaryButton" href={`/members/${member.id}`}>
                      편집
                    </Link>
                    <DeleteMemberForm
                      action={deleteMemberAction}
                      memberId={member.id}
                      memberName={member.name}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
