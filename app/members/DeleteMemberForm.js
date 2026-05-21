"use client";

import { useState } from "react";

export default function DeleteMemberForm({
  action,
  buttonText = "삭제",
  className = "",
  memberId,
  memberName
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event) {
    const shouldDelete = window.confirm(
      `${memberName} 회원을 삭제할까요?\n삭제 후에는 되돌릴 수 없습니다.`
    );

    if (!shouldDelete) {
      event.preventDefault();
      return;
    }

    setIsSubmitting(true);
  }

  return (
    <form action={action} className={className} onSubmit={handleSubmit}>
      <input name="id" type="hidden" value={memberId} />
      <button className="dangerButton" disabled={isSubmitting} type="submit">
        {isSubmitting ? "삭제 중..." : buttonText}
      </button>
    </form>
  );
}
