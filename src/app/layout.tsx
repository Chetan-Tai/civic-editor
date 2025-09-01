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
            <a href="/" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-400 transition">Home</a>
            <a href="/happy" className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-400 transition">Happy</a>
            <a href="/sad" className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-400 transition">Sad</a>
          </nav>
        </header>

        <main style={{ padding: "16px" }}>{children}</main>
      </body>
    </html>
  );
}
