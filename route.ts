import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// יצירת משתמש חדש על ידי מנהל.
// רץ בשרת בלבד (המפתח הסודי לא מגיע לדפדפן), ובודק שמי שביקש הוא מנהל מאושר.
// משתמש במשתנה SUPABASE_SERVICE_ROLE_KEY שכבר מוגדר ב-Vercel לתזכורות הטסטים.

const ROLES = ["admin", "ngs_worker", "owner", "tenant"];

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "חסר SUPABASE_SERVICE_ROLE_KEY בהגדרות Vercel" }, { status: 500 });
  }
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // מי מבקש? בודקים את הטוקן של המשתמש המחובר
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  const { data: caller, error: callerErr } = await admin.auth.getUser(token);
  if (callerErr || !caller?.user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const { data: callerProfile } = await admin.from("profiles").select("role, status").eq("id", caller.user.id).maybeSingle();
  if (!callerProfile || callerProfile.role !== "admin" || callerProfile.status === "ממתין לאישור" || callerProfile.status === "נדחה") {
    return NextResponse.json({ error: "רק מנהל יכול להוסיף משתמשים" }, { status: 403 });
  }

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 }); }
  const full_name = String(body.full_name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const phone = String(body.phone || "").trim();
  const role = String(body.role || "");
  if (!full_name || !email || !password) return NextResponse.json({ error: "יש למלא שם, אימייל וסיסמה" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "הסיסמה צריכה להיות לפחות 8 תווים" }, { status: 400 });
  if (!ROLES.includes(role)) return NextResponse.json({ error: "תפקיד לא תקין" }, { status: 400 });

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name, phone, role },
  });
  if (createErr || !created?.user) return NextResponse.json({ error: createErr?.message || "שגיאה ביצירת המשתמש" }, { status: 400 });

  const { error: profErr } = await admin.from("profiles").upsert({ id: created.user.id, full_name, phone, role, status: "מאושר" });
  if (profErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: created.user.id });
}
