import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GM ניהול נכסים",
  description: "מערכת יוקרתית לניהול נכסים",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GM נכסים",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GM נכסים" />
        <meta name="theme-color" content="#c9a227" />
        <link rel="apple-touch-icon" href="/icons/ic
