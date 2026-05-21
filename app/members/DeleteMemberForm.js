"use client";

import { useState } from "react";

export default function DeleteMemberForm({
  action,
  buttonText = "삭제",
  className = "",
  memberId,
  memberName
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openConfirmation() {
    setIsConfirming(true);
  }

  function closeConfirmation() {
    setIsConfirming(false);
  }

  return (
    <div className={`deleteConfirm ${className}`}>
      <button
        className="dangerButton"
        disabled={isSubmitting}
        onClick={openConfirmation}
        type="button"
      >
        {buttonText}
      </button>

      {isConfirming ? (
        <div className="confirmBox" role="alertdialog" aria-modal="false">
          <div>
            <h3>{memberName} 회원을 삭제할까요?</h3>
            <p>삭제 후에는 되돌릴 수 없습니다.</p>
          </div>

          <div className="confirmActions">
            <button
              className="secondaryButton"
              disabled={isSubmitting}
              onClick={closeConfirmation}
              type="button"
            >
              취소
            </button>

            <form action={action}>
              <input name="id" type="hidden" value={memberId} />
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
