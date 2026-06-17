import Link from "next/link";
import { confirmPasswordResetAction } from "./actions";

export const dynamic = "force-dynamic";

function getErrorMessage(error) {
  const messages = {
    expired:
      "비밀번호 재설정 링크가 만료되었거나 이미 사용되었습니다. 새 링크를 다시 요청해 주세요.",
    invalid: "비밀번호 재설정 링크가 올바르지 않습니다.",
    update: "비밀번호를 변경할 수 없습니다. 새 재설정 링크를 다시 요청해 주세요.",
    weak: "비밀번호는 8자 이상이어야 합니다."
  };

  return messages[error] || "";
}

export default async function ConfirmPasswordResetPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const tokenHash = resolvedSearchParams?.token_hash || "";
  const type = resolvedSearchParams?.type || "recovery";
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  return (
    <main className="authShell">
      <section className="authPanel">
        <div>
          <p className="eyebrow">Password</p>
          <h1>새 비밀번호</h1>
          <p className="subtitle">
            앞으로 사용할 새 비밀번호를 입력해 주세요.
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

            <label>
              새 비밀번호
              <input
                autoComplete="new-password"
                minLength="8"
                name="password"
                required
                type="password"
              />
            </label>

            <button className="primaryButton" type="submit">
              비밀번호 변경
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
