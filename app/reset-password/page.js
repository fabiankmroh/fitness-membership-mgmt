import Link from "next/link";
import { requestPasswordResetAction } from "./actions";

export const dynamic = "force-dynamic";

function getErrorMessage(error) {
  const messages = {
    "rate-limit":
      "Supabase 이메일 전송 한도에 걸렸습니다. 잠시 후 다시 시도하거나 Custom SMTP를 설정해야 합니다.",
    "unauthorized-email":
      "Supabase 기본 이메일 서버가 이 주소로 전송을 거부했습니다. Custom SMTP를 설정하거나 Supabase 팀 멤버 이메일로 테스트해 주세요.",
    send: "비밀번호 재설정 이메일 전송에 실패했습니다. Supabase Auth 이메일 설정과 Vercel 로그를 확인해 주세요."
  };

  return messages[error] || "";
}

export default async function ResetPasswordPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

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

        {errorMessage ? (
          <div className="errorNotice" role="alert">
            {errorMessage}
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
