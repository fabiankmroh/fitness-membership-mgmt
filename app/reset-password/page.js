import Link from "next/link";
import { requestPasswordResetAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="authShell">
      <section className="authPanel">
        <div>
          <p className="eyebrow">Password</p>
          <h1>비밀번호 재설정</h1>
          <p className="subtitle">
            등록된 이메일로 비밀번호 변경 링크를 보냅니다.
          </p>
        </div>

        {resolvedSearchParams?.sent === "1" ? (
          <div className="successNotice" role="status">
            계정이 존재하면 비밀번호 재설정 이메일이 발송됩니다.
          </div>
        ) : null}

        <form action={requestPasswordResetAction} className="loginForm">
          <label>
            이메일
            <input autoComplete="email" name="email" required type="email" />
          </label>

          <button className="primaryButton" type="submit">
            재설정 이메일 보내기
          </button>
        </form>

        <Link className="backLink authBackLink" href="/login">
          로그인으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
