"use client";

import { useState } from "react";

export default function DeleteLessonCreditTransactionForm({
  action,
  lessonCount,
  memberId,
  transactionId
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="deleteConfirm">
      <button
        className="dangerButton"
        disabled={isSubmitting}
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        기록 삭제
      </button>

      {isConfirming ? (
        <div className="confirmBox" role="alertdialog" aria-modal="false">
          <div>
            <h3>수업권 +{lessonCount}회 기록을 삭제할까요?</h3>
            <p>삭제하면 총 레슨과 잔여 레슨에서 {lessonCount}회가 차감됩니다.</p>
          </div>

          <div className="confirmActions">
            <button
              className="secondaryButton"
              disabled={isSubmitting}
              onClick={() => setIsConfirming(false)}
              type="button"
            >
              취소
            </button>

            <form action={action}>
              <input name="memberId" type="hidden" value={memberId} />
              <input name="transactionId" type="hidden" value={transactionId} />
              <button
                className="dangerButton"
                disabled={isSubmitting}
                onClick={() => setIsSubmitting(true)}
                type="submit"
              >
                {isSubmitting ? "삭제 중..." : "삭제 확인"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
