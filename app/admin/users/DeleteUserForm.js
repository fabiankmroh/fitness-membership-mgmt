"use client";

import { useRouter } from "next/navigation";
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

export default function DeleteUserForm({
  action,
  disabled = false,
  memberCount,
  userEmail,
  userId,
  userName
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  async function deleteUser(formData) {
    await action(formData);
    router.refresh();
  }

  return (
    <div className="deleteConfirm">
      <button
        className="dangerButton"
        disabled={disabled}
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        삭제
      </button>

      {isConfirming ? (
        <div className="confirmBox" role="alertdialog" aria-modal="false">
          <div>
            <h3>{userName || userEmail} 계정을 삭제할까요?</h3>
            <p>
              삭제하면 이 사용자는 로그인할 수 없습니다. 담당 회원이 1명 이상이면
              삭제가 차단됩니다. 현재 담당 회원은 {memberCount}명입니다.
            </p>
          </div>

          <div className="confirmActions">
            <button
              className="secondaryButton"
              onClick={() => setIsConfirming(false)}
              type="button"
            >
              취소
            </button>

            <form action={deleteUser}>
              <input name="userId" type="hidden" value={userId} />
              <DeleteSubmitButton />
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
