"use client";

import { useState } from "react";
import { formatPhoneNumber } from "@/lib/phone";

function formatPhoneInput(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function PhoneInput({ defaultValue = "", ...props }) {
  const [value, setValue] = useState(formatPhoneNumber(defaultValue));

  return (
    <input
      {...props}
      inputMode="numeric"
      maxLength="13"
      name="phone"
      onChange={(event) => setValue(formatPhoneInput(event.target.value))}
      pattern="010-[0-9]{4}-[0-9]{4}"
      placeholder="예: 010-1234-5678"
      required
      title="010-1234-5678 형식으로 입력해 주세요."
      type="tel"
      value={value}
    />
  );
}
