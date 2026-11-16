import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// התראות יומיות במייל על רכבי נג"ש. Vercel מריץ פעם ביום (vercel.json).
// 1. קילומטראז' חודשי לא דווח – החל מה-4 לחודש (3 ימים אחרי ההתרעה לעובד), ואז כל 3 ימים עד שמדווח.
// 2. אוריאה לא מולאה (רק לרכבים שמסומנים "דורש אוריאה") – אותו לוח זמנים.
// 3. רכב שעבר עוד 12,000 ק"מ (או מרווח אחר שהוגדר לרכב) – פעם אחת לכל סף, כדי לקבוע טיפול.
// משתמש במשתנים הקיימים: SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET, RESEND_API_KEY, NOTIFY_EMAIL (לא חובה).

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "galgal6500@gmail.com";
const SITE_URL = "https://property-os-ten.vercel.app";

function esc(v: unknown) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// התאריך של היום לפי שעון ישראל
function israelToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (t: string) => parts.find(p => p.type === t)!.value;
  return { year: get("year"), month: get("month"), day: Number(get("day")) };
}

type Item = { vehicle_id: string; kind: "km" | "urea" | "service"; key: string; plate: string; model: string; driver: string; text: string };

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
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false } });

  const { year, month, day } = israelToday();
  const monthISO = `${year}-${month}-01`;

  const { data: vehicles, error } = await db
    .from("ngs_vehicles")
    .select("id, license_plate, model, driver, status, urea_required, km_start, service_interval_km")
    .neq("status", "מושבת");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const list = vehicles || [];
  if (!list.length) return NextResponse.json({ ok: true, sent: 0 });
  const ids = list.map(v => v.id);

  const [mThis, uThis, allKm, sent] = await Promise.all([
    db.from("ngs_vehicle_mileage").select("vehicle_id").eq("month", monthISO).in("vehicle_id", ids),
    db.from("ngs_vehicle_urea").select("vehicle_id").eq("month", monthISO).in("vehicle_id", ids),
    db.from("ngs_vehicle_mileage").select("vehicle_id, km, month").in("vehicle_id", ids).order("month", { ascending: false }),
    db.from("ngs_vehicle_alerts").select("vehicle_id, kind, alert_key").in("vehicle_id", ids),
  ]);
  const kmDone = new Set((mThis.data || []).map(r => r.vehicle_id));
  const ureaDone = new Set((uThis.data || []).map(r => r.vehicle_id));
  const alreadySent = new Set((sent.data || []).map(r => `${r.vehicle_id}|${r.kind}|${r.alert_key}`));
  const kmByVehicle = new Map<string, number[]>();
  for (const r of allKm.data || []) {
    const arr = kmByVehicle.get(r.vehicle_id) || [];
    arr.push(Number(r.km));
    kmByVehicle.set(r.vehicle_id, arr);
  }

  const items: Item[] = [];
  const add = (v: any, kind: Item["kind"], key: string, text: string) => {
    if (alreadySent.has(`${v.id}|${kind}|${key}`)) return;
    items.push({ vehicle_id: v.id, kind, key, plate: v.license_plate, model: v.model || "", driver: v.driver || "", text });
  };

  // קילומטראז' ואוריאה: ביום 4 לחודש ואז כל 3 ימים (4, 7, 10...)
  const nagDay = day >= 4 && (day - 4) % 3 === 0;
  const daysLate = day - 1;
  for (const v of list) {
    if (!v.driver) continue;
    if (nagDay && !kmDone.has(v.id)) add(v, "km", `${monthISO}-d${day}`, `לא דווח קילומטראז' החודש (${daysLate} ימים מההתרעה)`);
    if (nagDay && v.urea_required && !ureaDone.has(v.id)) add(v, "urea", `${monthISO}-d${day}`, `לא סומן מילוי אוריאה החודש (${daysLate} ימים מההתרעה)`);
  }

  // טיפול: כשהמד האחרון עובר סף של כל 12,000 ק"מ (לפי המרווח שהוגדר לרכב)
  for (const v of list) {
    const kms = kmByVehicle.get(v.id) || [];
    if (!kms.length) continue;
    const interval = Number(v.service_interval_km) || 12000;
    const latest = kms[0];
    const previous = kms.length > 1 ? kms[1] : v.km_start != null ? Number(v.km_start) : null;
    if (previous == null) continue; // דיווח ראשון בלי מד התחלה – אין ממה לחשב מעבר סף
    const threshold = Math.floor(latest / interval) * interval;
    if (threshold > 0 && previous < threshold && latest >= threshold) {
      add(v, "service", String(threshold), `הגיע ל-${latest.toLocaleString("he-IL")} ק"מ – עבר את סף ה-${threshold.toLocaleString("he-IL")}. לקבוע טיפול`);
    }
  }

  if (!items.length) return NextResponse.json({ ok: true, sent: 0 });

  const section = (title: string, color: string, rows: Item[]) => !rows.length ? "" : `
    <h3 style="margin:18px 0 8px;color:${color}">${title}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;background:#fff;border:1px solid #e4e7ec;border-radius:8px">
      ${rows.map((r, i) => `<tr${i % 2 ? ' style="background:#f8fafc"' : ""}>
        <td style="padding:10px;font-weight:700">${esc(r.plate)}</td>
        <td style="padding:10px">${esc(r.model) || "-"}</td>
        <td style="padding:10px">${esc(r.driver) || "-"}</td>
        <td style="padding:10px">${esc(r.text)}</td></tr>`).join("")}
    </table>`;

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#f6f7f9;border-radius:12px">
      <div style="background:#0284C7;color:#fff;padding:20px;border-radius:10px;text-align:center">
        <h1 style="margin:0;font-size:22px">התראות רכבים</h1>
        <div style="margin-top:6px;font-size:14px">נ.ג.ש מור הנדסה</div>
      </div>
      ${section("🔧 לקבוע טיפול", "#B42318", items.filter(i => i.kind === "service"))}
      ${section("📏 קילומטראז' לא דווח", "#B54708", items.filter(i => i.kind === "km"))}
      ${section("💧 אוריאה לא מולאה", "#B54708", items.filter(i => i.kind === "urea"))}
      <div style="text-align:center;margin-top:18px">
        <a href="${SITE_URL}" style="background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">כנס למערכת</a>
      </div>
    </div>`;

  const kinds = new Set(items.map(i => i.kind));
  const subjectParts = [kinds.has("service") ? "טיפול לרכב" : "", kinds.has("km") ? "קילומטראז' לא דווח" : "", kinds.has("urea") ? "אוריאה לא מולאה" : ""].filter(Boolean);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "נ.ג.ש מור הנדסה <onboarding@resend.dev>",
      to: [NOTIFY_EMAIL],
      subject: `התראת רכבים: ${subjectParts.join(" · ")}`.slice(0, 150),
      html,
    }),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ ok: false, result }, { status: 502 });

  // שומר מה נשלח כדי לא לשלוח שוב את אותה התראה
  await db.from("ngs_vehicle_alerts").upsert(
    items.map(i => ({ vehicle_id: i.vehicle_id, kind: i.kind, alert_key: i.key })),
    { onConflict: "vehicle_id,kind,alert_key", ignoreDuplicates: true }
  );
  return NextResponse.json({ ok: true, sent: items.length });
}
