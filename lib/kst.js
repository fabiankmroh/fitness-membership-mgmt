export const KST_TIME_ZONE = "Asia/Seoul";

const KST_OFFSET = "+09:00";

function getDateTimeParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: KST_TIME_ZONE,
    year: "numeric"
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function formatKstDate(date, dateStyle = "medium") {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle,
    timeZone: KST_TIME_ZONE
  }).format(date);
}

export function formatKstDateTime(date, dateStyle = "medium") {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle,
    timeStyle: "short",
    timeZone: KST_TIME_ZONE
  }).format(date);
}

export function formatKstTime(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: KST_TIME_ZONE
  }).format(date);
}

export function formatKstDateTimeInput(date) {
  const parts = getDateTimeParts(date);

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatKstDateInput(date) {
  const parts = getDateTimeParts(date);

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatKstTimeInput(date) {
  const parts = getDateTimeParts(date);

  return `${parts.hour}:${parts.minute}`;
}

export function getKstYearMonth(date = new Date()) {
  const parts = getDateTimeParts(date);

  return {
    month: Number(parts.month),
    year: Number(parts.year)
  };
}

export function getKstDayOfMonth(date) {
  return Number(getDateTimeParts(date).day);
}

export function getKstMonthRange(year, month) {
  const start = new Date(
    `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000${KST_OFFSET}`
  );
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const end = new Date(
    `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00.000${KST_OFFSET}`
  );

  return { end, start };
}

export function getKstMonthDays(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getKstWeekdayIndex(year, month, day = 1) {
  const date = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00.000${KST_OFFSET}`
  );

  return date.getUTCDay();
}

export function parseKstDateTimeInput(value) {
  const normalized = String(value || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    throw new Error("Invalid KST datetime.");
  }

  const date = new Date(`${normalized}:00.000${KST_OFFSET}`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid KST datetime.");
  }

  return date;
}

export function parseKstDateTimeParts(dateValue, timeValue) {
  const date = String(dateValue || "").trim();
  const time = String(timeValue || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Invalid KST datetime.");
  }

  return parseKstDateTimeInput(`${date}T${time}`);
}
