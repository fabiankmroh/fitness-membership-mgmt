import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMasterUser } from "@/lib/auth";
import {
  deleteTrainerAction,
  sendTrainerPasswordResetAction
} from "./actions";
import DeleteUserForm from "./DeleteUserForm";

export const dynamic = "force-dynamic";

function getNotice(searchParams) {
  const errorMessages = {
    create: "트레이너 계정을 만들 수 없습니다. 서버 로그를 확인해 주세요.",
    exists: "이미 등록된 이메일입니다.",
    input: "이름, 이메일, 8자 이상 비밀번호를 입력해 주세요.",
    members: "담당 회원이 있는 트레이너는 삭제할 수 없습니다.",
    password: "비밀번호 조건을 만족하지 않습니다.",
    profile: "Auth 계정은 생성됐지만 앱 사용자 저장에 실패했습니다.",
    reset: "비밀번호 재설정 이메일을 보낼 수 없습니다.",
    "service-key": "Supabase service role key 설정을 확인해 주세요.",
    self: "현재 로그인한 마스터 계정은 삭제할 수 없습니다."
  };

  if (searchParams?.created === "1") {
    return { kind: "successNotice", text: "트레이너 계정이 생성되었습니다." };
  }

  if (searchParams?.deleted === "1") {
    return { kind: "successNotice", text: "트레이너 계정이 삭제되었습니다." };
  }

  if (searchParams?.reset === "1") {
    return { kind: "successNotice", text: "비밀번호 재설정 이메일을 보냈습니다." };
  }

  if (searchParams?.error && errorMessages[searchParams.error]) {
    return {
      kind: "errorNotice",
      text: errorMessages[searchParams.error]
    };
  }

  if (searchParams?.error) {
    return { kind: "errorNotice", text: "요청을 처리할 수 없습니다." };
  }

  return null;
}

export default async function UserManagementPage({ searchParams }) {
  await requireMasterUser();
  const resolvedSearchParams = await searchParams;
  const notice = getNotice(resolvedSearchParams);
  const users = await prisma.appUser.findMany({
    include: {
      _count: {
        select: {
          members: true
        }
      }
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }]
  });

  return (
    <main className="shell">
      <Link className="backLink" href="/members">
        ← 회원 목록
      </Link>

      <section className="pageHeader">
        <div>
          <p className="eyebrow">Master</p>
          <h1>사용자 관리</h1>
          <p className="subtitle">
            마스터 계정은 트레이너 계정을 만들고 삭제할 수 있습니다.
          </p>
        </div>
        <Link className="primaryButton" href="/admin/users/new">
          트레이너 생성
        </Link>
      </section>

      {notice ? (
        <div className={notice.kind} role="status">
          {notice.text}
        </div>
      ) : null}

      <section className="memberList userListSection">
        <div className="listHeader">
          <div>
            <p className="sectionLabel">Users</p>
            <h2>{users.length}명</h2>
          </div>
        </div>

        <div className="cards">
          {users.map((appUser) => (
            <article className="memberCard userCard" key={appUser.id}>
              <div className="userIdentity">
                <strong className="memberName">{appUser.name || appUser.email}</strong>
                <p className="muted">{appUser.email}</p>
              </div>

              <div className="userMeta">
                <span>{appUser.role}</span>
                <span>회원 {appUser._count.members}명</span>
              </div>

              <div className="cardActions">
                <form action={sendTrainerPasswordResetAction}>
                  <input name="userId" type="hidden" value={appUser.id} />
                  <button className="secondaryButton" type="submit">
                    비밀번호 재설정
                  </button>
                </form>

                <DeleteUserForm
                  action={deleteTrainerAction}
                  disabled={
                    appUser.role === "MASTER" || appUser._count.members > 0
                  }
                  memberCount={appUser._count.members}
                  userEmail={appUser.email}
                  userId={appUser.id}
                  userName={appUser.name}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
