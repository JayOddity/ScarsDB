import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalSearch from "@/components/GlobalSearch";

export const metadata: Metadata = {
  title: "ScarsDB — Scars of Honor Database & Tools",
  description: "Talent calculator, item database, class guides, and community tools for Scars of Honor MMORPG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <GlobalSearch />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
