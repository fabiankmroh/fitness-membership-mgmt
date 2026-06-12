import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMasterUser } from "@/lib/auth";
import { formatPhoneNumber } from "@/lib/phone";
import {
  deleteTrainerAction,
  sendTrainerPasswordResetAction,
  transferMemberOwnerAction
} from "./actions";
import DeleteUserForm from "./DeleteUserForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    self: "현재 로그인한 마스터 계정은 삭제할 수 없습니다.",
    target: "이전할 대상 트레이너를 찾을 수 없습니다.",
    transfer: "회원 담당자를 변경할 수 없습니다."
  };

  if (searchParams?.created === "1") {
    return {
      kind: "successNotice",
      text: "트레이너 계정이 생성되었습니다. 목록에 새 사용자가 추가되었습니다."
    };
  }

  if (searchParams?.deleted === "1") {
    return { kind: "successNotice", text: "트레이너 계정이 삭제되었습니다." };
  }

  if (searchParams?.reset === "1") {
    return { kind: "successNotice", text: "비밀번호 재설정 이메일을 보냈습니다." };
  }

  if (searchParams?.transferred === "1") {
    return {
      kind: "successNotice",
      text: "회원 담당 트레이너를 변경했습니다. 새 담당 트레이너의 회원 목록을 열었습니다."
    };
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

function UserMembersPanel({ selectedUser, transferTargets }) {
  if (!selectedUser) {
    return null;
  }

  return (
    <section className="panel selectedUserPanel">
      <div className="selectedUserHeader">
        <div>
          <p className="sectionLabel">Members</p>
          <h2>{selectedUser.name || selectedUser.email}</h2>
          <p className="muted">담당 회원 {selectedUser.members.length}명</p>
        </div>
        <a className="secondaryButton" href="/admin/users">
          닫기
        </a>
      </div>

      {selectedUser.members.length === 0 ? (
        <div className="lessonEmpty">
          <h3>담당 회원이 없습니다.</h3>
          <p>이 계정은 삭제할 수 있습니다.</p>
        </div>
      ) : (
        <div className="transferMemberRows">
          {selectedUser.members.map((member) => (
            <article className="transferMemberRow" key={member.id}>
              <div>
                <strong>{member.name}</strong>
                <span>{formatPhoneNumber(member.phone) || "연락처 없음"}</span>
              </div>

              <span>
                {member.remainingLessons}회 남음 / {member.totalLessons}회
              </span>

              <form action={transferMemberOwnerAction}>
                <input name="memberId" type="hidden" value={member.id} />
                <input
                  name="fromUserId"
                  type="hidden"
                  value={selectedUser.id}
                />
                <select
                  disabled={transferTargets.length === 0}
                  name="toUserId"
                  required
                >
                  <option value="">트레이너 선택</option>
                  {transferTargets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.name || target.email}
                    </option>
                  ))}
                </select>
                <button
                  className="primaryButton"
                  disabled={transferTargets.length === 0}
                  type="submit"
                >
                  이전
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function UserManagementPage({ searchParams }) {
  await requireMasterUser();
  const resolvedSearchParams = await searchParams;
  const notice = getNotice(resolvedSearchParams);
  const selectedUserId = resolvedSearchParams?.selectedUserId || "";
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
  const selectedUser = selectedUserId
    ? await prisma.appUser.findUnique({
        where: {
          id: selectedUserId
        },
        include: {
          members: {
            orderBy: {
              updatedAt: "desc"
            },
            select: {
              id: true,
              name: true,
              phone: true,
              remainingLessons: true,
              totalLessons: true
            }
          }
        }
      })
    : null;
  const transferTargets = users.filter((appUser) => {
    return (
      appUser.id !== selectedUserId &&
      appUser.role === "TRAINER" &&
      appUser.isActive
    );
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
            <div className="userCardGroup" key={appUser.id}>
              <article className="memberCard userCard">
                <div className="userIdentity">
                  <strong className="memberName">{appUser.name || appUser.email}</strong>
                  <p className="muted">{appUser.email}</p>
                </div>

                <div className="userMeta">
                  <span>{appUser.role}</span>
                  <span>회원 {appUser._count.members}명</span>
                </div>

                <div className="cardActions">
                  <a
                    className="secondaryButton"
                    href={`/admin/users?selectedUserId=${appUser.id}`}
                  >
                    회원 보기
                  </a>

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

              {appUser.id === selectedUserId && selectedUser ? (
                <UserMembersPanel
                  selectedUser={selectedUser}
                  transferTargets={transferTargets}
                />
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
