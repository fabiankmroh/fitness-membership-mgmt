import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;
  const next = resolvedSearchParams?.next || "/members";

  if (user) {
    redirect("/members");
  }

  return (
    <main className="authShell">
      <section className="authPanel">
        <div>
          <p className="eyebrow">Secure Access</p>
          <h1>로그인</h1>
          <p className="subtitle">
            로그인 후 담당 회원 정보와 레슨 기록을 확인할 수 있습니다.
          </p>
        </div>

        {resolvedSearchParams?.error === "1" ? (
          <div className="errorNotice" role="alert">
            이메일 또는 비밀번호가 올바르지 않습니다.
          </div>
        ) : null}

        {resolvedSearchParams?.created === "1" ? (
          <div className="successNotice" role="status">
            계정이 생성되었습니다. 로그인해 주세요.
          </div>
        ) : null}

        {resolvedSearchParams?.passwordUpdated === "1" ? (
          <div className="successNotice" role="status">
            비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.
          </div>
        ) : null}

        {resolvedSearchParams?.error === "inactive" ? (
          <div className="errorNotice" role="alert">
            비활성화된 계정입니다. 관리자에게 문의해 주세요.
          </div>
        ) : null}

        <form action={loginAction} className="loginForm">
          <input name="next" type="hidden" value={next} />

          <label>
            이메일
            <input
              autoComplete="email"
              defaultValue="fabiankmroh@gmail.com"
              name="email"
              required
              type="email"
            />
          </label>

          <label>
            비밀번호
            <input
              autoComplete="current-password"
              name="password"
              required
              type="password"
            />
          </label>

          <button className="primaryButton" type="submit">
            로그인
          </button>
        </form>

        <div className="authLinks">
          <a href="/reset-password">비밀번호 재설정</a>
          <a href="/signup">초대 코드로 계정 생성</a>
        </div>
      </section>
    </main>
  );
}
