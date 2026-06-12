import Link from "next/link";
import { requireMasterUser } from "@/lib/auth";
import { createTrainerAction } from "../actions";

export const dynamic = "force-dynamic";

function getErrorMessage(error) {
  const errorMessages = {
    create: "트레이너 계정을 만들 수 없습니다. 서버 로그를 확인해 주세요.",
    exists: "이미 등록된 이메일입니다.",
    input: "이름, 이메일, 8자 이상 비밀번호를 입력해 주세요.",
    password: "비밀번호 조건을 만족하지 않습니다.",
    profile: "Auth 계정은 생성됐지만 앱 사용자 저장에 실패했습니다.",
    "service-key": "Supabase service role key 설정을 확인해 주세요."
  };

  return errorMessages[error] || "";
}

export default async function NewUserPage({ searchParams }) {
  await requireMasterUser();
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  return (
    <main className="shell narrowShell">
      <Link className="backLink" href="/admin/users">
        ← 사용자 관리
      </Link>

      <section className="pageHeader">
        <div>
          <p className="eyebrow">Master</p>
          <h1>트레이너 생성</h1>
          <p className="subtitle">
            새 트레이너 계정을 만들고 임시 비밀번호를 전달합니다.
          </p>
        </div>
      </section>

      {errorMessage ? (
        <div className="errorNotice" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <form action={createTrainerAction} className="panel formPanel">
        <label>
          이름
          <input autoComplete="name" name="name" required />
        </label>

        <label>
          이메일
          <input autoComplete="email" name="email" required type="email" />
        </label>

        <label>
          임시 비밀번호
          <input
            autoComplete="new-password"
            minLength="8"
            name="password"
            required
            type="password"
          />
        </label>

        <button className="primaryButton" type="submit">
          트레이너 생성
        </button>
      </form>
    </main>
  );
}
