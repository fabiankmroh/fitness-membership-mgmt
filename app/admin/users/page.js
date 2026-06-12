import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMasterUser } from "@/lib/auth";
import {
  createTrainerAction,
  deleteTrainerAction,
  sendTrainerPasswordResetAction
} from "./actions";
import DeleteUserForm from "./DeleteUserForm";

export const dynamic = "force-dynamic";

function getNotice(searchParams) {
  if (searchParams?.created === "1") {
    return { kind: "successNotice", text: "트레이너 계정이 생성되었습니다." };
  }

  if (searchParams?.deleted === "1") {
    return { kind: "successNotice", text: "트레이너 계정이 삭제되었습니다." };
  }

  if (searchParams?.reset === "1") {
    return { kind: "successNotice", text: "비밀번호 재설정 이메일을 보냈습니다." };
  }

  if (searchParams?.error === "members") {
    return {
      kind: "errorNotice",
      text: "담당 회원이 있는 트레이너는 삭제할 수 없습니다."
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
      </section>

      {notice ? (
        <div className={notice.kind} role="status">
          {notice.text}
        </div>
      ) : null}

      <section className="gridTwo">
        <form action={createTrainerAction} className="panel formPanel">
          <div>
            <p className="sectionLabel">새 트레이너</p>
            <h2>계정 생성</h2>
          </div>

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

        <section className="memberList">
          <div className="listHeader">
            <div>
              <p className="sectionLabel">Users</p>
              <h2>{users.length}명</h2>
            </div>
          </div>

          <div className="cards">
            {users.map((appUser) => (
              <article className="memberCard userCard" key={appUser.id}>
                <div>
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
      </section>
    </main>
  );
}
