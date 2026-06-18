import Link from "next/link";
import LogoutForm from "./LogoutForm";
import { requireUser } from "@/lib/auth";
import { formatKstTime } from "@/lib/kst";
import { prisma } from "@/lib/prisma";
import { startTimer } from "@/lib/timing";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function getValidityStatus(member, now) {
  const expiringCredits = member.lessonCreditTransactions.filter(
    (transaction) => transaction.expiresAt
  );

  if (expiringCredits.length === 0) {
    return "empty";
  }

  return expiringCredits.some((transaction) => transaction.expiresAt >= now)
    ? "active"
    : "expired";
}

function getDaysUntil(date, now) {
  return Math.ceil(Math.max(date.getTime() - now.getTime(), 0) / DAY_MS);
}

export default async function MembersHomePage() {
  const user = await requireUser();
  const now = new Date();
  const nextFiveHours = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const appUser = await prisma.appUser.findUnique({
    where: {
      id: user.id
    },
    select: {
      role: true
    }
  });
  const pageTimer = startTimer("/members dashboard page");
  const queryTimer = startTimer("/members dashboard member.findMany");
  const members = await prisma.member.findMany({
    where: {
      ownerUserId: user.id
    },
    select: {
      id: true,
      name: true,
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
          expiresAt: true
        }
      }
    }
  });
  const upcomingReservations = await prisma.lessonReservation.findMany({
    where: {
      startsAt: {
        gte: now,
        lte: nextFiveHours
      },
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
      }
    },
    orderBy: {
      startsAt: "asc"
    }
  });
  queryTimer.end();
  pageTimer.end();

  const totalMembers = members.length;
  const activeMembers = members.filter(
    (member) => getValidityStatus(member, now) !== "expired"
  );
  const expiredMembers = members.filter(
    (member) => getValidityStatus(member, now) === "expired"
  );
  const totalLessons = members.reduce(
    (sum, member) => sum + member.totalLessons,
    0
  );
  const remainingLessons = members.reduce(
    (sum, member) => sum + member.remainingLessons,
    0
  );
  const usedLessons = Math.max(totalLessons - remainingLessons, 0);
  const lowLessonMembers = activeMembers
    .filter((member) => member.remainingLessons <= 3)
    .sort((first, second) => first.remainingLessons - second.remainingLessons);
  const expiringMembers = activeMembers
    .map((member) => {
      const nextExpiration = member.lessonCreditTransactions.find(
        (transaction) => transaction.expiresAt >= now
      );

      return nextExpiration
        ? {
            ...member,
            daysLeft: getDaysUntil(nextExpiration.expiresAt, now)
          }
        : null;
    })
    .filter(Boolean)
    .filter((member) => member.daysLeft <= 14)
    .sort((first, second) => first.daysLeft - second.daysLeft);
  const lessonUsagePercent =
    totalLessons === 0 ? 0 : Math.round((usedLessons / totalLessons) * 100);
  const memberStats = [
    { label: "활성", value: `${activeMembers.length}명` },
    { label: "만료", value: `${expiredMembers.length}명` },
    { label: "전체", value: `${totalMembers}명` }
  ];
  const lessonStats = [
    { label: "잔여", value: `${remainingLessons}회` },
    { label: "사용", value: `${usedLessons}회` },
    { label: "전체", value: `${totalLessons}회` }
  ];

  return (
    <main className="shell">
      <section className="pageHeader">
        <div>
          <p className="eyebrow">Home</p>
          <h1>운영 현황</h1>
          <p className="subtitle">
            회원 수, 잔여 레슨, 만료 상태를 한 화면에서 확인합니다.
          </p>
        </div>
        <div className="headerActions">
          <Link className="secondaryButton" href="/calendar">
            캘린더
          </Link>
          <Link className="primaryButton" href="/members/manage">
            회원 등록/목록
          </Link>
          {appUser?.role === "MASTER" ? (
            <Link className="secondaryButton" href="/admin/users">
              사용자 관리
            </Link>
          ) : null}
          <LogoutForm email={user.email} />
        </div>
      </section>

      <section className="dashboardGrid">
        <article className="panel dashboardPanel">
          <div>
            <p className="sectionLabel">Next 5 Hours</p>
            <h2>곧 도착할 회원</h2>
          </div>

          {upcomingReservations.length === 0 ? (
            <div className="lessonEmpty">
              <h3>앞으로 5시간 내 예약이 없습니다.</h3>
              <p>캘린더에 예약을 추가하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="dashboardRows">
              {upcomingReservations.map((reservation) => (
                <Link
                  className="dashboardRow"
                  href={`/members/${reservation.member.id}`}
                  key={reservation.id}
                >
                  <strong>{reservation.member.name}</strong>
                  <span>{formatKstTime(reservation.startsAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="panel dashboardPanel">
          <div>
            <p className="sectionLabel">Expiring Soon</p>
            <h2>만료 임박</h2>
          </div>

          {expiringMembers.length === 0 ? (
            <div className="lessonEmpty">
              <h3>14일 내 만료 회원이 없습니다.</h3>
              <p>유효기간이 가까운 회원이 생기면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="dashboardRows">
              {expiringMembers.slice(0, 5).map((member) => (
                <Link
                  className="dashboardRow"
                  href={`/members/${member.id}`}
                  key={member.id}
                >
                  <strong>{member.name}</strong>
                  <span>{member.daysLeft <= 0 ? "오늘 만료" : `${member.daysLeft}일 남음`}</span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="panel dashboardPanel">
          <div>
            <p className="sectionLabel">Low Lessons</p>
            <h2>잔여 레슨 부족</h2>
          </div>

          {lowLessonMembers.length === 0 ? (
            <div className="lessonEmpty">
              <h3>잔여 레슨 부족 회원이 없습니다.</h3>
              <p>3회 이하로 남은 회원이 생기면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="dashboardRows">
              {lowLessonMembers.slice(0, 5).map((member) => (
                <Link
                  className="dashboardRow"
                  href={`/members/${member.id}`}
                  key={member.id}
                >
                  <strong>{member.name}</strong>
                  <span>{member.remainingLessons}회 남음</span>
                </Link>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="overviewGrid">
        <article className="panel overviewCard">
          <div>
            <p className="sectionLabel">Members</p>
            <h2>회원 현황</h2>
          </div>
          <div className="overviewStats">
            {memberStats.map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel overviewCard">
          <div className="dashboardPanelHeader">
            <div>
              <p className="sectionLabel">Lessons</p>
              <h2>레슨 현황</h2>
            </div>
            <strong>{lessonUsagePercent}%</strong>
          </div>
          <div className="overviewStats">
            {lessonStats.map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
          <div className="meterTrack dashboardMeter">
            <div className="meterFill" style={{ width: `${lessonUsagePercent}%` }} />
          </div>
        </article>
      </section>
    </main>
  );
}
