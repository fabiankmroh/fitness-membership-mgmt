import { logoutAction } from "@/app/login/actions";

export default function LogoutForm({ email }) {
  return (
    <form action={logoutAction}>
      <button className="secondaryButton" type="submit">
        {email ? `${email} 로그아웃` : "로그아웃"}
      </button>
    </form>
  );
}
