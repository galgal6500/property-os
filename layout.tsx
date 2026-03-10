import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Property OS - מערכת ניהול נכסים",
  description: "מערכת יוקרתית לניהול נכסים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
