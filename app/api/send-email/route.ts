import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    let subject = "";
    let html = "";

    if (type === "new_service_request") {
      subject = `🔧 קריאת שירות חדשה — ${data.issue}`;
      html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <div style="background: #0f172a; color: #d5b57a; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">🔧 קריאת שירות חדשה</h1>
          </div>
          <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">נושא:</td><td style="padding: 8px; font-weight: 700;">${data.issue || "-"}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b; font-weight: bold;">דירה/כתובת:</td><td style="padding: 8px;">${data.apartment || "-"}</td></tr>
              <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">דחיפות:</td><td style="padding: 8px;">${data.urgency || "-"}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b; font-weight: bold;">תיאור:</td><td style="padding: 8px;">${data.description || "-"}</td></tr>
              <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">תאריך:</td><td style="padding: 8px;">${new Date().toLocaleDateString("he-IL")}</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://property-os-ten.vercel.app" style="background: #0f172a; color: #d5b57a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">כנס למערכת</a>
          </div>
        </div>
      `;
    } else if (type === "new_ngs_service_call") {
      subject = `🏗️ קריאת שירות חדשה נג"ש — ${data.issue}`;
      html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <div style="background: #0f172a; color: #d5b57a; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">🏗️ קריאת שירות חדשה — נ.ג.ש מור הנדסה</h1>
          </div>
          <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">נושא:</td><td style="padding: 8px; font-weight: 700;">${data.issue || "-"}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b; font-weight: bold;">לקוח:</td><td style="padding: 8px;">${data.client_name || "-"}</td></tr>
              <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">דחיפות:</td><td style="padding: 8px;">${data.urgency || "-"}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b; font-weight: bold;">מיקום:</td><td style="padding: 8px;">${data.location || "-"}</td></tr>
              <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">איש קשר:</td><td style="padding: 8px;">${data.contact_name || "-"} ${data.contact_phone ? `| ${data.contact_phone}` : ""}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b; font-weight: bold;">אחראי:</td><td style="padding: 8px;">${data.assigned_to || "-"}</td></tr>
              <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">תיאור:</td><td style="padding: 8px;">${data.description || "-"}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b; font-weight: bold;">תאריך:</td><td style="padding: 8px;">${new Date().toLocaleDateString("he-IL")}</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://property-os-ten.vercel.app" style="background: #0f172a; color: #d5b57a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">כנס למערכת</a>
          </div>
        </div>
      `;
    }

    if (type === "vehicle_damage") {
      const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      const loc = String(data.location || "");
      const locHtml = /^https?:\/\//.test(loc) ? `<a href="${esc(loc)}">פתח במפה</a>` : esc(loc);
      const photos = (Array.isArray(data.photos) ? data.photos : []).filter((u: unknown) => typeof u === "string" && /^https:\/\//.test(u as string));
      subject = `🚗 דוח נזק לרכב ${esc(data.license_plate)}`;
      html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
          <div style="background: #B42318; color: #fff; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">🚗 דוח נזק / תאונה</h1>
          </div>
          <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">רכב:</td><td style="padding: 8px; font-weight: 700;">${esc(data.license_plate)} ${esc(data.model)}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b; font-weight: bold;">דיווח:</td><td style="padding: 8px;">${esc(data.reported_by)}</td></tr>
              <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">מתי:</td><td style="padding: 8px;">${esc(data.occurred_at)}</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b; font-weight: bold;">מיקום:</td><td style="padding: 8px;">${locHtml}</td></tr>
              <tr><td style="padding: 8px; color: #64748b; font-weight: bold;">תיאור:</td><td style="padding: 8px;">${esc(data.description) || "-"}</td></tr>
            </table>
            ${photos.length ? `<div style="margin-top: 12px;">${photos.map((u: string) => `<a href="${esc(u)}"><img src="${esc(u)}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; margin: 4px;" /></a>`).join("")}</div>` : ""}
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://property-os-ten.vercel.app" style="background: #0f172a; color: #d5b57a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">כנס למערכת</a>
          </div>
        </div>
      `;
    }

    if (!subject) return NextResponse.json({ error: "Unknown type" }, { status: 400 });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "נ.ג.ש מור הנדסה <onboarding@resend.dev>",
        to: ["galgal6500@gmail.com"],
        subject,
        html,
      }),
    });

    const result = await res.json();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
