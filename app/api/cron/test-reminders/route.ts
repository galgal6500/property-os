import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// תזכורת יומית במייל על טסטים לרכבים של נג"ש.
// Vercel מריץ את הכתובת הזו פעם ביום לפי הקובץ vercel.json.
// שולח מייל רק כשנשארו בדיוק 30 / 14 / 7 / 3 / 1 ימים, ביום עצמו, או כשהטסט כבר עבר (פעם בשבוע).
//
// משתנים שצריך להגדיר ב-Vercel:
//   SUPABASE_SERVICE_ROLE_KEY – מפתח שמאפשר לשרת לקרוא את טבלת הרכבים
//   CRON_SECRET               – סיסמה כלשהי שתבחר, כדי שרק Vercel יוכל להפעיל את התזכורת
//   RESEND_API_KEY            – כבר קיים אצלך (משמש לשליחת מיילים)
//   NOTIFY_EMAIL (לא חובה)    – לאיזה מייל לשלוח. ברירת מחדל: המייל של ההתראות הקיימות

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "galgal6500@gmail.com";
const SITE_URL = "https://property-os-ten.vercel.app";
const REMIND_ON = [30, 14, 7, 3, 1, 0];

function esc(v: unknown) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00Z");
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((d.getTime() - today) / 86400000);
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!serviceKey || !resendKey) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY or RESEND_API_KEY" }, { status: 500 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false } });
  const { data: vehicles, error } = await supabase
    .from("ngs_vehicles")
    .select("license_plate, model, driver, next_test_date, status")
    .not("next_test_date", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const isMonday = new Date().getUTCDay() === 1;
  const due = (vehicles || [])
    .filter(v => v.status !== "מושבת")
    .map(v => ({ ...v, days: daysUntil(v.next_test_date) }))
    .filter(v => REMIND_ON.includes(v.days) || (v.days < 0 && isMonday))
    .sort((a, b) => a.days - b.days);

  if (due.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const rows = due.map((v, i) => {
    const when = v.days < 0 ? `<b style="color:#B42318">עבר לפני ${-v.days} ימים!</b>` : v.days === 0 ? `<b style="color:#B42318">היום!</b>` : `בעוד ${v.days} ימים`;
    return `<tr${i % 2 ? ' style="background:#f8fafc"' : ""}>
      <td style="padding:10px;font-weight:700">${esc(v.license_plate)}</td>
      <td style="padding:10px">${esc(v.model) || "-"}</td>
      <td style="padding:10px">${esc(v.driver) || "-"}</td>
      <td style="padding:10px">${new Date(v.next_test_date).toLocaleDateString("he-IL")}</td>
      <td style="padding:10px">${when}</td></tr>`;
  }).join("");

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#f6f7f9;border-radius:12px">
      <div style="background:#0284C7;color:#fff;padding:20px;border-radius:10px;margin-bottom:16px;text-align:center">
        <h1 style="margin:0;font-size:22px">תזכורת טסטים לרכבים</h1>
        <div style="margin-top:6px;font-size:14px">נ.ג.ש מור הנדסה</div>
      </div>
      <div style="background:#fff;padding:16px;border-radius:10px;border:1px solid #e4e7ec">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr style="background:#E0F2FE;color:#0369A1;text-align:right">
            <th style="padding:10px">רכב</th><th style="padding:10px">דגם</th><th style="padding:10px">נהג</th><th style="padding:10px">תאריך טסט</th><th style="padding:10px">מתי</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div style="text-align:center;margin-top:18px">
        <a href="${SITE_URL}" style="background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">כנס למערכת</a>
      </div>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "נ.ג.ש מור הנדסה <onboarding@resend.dev>",
      to: [NOTIFY_EMAIL],
      subject: `תזכורת טסט: ${due.map(v => v.license_plate).join(", ")}`.slice(0, 150),
      html,
    }),
  });
  const result = await res.json();
  return NextResponse.json({ ok: res.ok, sent: due.length, result }, { status: res.ok ? 200 : 502 });
}
