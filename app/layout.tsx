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
        {/* בטלפון הטבלאות מוצגות ככרטיסים: כל תא מקבל את שם העמודה שלו */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=0;function lab(){t=0;document.querySelectorAll(".table-wrap table").forEach(function(tb){var hs=[].map.call(tb.querySelectorAll("thead th"),function(h){return h.textContent.trim()});if(!hs.length)return;tb.querySelectorAll("tbody tr").forEach(function(tr){[].forEach.call(tr.children,function(td,i){var l=hs[i]||"";if(td.getAttribute("data-label")!==l)td.setAttribute("data-label",l);var e=td.textContent.trim()==="-";if(e!==td.hasAttribute("data-empty"))td.toggleAttribute("data-empty",e)})})})}function q(){if(!t)t=requestAnimationFrame(lab)}document.addEventListener("DOMContentLoaded",function(){lab();new MutationObserver(q).observe(document.body,{childList:true,subtree:true})})})();` }} />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
