import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civic Editor",
  description: "Happy/sad plate editor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
          <nav style={{ display: "flex", gap: "12px" }}>
            <Link href="/" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-400 transition">
              Home
            </Link>
            <Link href="/happy" className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-400 transition">
              Happy
            </Link>
            <Link href="/sad" className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-400 transition">
              Sad
            </Link>
          </nav>
        </header>

        <main style={{ padding: "16px" }}>{children}</main>
      </body>
    </html>
  );
}