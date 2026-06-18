import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  formatKstDate,
  formatKstDateInput,
  formatKstTime,
  getKstDayOfMonth,
  getKstWeekRange,
  getKstYearMonth
} from "@/lib/kst";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDate(searchParams) {
  const requestedDate = String(searchParams?.date || "");

  if (/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    return requestedDate;
  }

  return formatKstDateInput(new Date());
}

export default async function CalendarWeekPage({ searchParams }) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const date = getDate(resolvedSearchParams);
  const { start, end } = getKstWeekRange(date);
  const monthLink = getKstYearMonth(start);
  const previousWeek = formatKstDateInput(new Date(start.getTime() - 7 * DAY_MS));
  const nextWeek = formatKstDateInput(new Date(start.getTime() + 7 * DAY_MS));
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const dayStart = new Date(start.getTime() + index * DAY_MS);

    return {
      date: formatKstDateInput(dayStart),
      dateLabel: formatKstDate(dayStart),
      day: getKstDayOfMonth(dayStart),
      weekday: WEEKDAYS[index]
    };
  });
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
  const reservationsByDate = new Map();

  reservations.forEach((reservation) => {
    const reservationDate = formatKstDateInput(reservation.startsAt);
    const dayReservations = reservationsByDate.get(reservationDate) || [];

    dayReservations.push(reservation);
    reservationsByDate.set(reservationDate, dayReservations);
  });

  return (
    <main className="shell">
      <Link
        className="backLink"
        href={`/calendar?year=${monthLink.year}&month=${monthLink.month}`}
      >
        ← 월간 캘린더
      </Link>

      <section className="pageHeader">
        <div>
          <p className="eyebrow">Calendar Week</p>
          <h1>주간 예약</h1>
          <p className="subtitle">
            {formatKstDate(start)}부터 {formatKstDate(new Date(end.getTime() - DAY_MS))}까지의 전체 예약입니다.
          </p>
        </div>
        <div className="headerActions">
          <Link className="secondaryButton" href={`/calendar/week?date=${previousWeek}`}>
            이전 주
          </Link>
          <Link className="secondaryButton" href={`/calendar/week?date=${nextWeek}`}>
            다음 주
          </Link>
        </div>
      </section>

      <section className="weekGrid">
        {weekDays.map((day) => {
          const dayReservations = reservationsByDate.get(day.date) || [];

          return (
            <article className="panel weekDay" key={day.date}>
              <div className="weekDayHeader">
                <div>
                  <p className="sectionLabel">{day.weekday}</p>
                  <h2>{day.day}일</h2>
                </div>
                <Link className="secondaryButton" href={`/calendar/day?date=${day.date}`}>
                  일간
                </Link>
              </div>

              {dayReservations.length === 0 ? (
                <div className="lessonEmpty">
                  <h3>예약 없음</h3>
                </div>
              ) : (
                <div className="dashboardRows">
                  {dayReservations.map((reservation) => (
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
            </article>
          );
        })}
      </section>
    </main>
  );
}
