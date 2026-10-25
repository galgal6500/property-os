import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "נ.ג.ש מור הנדסה",
  description: "מערכת ניהול משולבת לנ.ג.ש מור הנדסה",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "נ.ג.ש מור",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="נ.ג.ש מור" />
        <meta name="theme-color" content="#ffffff" />
        {/* מצב בהיר/כהה: תמיד לפי ההגדרה של הטלפון/המחשב, ומתחלף מיד כשהיא משתנה */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var q=window.matchMedia("(prefers-color-scheme: dark)");function a(){var t=q.matches?"dark":"light";document.documentElement.setAttribute("data-theme",t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="dark"?"#0F1626":"#ffffff")}a();if(q.addEventListener)q.addEventListener("change",a);else if(q.addListener)q.addListener(a)}catch(e){}})();` }} />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
