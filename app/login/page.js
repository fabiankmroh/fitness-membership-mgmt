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
      </section>
    </main>
  );
}
