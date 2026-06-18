import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  formatKstTime,
  formatKstDateInput,
  getKstDayOfMonth,
  getKstMonthDays,
  getKstMonthRange,
  getKstWeekdayIndex,
  getKstYearMonth
} from "@/lib/kst";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getCalendarMonth(searchParams) {
  const current = getKstYearMonth();
  const year = Number(searchParams?.year || current.year);
  const month = Number(searchParams?.month || current.month);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return current;
  }

  return { month, year };
}

function getAdjacentMonth(year, month, offset) {
  const nextMonth = month + offset;

  if (nextMonth < 1) {
    return { month: 12, year: year - 1 };
  }

  if (nextMonth > 12) {
    return { month: 1, year: year + 1 };
  }

  return { month: nextMonth, year };
}

function getDateParam(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default async function CalendarPage({ searchParams }) {
  const user = await requireUser();
  const now = new Date();
  const resolvedSearchParams = await searchParams;
  const { month, year } = getCalendarMonth(resolvedSearchParams);
  const { start, end } = getKstMonthRange(year, month);
  const daysInMonth = getKstMonthDays(year, month);
  const firstWeekday = getKstWeekdayIndex(year, month);
  const previousMonth = getAdjacentMonth(year, month, -1);
  const nextMonth = getAdjacentMonth(year, month, 1);
  const todayParam = formatKstDateInput(now);
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
  const reservationsByDay = new Map();

  reservations.forEach((reservation) => {
    const day = getKstDayOfMonth(reservation.startsAt);
    const dayReservations = reservationsByDay.get(day) || [];

    dayReservations.push(reservation);
    reservationsByDay.set(day, dayReservations);
  });

  return (
    <main className="shell">
      <Link className="backLink" href="/members">
        ← 홈
      </Link>

      <section className="pageHeader">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1>레슨 캘린더</h1>
          <p className="subtitle">
            모든 예약 시간은 한국 시간 기준으로 표시됩니다.
          </p>
        </div>
        <div className="headerActions">
          <Link
            className="secondaryButton"
            href={`/calendar?year=${previousMonth.year}&month=${previousMonth.month}`}
          >
            이전 달
          </Link>
          <Link
            className="secondaryButton"
            href={`/calendar?year=${nextMonth.year}&month=${nextMonth.month}`}
          >
            다음 달
          </Link>
          <Link className="secondaryButton" href={`/calendar/day?date=${todayParam}`}>
            오늘 일간 보기
          </Link>
          <Link
            className="secondaryButton"
            href={`/calendar/week?date=${todayParam}`}
          >
            이번 주 보기
          </Link>
        </div>
      </section>

      <section className="panel calendarPanel">
        <div className="calendarHeader">
          <h2>
            {year}년 {month}월
          </h2>
          <span>{reservations.length}개 예약</span>
        </div>

        <div className="calendarWeekdays">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>

        <div className="calendarGrid">
          {Array.from({ length: firstWeekday }).map((_, index) => (
            <div
              aria-hidden="true"
              className="calendarDay calendarDayEmpty"
              key={`empty-${index}`}
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayReservations = reservationsByDay.get(day) || [];
            const dateParam = getDateParam(year, month, day);
            const visibleReservations =
              dateParam === todayParam
                ? dayReservations
                    .filter((reservation) => reservation.startsAt >= now)
                    .slice(0, 2)
                : dayReservations.slice(0, 2);
            const hiddenReservationCount =
              dayReservations.length - visibleReservations.length;

            return (
              <article className="calendarDay" key={day}>
                <strong>{day}</strong>
                {dayReservations.length === 0 ? (
                  <span className="calendarNoReservation">예약 없음</span>
                ) : (
                  <div className="calendarReservations">
                    {visibleReservations.map((reservation) => (
                      <Link
                        className="calendarReservation"
                        href={`/members/${reservation.member.id}`}
                        key={reservation.id}
                      >
                        <time dateTime={reservation.startsAt.toISOString()}>
                          {formatKstTime(reservation.startsAt)}
                        </time>
                        <span>{reservation.member.name}</span>
                      </Link>
                    ))}
                    {hiddenReservationCount > 0 ? (
                      <span className="calendarMoreCount">
                        +{hiddenReservationCount}개 더 있음
                      </span>
                    ) : null}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
