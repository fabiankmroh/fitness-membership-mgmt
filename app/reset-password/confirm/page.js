import Link from "next/link";
import { confirmPasswordResetAction } from "./actions";

export const dynamic = "force-dynamic";

function getErrorMessage(error) {
  const messages = {
    expired:
      "비밀번호 재설정 링크가 만료되었거나 이미 사용되었습니다. 새 링크를 다시 요청해 주세요.",
    invalid: "비밀번호 재설정 링크가 올바르지 않습니다."
  };

  return messages[error] || "";
}

export default async function ConfirmPasswordResetPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const tokenHash = resolvedSearchParams?.token_hash || "";
  const type = resolvedSearchParams?.type || "recovery";
  const next = resolvedSearchParams?.next || "/update-password";
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  return (
    <main className="authShell">
      <section className="authPanel">
        <div>
          <p className="eyebrow">Password</p>
          <h1>비밀번호 재설정 확인</h1>
          <p className="subtitle">
            아래 버튼을 눌러 비밀번호 변경 화면으로 이동해 주세요.
          </p>
        </div>

        {errorMessage ? (
          <div className="errorNotice" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {tokenHash ? (
          <form action={confirmPasswordResetAction} className="loginForm">
            <input name="token_hash" type="hidden" value={tokenHash} />
            <input name="type" type="hidden" value={type} />
            <input name="next" type="hidden" value={next} />

            <button className="primaryButton" type="submit">
              비밀번호 재설정 계속하기
            </button>
          </form>
        ) : (
          <div className="errorNotice" role="alert">
            비밀번호 재설정 토큰이 없습니다. 새 링크를 다시 요청해 주세요.
          </div>
        )}

        <Link className="backLink authBackLink" href="/reset-password">
          재설정 이메일 다시 받기
        </Link>
      </section>
    </main>
  );
}
