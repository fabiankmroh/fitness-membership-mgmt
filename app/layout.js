import "./globals.css";

export const metadata = {
  title: "Fitness Membership Management",
  description: "Manage members and remaining lesson counts."
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
