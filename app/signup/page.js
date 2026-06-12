import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createTrainerWithInviteAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SignupPage({ searchParams }) {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;

  if (user) {
    redirect("/members");
  }

  return (
    <main className="authShell">
      <section className="authPanel">
        <div>
          <p className="eyebrow">Trainer Invite</p>
          <h1>계정 생성</h1>
          <p className="subtitle">
            초대 코드를 받은 트레이너만 계정을 만들 수 있습니다.
          </p>
        </div>

        {resolvedSearchParams?.error === "1" ? (
          <div className="errorNotice" role="alert">
            계정을 만들 수 없습니다. 초대 코드와 입력 정보를 확인해 주세요.
          </div>
        ) : null}

        <form action={createTrainerWithInviteAction} className="loginForm">
          <label>
            초대 코드
            <input name="inviteCode" required type="text" />
          </label>

          <label>
            이름
            <input autoComplete="name" name="name" required />
          </label>

          <label>
            이메일
            <input autoComplete="email" name="email" required type="email" />
          </label>

          <label>
            비밀번호
            <input
              autoComplete="new-password"
              minLength="8"
              name="password"
              required
              type="password"
            />
          </label>

          <label>
            비밀번호 확인
            <input
              autoComplete="new-password"
              minLength="8"
              name="passwordConfirm"
              required
              type="password"
            />
          </label>

          <button className="primaryButton" type="submit">
            계정 만들기
          </button>
        </form>
      </section>
    </main>
  );
}
