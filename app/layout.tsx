import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DUN · 史前动物博物馆",
  description: "为 2–6 岁孩子与家长共同设计的安静、开放的史前动物博物馆。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "DUN · 史前动物博物馆",
    description: "慢慢看，慢慢问。给孩子和大人一次安静的共同发现。",
    images: [{ url: "/social-card.png", width: 1731, height: 909 }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
