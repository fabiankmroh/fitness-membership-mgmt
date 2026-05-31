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

export default function DeleteMemberForm({
  action,
  buttonText = "삭제",
  className = "",
  memberId,
  memberName
}) {
  const [isConfirming, setIsConfirming] = useState(false);

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
              onClick={closeConfirmation}
              type="button"
            >
              취소
            </button>

            <form action={action}>
              <input name="id" type="hidden" value={memberId} />
              <DeleteSubmitButton />
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
