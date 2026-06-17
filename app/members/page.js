import Link from "next/link";
import { createMemberAction, deleteMemberAction } from "./actions";
import DeleteMemberForm from "./DeleteMemberForm";
import LogoutForm from "./LogoutForm";
import PhoneInput from "./PhoneInput";
import { requireUser } from "@/lib/auth";
import { formatPhoneNumber } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { startTimer } from "@/lib/timing";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDateOnly(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeZone: "Asia/Seoul"
  }).format(date);
}

function getCreditValidityStatus(member, now) {
  const expiringCredits = member.lessonCreditTransactions.filter(
    (transaction) => transaction.expiresAt
  );

  if (expiringCredits.length === 0) {
    return {
      detail: "수업권 유효기간 미설정",
      label: "유효기간 없음",
      state: "empty"
    };
  }

  const activeCredit = expiringCredits.find(
    (transaction) => transaction.expiresAt >= now
  );
  const credit = activeCredit || expiringCredits[expiringCredits.length - 1];
  const expiresAt = credit.expiresAt;
  const remainingMs = Math.max(expiresAt.getTime() - now.getTime(), 0);
  const remainingDays = Math.ceil(remainingMs / DAY_MS);

  if (!activeCredit) {
    return {
      detail: `최근 만료 ${formatDateOnly(expiresAt)}`,
      label: "만료됨",
      state: "expired"
    };
  }

  return {
    detail: `유효기간 ${formatDateOnly(expiresAt)}`,
    label: remainingDays <= 0 ? "오늘 만료" : `${remainingDays}일 남음`,
    state: "active"
  };
}

function MemberCard({ member, validityStatus }) {
  return (
    <article className="memberCard" key={member.id}>
      <div>
        <Link className="memberName" href={`/members/${member.id}`}>
          {member.name}
        </Link>
        <p className="muted">{formatPhoneNumber(member.phone) || "연락처 없음"}</p>
      </div>

      <div className="memberMeters">
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
                        (member.remainingLessons / member.totalLessons) * 100
                      )}%`
              }}
            />
          </div>
        </div>

        <div className={`validityMeter ${validityStatus.state}`}>
          <span>
            {validityStatus.label}
            <small>{validityStatus.detail}</small>
          </span>
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
  );
}

export default async function MembersPage() {
  const user = await requireUser();
  const now = new Date();
  const appUser = await prisma.appUser.findUnique({
    where: {
      id: user.id
    },
    select: {
      role: true
    }
  });
  const pageTimer = startTimer("/members page");
  const queryTimer = startTimer("/members member.findMany");
  const members = await prisma.member.findMany({
    where: {
      ownerUserId: user.id
    },
    select: {
      id: true,
      name: true,
      phone: true,
      totalLessons: true,
      remainingLessons: true,
      lessonCreditTransactions: {
        where: {
          expiresAt: {
            not: null
          }
        },
        orderBy: {
          expiresAt: "asc"
        },
        select: {
          createdAt: true,
          expiresAt: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
  queryTimer.end();
  pageTimer.end();
  const membersWithValidity = members.map((member) => ({
    ...member,
    validityStatus: getCreditValidityStatus(member, now)
  }));
  const activeMembers = membersWithValidity.filter(
    (member) => member.validityStatus.state !== "expired"
  );
  const expiredMembers = membersWithValidity.filter(
    (member) => member.validityStatus.state === "expired"
  );

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
        <div className="headerActions">
          {appUser?.role === "MASTER" ? (
            <Link className="secondaryButton" href="/admin/users">
              사용자 관리
            </Link>
          ) : null}
          <LogoutForm email={user.email} />
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
            <PhoneInput />
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
              <h2>{activeMembers.length}명</h2>
              {expiredMembers.length > 0 ? (
                <p className="muted">만료된 회원 {expiredMembers.length}명 숨김</p>
              ) : null}
            </div>
          </div>

          {members.length === 0 ? (
            <div className="emptyState">
              <h3>아직 등록된 회원이 없습니다.</h3>
              <p>왼쪽 양식에서 첫 회원을 추가하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="cards">
              {activeMembers.length === 0 ? (
                <div className="emptyState">
                  <h3>활성 회원이 없습니다.</h3>
                  <p>만료된 회원은 아래에서 펼쳐볼 수 있습니다.</p>
                </div>
              ) : (
                activeMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    validityStatus={member.validityStatus}
                  />
                ))
              )}

              {expiredMembers.length > 0 ? (
                <details className="expiredMembersPanel">
                  <summary>
                    만료된 회원들 보기
                    <span>{expiredMembers.length}명</span>
                  </summary>
                  <div className="expiredMembersCards">
                    {expiredMembers.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        validityStatus={member.validityStatus}
                      />
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
