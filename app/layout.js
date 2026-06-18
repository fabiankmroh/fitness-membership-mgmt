import "./globals.css";

export const metadata = {
  title: "GYMLORD",
  description: "GYMLORD fitness membership management."
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
