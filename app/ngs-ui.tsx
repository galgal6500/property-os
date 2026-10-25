"use client";
// כלים משותפים למסכי נ.ג.ש מור: צבעים לכל אזור, כותרות, הודעות, תמונות וייצוא לאקסל
import { useEffect, useState } from "react";
import { Icon } from "./icons";

// ── צבע לכל אזור ──  c = צבע טקסט/אייקון, bg = רקע בהיר, solid = צבע מלא
export const SECTION: Record<string, { c: string; bg: string; solid: string }> = {
  overview:  { c: "#1D4ED8", bg: "#DBEAFE", solid: "#2563EB" },
  vehicles:  { c: "#0369A1", bg: "#E0F2FE", solid: "#0284C7" },
  employees: { c: "#047857", bg: "#D1FAE5", solid: "#059669" },
  clients:   { c: "#BE185D", bg: "#FCE7F3", solid: "#DB2777" },
  projects:  { c: "#4338CA", bg: "#E0E7FF", solid: "#4F46E5" },
  service:   { c: "#B91C1C", bg: "#FEE2E2", solid: "#DC2626" },
  worklogs:  { c: "#1D4ED8", bg: "#DBEAFE", solid: "#2563EB" },
  hours:     { c: "#0F766E", bg: "#CCFBF1", solid: "#0D9488" },
  tasks:     { c: "#B45309", bg: "#FEF3C7", solid: "#D97706" },
  inventory: { c: "#6D28D9", bg: "#EDE9FE", solid: "#7C3AED" },
};

export function IconChip({ name, section, size = 40, iconSize }: { name: string; section?: string; size?: number; iconSize?: number }) {
  const s = SECTION[section || name] || SECTION.overview;
  return (
    <span style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), background: s.bg, color: s.c, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={name} size={iconSize || Math.round(size * 0.5)} />
    </span>
  );
}

export function SectionTitle({ icon, section, children }: { icon: string; section?: string; children: React.ReactNode }) {
  return (
    <h3 className="card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
      <IconChip name={icon} section={section} size={36} />
      <span>{children}</span>
    </h3>
  );
}

export function EmptyState({ icon, section, text, sub }: { icon: string; section?: string; text: string; sub?: string }) {
  return (
    <div style={{ padding: 30, textAlign: "center", color: "#475467", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <IconChip name={icon} section={section} size={56} />
      <div style={{ fontWeight: 700 }}>{text}</div>
      {sub && <div style={{ fontSize: 14 }}>{sub}</div>}
    </div>
  );
}

// ── הודעות קופצות (במקום שקט כשמשהו נכשל) ──
type Toast = { id: number; msg: string; kind: "ok" | "error" };
export function notify(msg: string, kind: "ok" | "error" = "ok") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ngs-toast", { detail: { msg, kind } }));
}

// בודק תשובה של Supabase: אם יש שגיאה – מציג הודעה ומחזיר false
export function check(res: { error: any } | null | undefined, okMsg?: string): boolean {
  if (res?.error) {
    notify("שגיאה: " + (res.error.message || "הפעולה נכשלה"), "error");
    return false;
  }
  if (okMsg) notify(okMsg, "ok");
  return true;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    let n = 0;
    function onToast(e: Event) {
      const { msg, kind } = (e as CustomEvent).detail;
      const id = ++n + Date.now();
      setToasts(t => [...t, { id, msg, kind }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), kind === "error" ? 7000 : 2500);
    }
    window.addEventListener("ngs-toast", onToast);
    return () => window.removeEventListener("ngs-toast", onToast);
  }, []);
  if (!toasts.length) return null;
  return (
    <div role="status" aria-live="polite" style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 5000, display: "flex", flexDirection: "column", gap: 8, width: "min(92vw, 420px)" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.kind === "error" ? "#B42318" : "#067647", color: "#fff", borderRadius: 12, padding: "12px 16px", fontWeight: 600, fontSize: 15, boxShadow: "0 8px 24px rgba(16,24,40,0.18)", display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name={t.kind === "error" ? "alert" : "tasks"} size={20} />
          <span style={{ flex: 1 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ── תמונות ──
// מקטין תמונה לפני העלאה (תמונות טלפון שוקלות כמה מגה)
async function shrinkImage(file: File, maxSide = 1600): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>(res => canvas.toBlob(b => res(b || file), "image/jpeg", 0.82));
  } catch {
    return file;
  }
}

export function PhotoStrip({ supabase, table, row, onChange, canEdit = true }:
  { supabase: any; table: "ngs_work_logs" | "ngs_service_calls"; row: any; onChange: (photos: string[]) => void; canEdit?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [big, setBig] = useState<string | null>(null);
  const photos: string[] = Array.isArray(row.photos) ? row.photos : [];

  async function add(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const blob = await shrinkImage(f);
      const path = `ngs-photos/${table}/${row.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
      const { error } = await supabase.storage.from("documents").upload(path, blob, { contentType: "image/jpeg" });
      if (error) { notify("שגיאה בהעלאת תמונה: " + error.message, "error"); continue; }
      urls.push(supabase.storage.from("documents").getPublicUrl(path).data.publicUrl);
    }
    if (urls.length) {
      const next = [...photos, ...urls];
      const res = await supabase.from(table).update({ photos: next }).eq("id", row.id);
      if (check(res, urls.length === 1 ? "התמונה נשמרה" : `${urls.length} תמונות נשמרו`)) onChange(next);
    }
    setBusy(false);
  }

  async function remove(url: string) {
    if (!confirm("להסיר את התמונה?")) return;
    const next = photos.filter(p => p !== url);
    const res = await supabase.from(table).update({ photos: next }).eq("id", row.id);
    if (check(res)) onChange(next);
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><Icon name="camera" size={18} />תמונות ({photos.length})</div>
        {canEdit && (
          <label className="btn btn-outline" style={{ cursor: busy ? "default" : "pointer" }}>
            <Icon name="camera" size={18} />{busy ? "מעלה..." : "הוסף תמונה"}
            <input type="file" accept="image/*" capture="environment" multiple hidden disabled={busy} onChange={e => { add(e.target.files); e.target.value = ""; }} />
          </label>
        )}
      </div>
      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
          {photos.map(p => (
            <div key={p} style={{ position: "relative" }}>
              <button onClick={() => setBig(p)} aria-label="הגדל תמונה" style={{ padding: 0, border: "none", background: "none", cursor: "zoom-in", width: "100%", display: "block" }}>
                <img src={p} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 10, display: "block" }} />
              </button>
              {canEdit && <button onClick={() => remove(p)} aria-label="הסר תמונה" style={{ position: "absolute", top: 4, left: 4, width: 28, height: 28, borderRadius: 999, border: "none", background: "rgba(16,24,40,0.7)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="close" size={14} /></button>}
            </div>
          ))}
        </div>
      )}
      {big && (
        <div onClick={() => setBig(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 4000, display: "grid", placeItems: "center", padding: 16, cursor: "zoom-out" }}>
          <img src={big} alt="" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} />
        </div>
      )}
    </div>
  );
}

// ── ייצוא יומני עבודה לאקסל (קובץ CSV שנפתח באקסל עם עברית תקינה) ──
export function exportWorkLogsCSV(logs: any[], agreements: any[], fileLabel: string, formatSerial: (n: any) => string) {
  const esc = (v: any) => {
    const s = String(v ?? "").replace(/\r?\n/g, " ");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["מס׳ יומן", "תאריך", "לקוח", "סניף / אתר", "תחנה / הסכם", "שעות", "עובדים", "ממלא", "פירוט העבודה", "הערות ללקוח", "פרפורמה"];
  const rows = logs.map(w => {
    const ag = agreements.find((a: any) => a.id === w.agreement_id);
    const lines = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => w[`line${n}`]).filter(Boolean).join(" | ");
    return [
      formatSerial(w.serial_number),
      w.date ? new Date(w.date).toLocaleDateString("he-IL") : "",
      w.project_name || "",
      w.branch || "",
      ag?.station_name || "",
      parseFloat(w.hours) || 0,
      [w.employee_name, w.workers].filter(Boolean).join(", "),
      w.filled_by || "",
      lines,
      w.client_notes || "",
      w.performa || "לא טופל",
    ];
  });
  const total = logs.reduce((s, w) => s + (parseFloat(w.hours) || 0), 0);
  rows.push(["", "", "", "", "סה״כ שעות", total, "", "", "", "", ""]);
  const csv = "﻿" + [header, ...rows].map(r => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `יומני-עבודה${fileLabel ? "-" + fileLabel : ""}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ── זיכרון של היומן האחרון (כדי לא למלא שוב לקוח/אתר בכל פעם) ──
const LAST_KEY = "ngs-last-worklog";
export function loadLastWorkLog(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(LAST_KEY) || "{}") || {}; } catch { return {}; }
}
export function saveLastWorkLog(v: Record<string, string>) {
  try { localStorage.setItem(LAST_KEY, JSON.stringify(v)); } catch { /* לא חשוב אם נכשל */ }
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}
