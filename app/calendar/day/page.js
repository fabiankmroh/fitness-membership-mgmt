import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  formatKstDate,
  formatKstTime,
  getKstDateRange,
  getKstYearMonth,
  formatKstDateInput
} from "@/lib/kst";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getDate(searchParams) {
  const requestedDate = String(searchParams?.date || "");

  if (/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    return requestedDate;
  }

  return formatKstDateInput(new Date());
}

export default async function CalendarDayPage({ searchParams }) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const date = getDate(resolvedSearchParams);
  const { start, end } = getKstDateRange(date);
  const monthLink = getKstYearMonth(start);
  const reservations = await prisma.lessonReservation.findMany({
    where: {
      startsAt: {
        gte: start,
        lt: end
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

  return (
    <main className="shell narrowShell">
      <Link
        className="backLink"
        href={`/calendar?year=${monthLink.year}&month=${monthLink.month}`}
      >
        ← 월간 캘린더
      </Link>

      <section className="pageHeader">
        <div>
          <p className="eyebrow">Calendar Day</p>
          <h1>{formatKstDate(start, "full")}</h1>
          <p className="subtitle">이 날짜의 모든 예약을 한국 시간 기준으로 봅니다.</p>
        </div>
        <div className="headerActions">
          <Link className="secondaryButton" href={`/calendar/week?date=${date}`}>
            주간 보기
          </Link>
        </div>
      </section>

      <section className="panel dashboardPanel">
        {reservations.length === 0 ? (
          <div className="lessonEmpty">
            <h3>예약이 없습니다.</h3>
            <p>회원 상세 페이지에서 향후 레슨 예약을 추가할 수 있습니다.</p>
          </div>
        ) : (
          <div className="dashboardRows">
            {reservations.map((reservation) => (
              <Link
                className="dashboardRow"
                href={`/members/${reservation.member.id}`}
                key={reservation.id}
              >
                <strong>{reservation.member.name}</strong>
                <span>
                  {formatKstTime(reservation.startsAt)}
                  {reservation.memo ? ` · ${reservation.memo}` : ""}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
