"use client";

import { useEffect, useMemo, useState } from "react";

export default function ReservationTimeFields({
  defaultDate = "",
  defaultEndTime = "",
  defaultStartTime = "",
  minDate,
  timeOptions
}) {
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const endOptions = useMemo(
    () =>
      startTime
        ? timeOptions.filter((option) => option.value > startTime)
        : [],
    [startTime, timeOptions]
  );

  useEffect(() => {
    if (!startTime) {
      setEndTime("");
      return;
    }

    if (!endOptions.some((option) => option.value === endTime)) {
      setEndTime(endOptions[0]?.value || "");
    }
  }, [endOptions, endTime, startTime]);

  return (
    <>
      <label>
        예약 날짜
        <div className="reservationDateTimeInputs">
          <input
            defaultValue={defaultDate}
            min={minDate}
            name="reservationDate"
            required
            type="date"
          />
        </div>
      </label>

      <label>
        시작 시간
        <select
          name="reservationStartTime"
          onChange={(event) => setStartTime(event.target.value)}
          required
          value={startTime}
        >
          <option disabled value="">
            시작 선택
          </option>
          {timeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        마무리 시간
        <select
          name="reservationEndTime"
          onChange={(event) => setEndTime(event.target.value)}
          required
          value={endTime}
        >
          <option disabled value="">
            {startTime ? "마무리 선택" : "시작 시간 먼저 선택"}
          </option>
          {endOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
