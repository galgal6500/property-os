"use client";
// לחיוב: יומנים שתומחרו, מקובצים לפי לקוח – הדפסה מרוכזת למזכירה וסימון "יצאה פרפורמה"
import { useEffect, useMemo, useState } from "react";
import { check, notify } from "./ngs-ui";
import { PRICED_STATUS, VAT_PCT, lineTotal, unitFinal, money, r2, esc } from "./ngs-pricing";

const ISSUED = "יצאה פרפורמה";
type Line = { work_log_id: string; code: string | null; description: string; unit: string | null; qty: number; base_price: number; line_pct: number; sort_order: number };
const num = (l: any) => ({ qty: Number(l.qty), base_price: Number(l.base_price), line_pct: Number(l.line_pct) });
const fmtDate = (d: any) => (d ? new Date(d).toLocaleDateString("he-IL") : "-");

export function BillingTab({ supabase, workLogs, onChanged, formatSerial }: {
  supabase: any; workLogs: any[]; onChanged: () => Promise<void> | void; formatSerial: (n: any) => string;
}) {
  const [status, setStatus] = useState<string>(PRICED_STATUS);
  const [client, setClient] = useState("");
  const [month, setMonth] = useState("");
  const [lines, setLines] = useState<Record<string, Line[]> | null>(null);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const relevant = useMemo(() => workLogs.filter(w => w.performa === PRICED_STATUS || w.performa === ISSUED), [workLogs]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ids = relevant.map(w => w.id);
      const map: Record<string, Line[]> = {};
      for (let i = 0; i < ids.length; i += 150) {
        const r = await supabase.from("ngs_work_log_lines").select("work_log_id,code,description,unit,qty,base_price,line_pct,sort_order").in("work_log_id", ids.slice(i, i + 150)).order("sort_order");
        if (r.error) { notify("שגיאה בטעינת סעיפים: " + r.error.message, "error"); break; }
        for (const l of r.data || []) (map[l.work_log_id] ||= []).push(l);
      }
      if (alive) setLines(map);
    })();
    return () => { alive = false; };
  }, [relevant, supabase]);

  const logTotal = (id: string) => r2((lines?.[id] || []).reduce((s, l) => s + lineTotal(num(l)), 0));

  const shown = useMemo(() => relevant.filter(w =>
    w.performa === status && (!client || w.project_name === client) && (!month || String(w.date || "").startsWith(month))
  ), [relevant, status, client, month]);

  const groups = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const w of shown) (g[w.project_name || "ללא לקוח"] ||= []).push(w);
    return Object.entries(g).sort((a, b) => a[0].localeCompare(b[0], "he"));
  }, [shown]);

  const clients = useMemo(() => Array.from(new Set(relevant.map(w => w.project_name).filter(Boolean))).sort((a, b) => a.localeCompare(b, "he")), [relevant]);
  const months = useMemo(() => Array.from(new Set(relevant.map(w => String(w.date || "").slice(0, 7)).filter(Boolean))).sort().reverse(), [relevant]);
  const chosen = shown.filter(w => sel[w.id]);
  const chosenTotal = r2(chosen.reduce((s, w) => s + logTotal(w.id), 0));
  const toggleAll = (ws: any[], on: boolean) => setSel(s => { const n = { ...s }; ws.forEach(w => { n[w.id] = on; }); return n; });

  async function markIssued() {
    if (!chosen.length) return;
    if (!window.confirm(`לסמן ${chosen.length} יומנים כ"יצאה פרפורמה"?`)) return;
    setBusy(true);
    const r = await supabase.from("ngs_work_logs").update({ performa: ISSUED }).in("id", chosen.map(w => w.id));
    setBusy(false);
    if (!check(r, "היומנים סומנו כיצאה פרפורמה")) return;
    setSel({}); await onChanged();
  }

  function print() {
    if (!chosen.length) return;
    const win = window.open("", "_blank");
    if (!win) return notify("הדפדפן חסם את חלון ההדפסה", "error");
    win.document.open(); win.document.write(buildPrint(chosen, lines || {}, formatSerial)); win.document.close();
  }

  const selStyle = { border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px", fontSize: 14, background: "var(--card)", color: "var(--text)" } as const;

  return (
    <div className="card" style={{ padding: 16, paddingBottom: chosen.length ? 130 : 16 }}>
      <style>{`.ngs-bill-bar{bottom:0;padding-bottom:calc(10px + env(safe-area-inset-bottom)) !important}@media (max-width: 640px){.ngs-bill-bar{bottom:calc(66px + env(safe-area-inset-bottom));padding-bottom:10px !important}}`}</style>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>לחיוב</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>יומנים שתומחרו, לפי לקוח. מסמנים, מדפיסים למזכירה, ואחרי שהוציאה פרפורמה מסמנים "יצאה פרפורמה".</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[PRICED_STATUS, ISSUED].map(s => <button key={s} className={`btn ${status === s ? "btn-primary" : "btn-outline"}`} onClick={() => { setStatus(s); setSel({}); }}>{s === PRICED_STATUS ? "ממתין לחיוב" : "יצאה פרפורמה"} ({relevant.filter(w => w.performa === s).length})</button>)}
        </div>
        <select style={selStyle} value={client} onChange={e => setClient(e.target.value)}><option value="">כל הלקוחות</option>{clients.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select style={selStyle} value={month} onChange={e => setMonth(e.target.value)}><option value="">כל החודשים</option>{months.map(m => <option key={m} value={m}>{m.slice(5)}/{m.slice(0, 4)}</option>)}</select>
      </div>

      {!lines ? <div style={{ padding: 16, color: "var(--muted)" }}>טוען...</div>
        : groups.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>{status === PRICED_STATUS ? "אין יומנים שממתינים לחיוב" : "אין יומנים"}</div>
        : groups.map(([name, ws]) => {
          const all = ws.every(w => sel[w.id]);
          const total = r2(ws.reduce((s, w) => s + logTotal(w.id), 0));
          return (
            <div key={name} style={{ border: "1px solid var(--line)", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface-2)", cursor: "pointer" }}>
                <input type="checkbox" checked={all} onChange={e => toggleAll(ws, e.target.checked)} style={{ width: 20, height: 20 }} />
                <b style={{ flex: 1 }}>{name} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 13 }}>· {ws.length} יומנים</span></b>
                <b style={{ whiteSpace: "nowrap" }}>{money(total)}</b>
              </label>
              {ws.map(w => (
                <label key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderTop: "1px solid var(--line)", cursor: "pointer", fontSize: 14 }}>
                  <input type="checkbox" checked={!!sel[w.id]} onChange={e => setSel(s => ({ ...s, [w.id]: e.target.checked }))} style={{ width: 20, height: 20 }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b>#{formatSerial(w.serial_number)}</b> · {fmtDate(w.date)}
                    <span style={{ display: "block", fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.branch || "-"} · {(lines[w.id] || []).length} סעיפים</span>
                  </span>
                  <span style={{ whiteSpace: "nowrap", fontWeight: 700 }}>{money(logTotal(w.id))}</span>
                </label>
              ))}
            </div>
          );
        })}

      {chosen.length > 0 && (
        <div className="ngs-bill-bar" style={{ position: "fixed", insetInline: 0, zIndex: 210, background: "var(--card)", borderTop: "1px solid var(--line)", boxShadow: "0 -4px 16px rgba(0,0,0,.12)", padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <div style={{ flex: "1 1 160px", fontSize: 14 }}>נבחרו <b>{chosen.length}</b> · {money(chosenTotal)} <span style={{ color: "var(--muted)", fontSize: 12 }}>לפני מע״מ</span></div>
          <button className="btn btn-outline" style={{ minHeight: 44 }} onClick={print}>הדפסה למזכירה</button>
          {status === PRICED_STATUS && <button className="btn btn-primary" style={{ minHeight: 44 }} disabled={busy} onClick={markIssued}>{busy ? "מעדכן..." : "סמן יצאה פרפורמה"}</button>}
        </div>
      )}
    </div>
  );
}

function buildPrint(logs: any[], lines: Record<string, Line[]>, formatSerial: (n: any) => string) {
  const byClient: Record<string, any[]> = {};
  for (const w of logs) (byClient[w.project_name || "ללא לקוח"] ||= []).push(w);
  const tot = (id: string) => r2((lines[id] || []).reduce((s, l) => s + lineTotal(num(l)), 0));
  let h = `<!doctype html><html dir="rtl" lang="he"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>לחיוב – ${logs.length} יומנים</title><style>
    @page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;padding:20px;direction:rtl;color:#111;font-size:13px}
    h2{font-size:20px;margin:0 0 4px}h3{font-size:15px;margin:18px 0 4px}.muted{color:#555;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:6px;font-size:12.5px}td,th{border:1px solid #ccc;padding:5px 7px;text-align:right;vertical-align:top}th{background:#f1f5f9}
    .num{white-space:nowrap;text-align:left;direction:ltr}.tot td{font-weight:bold;background:#f8fafc}.log{page-break-inside:avoid;margin-top:14px;border-top:2px solid #1e3a8a;padding-top:8px}
    .client{page-break-before:always}.client:first-of-type{page-break-before:auto}.bar{text-align:center;margin-bottom:12px}.bar button{font-size:16px;padding:10px 22px;border-radius:10px;border:none;background:#1e3a8a;color:#fff}
    @media print{.bar{display:none}body{padding:0}}</style></head><body><div class="bar"><button onclick="window.print()">הדפסה / שמירה כ-PDF</button></div>`;
  for (const [name, ws] of Object.entries(byClient)) {
    const sub = r2(ws.reduce((s, w) => s + tot(w.id), 0));
    h += `<section class="client"><h2>${esc(name)}</h2><div class="muted">${ws.length} יומנים · הופק ${new Date().toLocaleDateString("he-IL")}</div>`;
    h += `<table><thead><tr><th>יומן</th><th>תאריך</th><th>סניף / אתר</th><th>סה״כ לפני מע״מ</th></tr></thead><tbody>`;
    ws.forEach(w => { h += `<tr><td>#${formatSerial(w.serial_number)}</td><td>${fmtDate(w.date)}</td><td>${esc(w.branch || "-")}</td><td class="num">${money(tot(w.id))}</td></tr>`; });
    h += `<tr class="tot"><td colspan="3">סה״כ לפני מע״מ</td><td class="num">${money(sub)}</td></tr><tr><td colspan="3">מע״מ ${VAT_PCT}%</td><td class="num">${money(r2(sub * VAT_PCT / 100))}</td></tr><tr class="tot"><td colspan="3">סה״כ כולל מע״מ</td><td class="num">${money(r2(sub * (1 + VAT_PCT / 100)))}</td></tr></tbody></table>`;
    ws.forEach(w => {
      const ls = lines[w.id] || [];
      const work = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => w[`line${n}`]).filter(Boolean);
      h += `<div class="log"><h3>יומן #${formatSerial(w.serial_number)} · ${fmtDate(w.date)} · ${esc(w.branch || "-")}</h3>`;
      if (work.length) h += `<div class="muted">פירוט מהשטח: ${work.map(esc).join(" | ")}</div>`;
      h += `<table><thead><tr><th>#</th><th>סעיף</th><th>תיאור</th><th>יח׳</th><th>כמות</th><th>מחיר יח׳</th><th>סה״כ</th></tr></thead><tbody>`;
      ls.forEach((l, i) => { const L = num(l); h += `<tr><td>${i + 1}</td><td class="num">${esc(l.code)}</td><td>${esc(l.description)}</td><td>${esc(l.unit)}</td><td class="num">${L.qty}</td><td class="num">${money(unitFinal(L))}</td><td class="num">${money(lineTotal(L))}</td></tr>`; });
      h += `<tr class="tot"><td colspan="6">סה״כ יומן לפני מע״מ</td><td class="num">${money(tot(w.id))}</td></tr></tbody></table></div>`;
    });
    h += `</section>`;
  }
  return h + `</body></html>`;
}
