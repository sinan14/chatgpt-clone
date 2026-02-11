import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title: "ChatGPT Clone",
  description: "A simple ChatGPT clone built with Next.js and TailwindCSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="m-0 p-0" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
