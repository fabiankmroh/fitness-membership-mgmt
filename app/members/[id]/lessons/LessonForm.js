"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createLessonAction } from "../../actions";
import SignaturePad from "./SignaturePad";

const initialState = {
  error: "",
  ok: false,
  redirectTo: ""
};

export default function LessonForm({ memberId }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createLessonAction,
    initialState
  );

  useEffect(() => {
    if (!state.redirectTo) {
      return;
    }

    router.replace(state.redirectTo);

    const fallbackTimer = window.setTimeout(() => {
      window.location.assign(state.redirectTo);
    }, 500);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [router, state.redirectTo]);

  return (
    <form action={formAction} className="panel formPanel lessonForm">
      <input name="memberId" type="hidden" value={memberId} />

      {state.error ? (
        <div className="errorNotice" role="alert">
          {state.error}
        </div>
      ) : null}

      <label>
        운동 내용
        <textarea
          name="exercises"
          placeholder="예: 스쿼트 3세트, 벤치프레스 3세트, 유산소 15분"
          required
          rows="6"
        />
      </label>

      <label>
        메모
        <textarea
          name="notes"
          placeholder="컨디션, 다음 수업에서 확인할 점, 주의사항 등을 적습니다."
          rows="4"
        />
      </label>

      <SignaturePad />

      <div className="formActions">
        <button className="primaryButton" disabled={isPending} type="submit">
          {isPending ? "저장 중..." : "레슨 저장"}
        </button>
      </div>
    </form>
  );
}
