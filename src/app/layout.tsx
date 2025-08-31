import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civic Editor",
  description: "Happy/sad plate editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
          <nav style={{ display: "flex", gap: "12px" }}>
            <a href="/happy">happy</a>
            <a href="/sad">sad</a>
          </nav>
        </header>

        <main style={{ padding: "16px" }}>{children}</main>
      </body>
    </html>
  );
}
