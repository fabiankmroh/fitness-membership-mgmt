import { updatePasswordAction } from "./actions";

export const dynamic = "force-dynamic";

function getErrorMessage(error) {
  if (error === "weak") {
    return "비밀번호는 8자 이상이어야 합니다.";
  }

  if (error) {
    return "비밀번호를 변경할 수 없습니다. 재설정 링크를 다시 요청해 주세요.";
  }

  return "";
}

export default async function UpdatePasswordPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  return (
    <main className="authShell">
      <section className="authPanel">
        <div>
          <p className="eyebrow">Password</p>
          <h1>새 비밀번호</h1>
          <p className="subtitle">앞으로 사용할 새 비밀번호를 입력해 주세요.</p>
        </div>

        {errorMessage ? (
          <div className="errorNotice" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <form action={updatePasswordAction} className="loginForm">
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
      </section>
    </main>
  );
}
