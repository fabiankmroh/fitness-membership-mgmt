import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  formatKstDate,
  formatKstDateInput,
  formatKstTime,
  formatKstTimeInput,
  getKstDayOfMonth,
  getKstWeekRange,
  getKstYearMonth
} from "@/lib/kst";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const SLOT_COUNT = 48;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDate(searchParams) {
  const requestedDate = String(searchParams?.date || "");

  if (/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    return requestedDate;
  }

  return formatKstDateInput(new Date());
}

function getSlotIndex(date) {
  const [hour, minute] = formatKstTimeInput(date).split(":").map(Number);

  return hour * 2 + (minute >= 30 ? 1 : 0);
}

function getHourLabel(hour) {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 || 12;

  return `${period} ${displayHour}:00`;
}

export default async function CalendarWeekPage({ searchParams }) {
  const user = await requireUser();
  const todayParam = formatKstDateInput(new Date());
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
  const dayIndexByDate = new Map(weekDays.map((day, index) => [day.date, index]));
  const reservationGroups = new Map();

  reservations.forEach((reservation) => {
    const reservationDate = formatKstDateInput(reservation.startsAt);
    const dayIndex = dayIndexByDate.get(reservationDate);

    if (dayIndex === undefined) {
      return;
    }

    const slotIndex = getSlotIndex(reservation.startsAt);
    const groupKey = `${reservationDate}-${slotIndex}`;
    const group = reservationGroups.get(groupKey) || {
      dayIndex,
      reservations: [],
      slotIndex
    };

    group.reservations.push(reservation);
    reservationGroups.set(groupKey, group);
  });
  const hourSlots = Array.from({ length: 24 }).map((_, index) => index);
  const groupedReservations = Array.from(reservationGroups.values()).sort(
    (first, second) =>
      first.dayIndex - second.dayIndex || first.slotIndex - second.slotIndex
  );

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
          <Link
            className="secondaryButton"
            href={`/calendar?year=${monthLink.year}&month=${monthLink.month}`}
          >
            월간 보기
          </Link>
          <Link className="secondaryButton" href={`/calendar/day?date=${todayParam}`}>
            오늘 일간 보기
          </Link>
          <Link className="secondaryButton" href={`/calendar/week?date=${previousWeek}`}>
            이전 주
          </Link>
          <Link className="secondaryButton" href={`/calendar/week?date=${nextWeek}`}>
            다음 주
          </Link>
        </div>
      </section>

      <section className="panel weekCalendarPanel">
        <div className="weekCalendarGrid">
          <div className="weekCorner" />
          {weekDays.map((day, index) => (
            <Link
              className="weekColumnHeader"
              href={`/calendar/day?date=${day.date}`}
              key={day.date}
              style={{ gridColumn: index + 2 }}
            >
              <span>{day.weekday}</span>
              <strong>{day.day}일</strong>
            </Link>
          ))}

          {hourSlots.map((hour) => (
            <div
              className="weekTimeLabel"
              key={hour}
              style={{ gridRow: `${hour * 2 + 2} / span 2` }}
            >
              {getHourLabel(hour)}
            </div>
          ))}

          {weekDays.map((day, index) => (
            <div
              aria-hidden="true"
              className="weekColumn"
              key={`column-${day.date}`}
              style={{
                gridColumn: index + 2,
                gridRow: `2 / span ${SLOT_COUNT}`
              }}
            />
          ))}

          {groupedReservations.map((group) => (
            <div
              className="weekEvent"
              key={`${group.dayIndex}-${group.slotIndex}`}
              style={{
                gridColumn: group.dayIndex + 2,
                gridRow: `${group.slotIndex + 2} / span 2`
              }}
            >
              {group.reservations.map((reservation) => (
                <Link
                  className="weekEventItem"
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
          ))}
        </div>

        {reservations.length === 0 ? (
          <div className="lessonEmpty weekEmpty">
            <h3>예약 없음</h3>
            <p>이 주에는 등록된 예약이 없습니다.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
