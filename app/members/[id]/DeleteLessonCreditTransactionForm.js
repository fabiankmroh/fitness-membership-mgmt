"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

const initialState = {
  error: "",
  ok: false,
  redirectTo: ""
};

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="dangerButton" disabled={pending} type="submit">
      {pending ? "삭제 중..." : "삭제 확인"}
    </button>
  );
}

export default function DeleteLessonCreditTransactionForm({
  action,
  lessonCount,
  memberId,
  transactionId
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.redirectTo) {
      return;
    }

    router.refresh();
    window.location.assign(state.redirectTo);
  }, [router, state.redirectTo]);

  return (
    <div className="deleteConfirm">
      <button
        className="dangerButton"
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
            {state.error ? (
              <p className="inlineError" role="alert">
                {state.error}
              </p>
            ) : null}
          </div>

          <div className="confirmActions">
            <button
              className="secondaryButton"
              onClick={() => setIsConfirming(false)}
              type="button"
            >
              취소
            </button>

            <form action={formAction}>
              <input name="memberId" type="hidden" value={memberId} />
              <input name="transactionId" type="hidden" value={transactionId} />
              <DeleteSubmitButton />
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
