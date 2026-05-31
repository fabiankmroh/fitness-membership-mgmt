"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="dangerButton" disabled={pending} type="submit">
      {pending ? "삭제 중..." : "삭제 확인"}
    </button>
  );
}

export default function DeleteLessonForm({
  action,
  lessonId,
  lessonNumber,
  memberId
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <div className="deleteConfirm">
      <button
        className="dangerButton"
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        레슨 삭제
      </button>

      {isConfirming ? (
        <div className="confirmBox" role="alertdialog" aria-modal="false">
          <div>
            <h3>Lesson #{lessonNumber} 기록을 삭제할까요?</h3>
            <p>삭제하면 이 레슨 기록은 사라지고 잔여 레슨이 1회 복구됩니다.</p>
          </div>

          <div className="confirmActions">
            <button
              className="secondaryButton"
              onClick={() => setIsConfirming(false)}
              type="button"
            >
              취소
            </button>

            <form action={action}>
              <input name="memberId" type="hidden" value={memberId} />
              <input name="lessonId" type="hidden" value={lessonId} />
              <DeleteSubmitButton />
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
