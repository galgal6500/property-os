"use client";
// תמחור יומני עבודה לפי מחירון (נ.ג.ש מור)
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { check, notify } from "./ngs-ui";

export const VAT_PCT = 18;
export const PRICED_STATUS = "מתומחר";

export type PriceList = { id: string; name: string };
export type PriceItem = { id: string; price_list_id: string; code: string | null; description: string; unit: string | null; price: number; category: string | null };
export type PricedLine = {
  key: string; price_item_id: string | null; code: string | null; description: string; unit: string | null;
  qty: number; base_price: number; line_pct: number;
};

const r2 = (n: number) => Math.round(n * 100) / 100;
export const unitFinal = (l: { base_price: number; line_pct: number }) => r2(Number(l.base_price) * (1 + (Number(l.line_pct) || 0) / 100));
export const lineTotal = (l: { qty: number; base_price: number; line_pct: number }) => r2(unitFinal(l) * (Number(l.qty) || 0));
export const money = (n: number) => "₪" + n.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const esc = (s: any) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
let keySeq = 0;
const newKey = () => `l${Date.now()}_${keySeq++}`;

// ---- טעינת מחירונים (נשמר בזיכרון לכל הסשן) ----
let cache: { lists: PriceList[]; items: PriceItem[] } | null = null;
export async function loadPriceData(supabase: any, force = false) {
  if (cache && !force) return cache;
  const lists = await supabase.from("ngs_price_lists").select("id,name").order("sort_order");
  const items: PriceItem[] = [];
  for (let from = 0; ; from += 1000) {
    const res = await supabase.from("ngs_price_items").select("id,price_list_id,code,description,unit,price,category").order("sort_order").range(from, from + 999);
    if (res.error) { check(res); break; }
    items.push(...(res.data || []));
    if (!res.data || res.data.length < 1000) break;
  }
  cache = { lists: lists.data || [], items };
  return cache;
}

function matches(item: PriceItem, q: string) {
  const hay = `${item.code || ""} ${item.description} ${item.category || ""}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w));
}

// ---- חיפוש סעיף במחירון ----
function ItemSearch({ items, onPick, autoFocus, inputRef }: { items: PriceItem[]; onPick: (i: PriceItem) => void; autoFocus?: boolean; inputRef?: React.Ref<HTMLInputElement> }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => (q.trim().length < 2 ? [] : items.filter(i => matches(i, q)).slice(0, 40)), [q, items]);
  return (
    <div style={{ position: "relative" }}>
      <input className="input" ref={inputRef} autoFocus={autoFocus} enterKeyHint="search" value={q} onKeyDown={e => { if (e.key === "Enter" && results[0]) { e.preventDefault(); onPick(results[0]); setQ(""); setOpen(false); } }} placeholder="חיפוש סעיף: למשל שקע, דלת, 08.01" onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={e => { setOpen(true); const el = e.currentTarget; setTimeout(() => el.scrollIntoView({ block: "start", behavior: "smooth" }), 250); }} onBlur={() => setTimeout(() => setOpen(false), 200)} />
      {open && results.length > 0 && (
        <div className="ngs-results" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.15)", marginTop: 4 }}>
          {results.map(i => (
            <button key={i.id} type="button" onMouseDown={e => e.preventDefault()} onClick={() => { onPick(i); setQ(""); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "right", padding: "10px 12px", border: "none", borderBottom: "1px solid var(--line)", background: "none", cursor: "pointer", fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{i.code}</span>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{money(Number(i.price))} / {i.unit}</span>
              </div>
              <div className="ngs-clamp2" style={{ lineHeight: 1.35 }}>{i.description}</div>
            </button>
          ))}
        </div>
      )}
      {open && q.trim().length >= 2 && results.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>לא נמצא סעיף מתאים</div>
      )}
    </div>
  );
}

// ---- פאנל תמחור בתוך חלון היומן ----
export function WorkLogPricing({ supabase, workLog, canPrice, userName, title, onChanged }: {
  supabase: any; workLog: any; canPrice: boolean; userName: string; title?: string; onChanged: (patch: any) => void;
}) {
  const [data, setData] = useState<{ lists: PriceList[]; items: PriceItem[] } | null>(null);
  const [listId, setListId] = useState<string>(workLog.price_list_id || "");
  const [lines, setLines] = useState<PricedLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchKey, setSearchKey] = useState(0);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [d, res] = await Promise.all([
        loadPriceData(supabase),
        supabase.from("ngs_work_log_lines").select("*").eq("work_log_id", workLog.id).order("sort_order"),
      ]);
      if (!alive) return;
      setData(d);
      if (!listId && d.lists.length) setListId(d.lists[0].id);
      setLines((res.data || []).map((l: any) => ({ key: l.id, price_item_id: l.price_item_id, code: l.code, description: l.description, unit: l.unit, qty: Number(l.qty), base_price: Number(l.base_price), line_pct: Number(l.line_pct) })));
      setLoaded(true);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workLog.id]);

  const listItems = useMemo(() => (data?.items || []).filter(i => i.price_list_id === listId), [data, listId]);
  const subtotal = r2(lines.reduce((s, l) => s + lineTotal(l), 0));
  const edit = (key: string, patch: Partial<PricedLine>) => { setLines(ls => ls.map(l => l.key === key ? { ...l, ...patch } : l)); setDirty(true); };

  function addItem(i: PriceItem) {
    const k = newKey();
    setFocusKey(k);
    setLines(ls => [...ls, { key: k, price_item_id: i.id, code: i.code, description: i.description, unit: i.unit, qty: 1, base_price: Number(i.price), line_pct: 0 }]);
    setDirty(true); setSearchKey(n => n + 1); // שורת חיפוש חדשה; הפוקוס עובר לכמות של הסעיף שנוסף
  }

  async function save(finish: boolean): Promise<boolean> {
    (document.activeElement as HTMLElement | null)?.blur?.();
    setSaving(true);
    try { return await doSave(finish); }
    catch (e: any) { notify("שגיאה בשמירה: " + (e?.message || "בדוק חיבור לאינטרנט"), "error"); setSaving(false); return false; }
  }

  async function doSave(finish: boolean): Promise<boolean> {
    const del = await supabase.from("ngs_work_log_lines").delete().eq("work_log_id", workLog.id);
    if (!check(del)) { setSaving(false); return false; }
    if (lines.length) {
      const ins = await supabase.from("ngs_work_log_lines").insert(lines.map((l, idx) => ({
        work_log_id: workLog.id, price_item_id: l.price_item_id, code: l.code, description: l.description, unit: l.unit,
        qty: Number(l.qty) || 0, base_price: Number(l.base_price) || 0, line_pct: Number(l.line_pct) || 0, sort_order: idx,
      })));
      if (!check(ins)) { setSaving(false); return false; }
    }
    const patch: any = { price_list_id: listId || null };
    if (finish) { patch.performa = PRICED_STATUS; patch.priced_at = new Date().toISOString(); patch.priced_by = userName; }
    const up = await supabase.from("ngs_work_logs").update(patch).eq("id", workLog.id);
    if (!check(up, finish ? "היומן תומחר" : "התמחור נשמר")) { setSaving(false); return false; }
    onChanged(patch); setDirty(false); setSaving(false); return true;
  }

  // נעילת גלילה של הדף מאחור + התאמת גובה המסך לאזור הנראה (מעל המקלדת בטלפון)
  const pzRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const vv = window.visualViewport;
    const fit = () => {
      const el = pzRef.current; if (!el || !vv) return;
      el.style.top = vv.offsetTop + "px";
      el.style.height = vv.height + "px";
    };
    fit();
    vv?.addEventListener("resize", fit); vv?.addEventListener("scroll", fit);
    return () => { document.body.style.overflow = prev; vv?.removeEventListener("resize", fit); vv?.removeEventListener("scroll", fit); };
  }, [open]);

  const workerLines: string[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => workLog[`line${n}`]).filter(Boolean);

  if (!loaded) return <div style={{ padding: 12, color: "var(--muted)" }}>טוען מחירון...</div>;
  if (!canPrice && lines.length === 0) return null;

  const totals = lines.length > 0 && (
    <div style={{ display: "grid", gap: 2, fontSize: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>סה״כ לפני מע״מ</span><b>{money(subtotal)}</b></div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 13 }}><span>מע״מ {VAT_PCT}%</span><span>{money(r2(subtotal * VAT_PCT / 100))}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16 }}><span>סה״כ כולל מע״מ</span><b>{money(r2(subtotal * (1 + VAT_PCT / 100)))}</b></div>
    </div>
  );

  // תצוגה מקוצרת בתוך חלון היומן
  const summary = (
    <div style={{ marginTop: 18, borderTop: "2px solid var(--line)", paddingTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>תמחור לפי מחירון{lines.length > 0 && <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 13 }}> · {lines.length} סעיפים</span>}</div>
        {canPrice && <button type="button" className="btn btn-primary" style={{ minHeight: 44, paddingInline: 20 }} onClick={() => setOpen(true)}>{lines.length ? "עריכת תמחור" : "תמחר יומן"}</button>}
      </div>
      {lines.length > 0 && (
        <div style={{ display: "grid", gap: 4, fontSize: 13, marginBottom: 10 }}>
          {lines.map((l, idx) => (
            <div key={l.key} style={{ display: "flex", gap: 8, justifyContent: "space-between", padding: "6px 10px", background: "var(--surface-2)", borderRadius: 8 }}>
              <span className="ngs-clamp1">{idx + 1}. {l.description}</span>
              <span style={{ whiteSpace: "nowrap", color: "var(--muted)" }}>{l.qty} × {money(unitFinal(l))} = <b style={{ color: "var(--text)" }}>{money(lineTotal(l))}</b></span>
            </div>
          ))}
        </div>
      )}
      {totals && <div style={{ padding: 12, borderRadius: 12, background: "var(--tint-blue)" }}>{totals}</div>}
      {workLog.priced_at && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>תומחר ע״י {workLog.priced_by || "-"} · {new Date(workLog.priced_at).toLocaleDateString("he-IL")}</div>}
    </div>
  );

  if (!open) return <>{PRICING_CSS}{summary}</>;

  // מסך תמחור מלא: מה שהעובדים כתבו + סעיפים מהמחירון
  return (
    <>
      {PRICING_CSS}
      {summary}
      {createPortal(<div className="ngs-pz" ref={pzRef} role="dialog" aria-label="תמחור יומן">
        <div className="ngs-pz-head">
          <button type="button" className="btn btn-outline" style={{ minHeight: 40 }} onClick={() => { if (!dirty || confirmClose()) setOpen(false); }}>✕ סגור</button>
          <div style={{ fontWeight: 800, fontSize: 15, flex: 1, textAlign: "center", whiteSpace: "nowrap" }}>תמחור {title}</div>
          {data && data.lists.length > 1 ? (
            <select className="input" style={{ width: "auto", maxWidth: 190, height: 40 }} value={listId} onChange={e => { setListId(e.target.value); setDirty(true); }}>
              {data.lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          ) : <span />}
        </div>

        <div className="ngs-pz-body">
          {/* מה שהעובדים כתבו */}
          <aside className="ngs-pz-work">
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>מה שהעובדים כתבו · לחץ על שורה כדי לסמן שטופלה</div>
            {workerLines.length === 0 && <div style={{ fontSize: 13, color: "var(--muted)" }}>אין פירוט ביומן</div>}
            {workerLines.map((t, i) => (
              <button key={i} type="button" onClick={() => setDone(d => ({ ...d, [i]: !d[i] }))} className="ngs-pz-wline" style={{ opacity: done[i] ? 0.5 : 1 }}>
                <span style={{ fontWeight: 800, color: done[i] ? "var(--green)" : "var(--muted)", minWidth: 18 }}>{done[i] ? "✓" : `${i + 1}.`}</span>
                <span style={{ textDecoration: done[i] ? "line-through" : "none" }}>{t}</span>
              </button>
            ))}
          </aside>

          {/* סעיפים מהמחירון */}
          <section className="ngs-pz-items">
            {data && data.lists.length === 0 && <div style={{ color: "var(--red)", fontSize: 13 }}>אין עדיין מחירון במערכת.</div>}
            {lines.map((l, idx) => (
              <div key={l.key} className="ngs-pz-line">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <button type="button" onClick={() => setExpanded(e => ({ ...e, [l.key]: !e[l.key] }))} style={{ all: "unset", cursor: "pointer", fontSize: 13, lineHeight: 1.35, flex: 1 }}>
                    <span style={{ color: "var(--muted)" }}>{idx + 1}. {l.code} · </span>
                    <span className={expanded[l.key] ? "" : "ngs-clamp2"}>{l.description}</span>
                  </button>
                  <button type="button" aria-label="הסר שורה" onClick={() => { setLines(ls => ls.filter(x => x.key !== l.key)); setDirty(true); }} style={{ border: "none", background: "none", color: "var(--red)", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginTop: 6 }}>
                  <label style={{ display: "grid", gap: 2, fontSize: 11, color: "var(--muted)" }}>כמות ({l.unit || "יח׳"})
                    <input className="input" dir="ltr" type="number" inputMode="decimal" min="0" step="any" enterKeyHint="next" autoFocus={focusKey === l.key} value={l.qty} onFocus={e => e.target.select()} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); setFocusKey(null); searchRef.current?.focus(); } }} onChange={e => edit(l.key, { qty: e.target.value as any })} style={{ width: 76, height: 38 }} />
                  </label>
                  <label style={{ display: "grid", gap: 2, fontSize: 11, color: "var(--muted)" }}>% תוספת/הנחה
                    <input className="input" dir="ltr" type="number" inputMode="decimal" step="any" value={l.line_pct} onFocus={e => e.target.select()} onChange={e => edit(l.key, { line_pct: e.target.value as any })} style={{ width: 76, height: 38, color: Number(l.line_pct) < 0 ? "var(--red)" : Number(l.line_pct) > 0 ? "var(--green)" : undefined }} />
                  </label>
                  <div style={{ fontSize: 12, color: "var(--muted)", paddingBottom: 9 }}>
                    {Number(l.line_pct) !== 0 && <><span style={{ textDecoration: "line-through" }}>{money(l.base_price)}</span>{" → "}</>}
                    {money(unitFinal(l))} ליח׳
                  </div>
                  <div style={{ marginInlineStart: "auto", fontWeight: 800, fontSize: 15, paddingBottom: 9 }}>{money(lineTotal(l))}</div>
                </div>
              </div>
            ))}
            {/* שורת חיפוש פתוחה תמיד */}
            <div className="ngs-pz-line" style={{ borderStyle: "dashed", background: "var(--card)" }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>סעיף {lines.length + 1} · הקלד לחיפוש, Enter בוחר את הראשון</div>
              <ItemSearch key={searchKey} items={listItems} onPick={addItem} autoFocus={lines.length === 0} inputRef={searchRef} />
            </div>
          </section>
        </div>

        <div className="ngs-pz-foot">
          <div style={{ flex: "1 1 220px" }}>{totals || <span style={{ color: "var(--muted)", fontSize: 13 }}>עוד לא נבחרו סעיפים</span>}</div>
          <div style={{ display: "flex", gap: 8, flex: "1 1 260px" }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1, minHeight: 48 }} disabled={saving} onPointerDown={e => e.preventDefault()} onClick={() => save(false)}>{saving ? "שומר..." : dirty ? "שמור טיוטה" : "נשמר ✓"}</button>
            <button type="button" className="btn btn-primary" style={{ flex: 1, minHeight: 48 }} disabled={saving} onPointerDown={e => e.preventDefault()} onClick={async () => { if (lines.length === 0) { notify("עוד לא נבחרו סעיפים", "error"); return; } if (await save(true)) setOpen(false); }}>{saving ? "שומר..." : "סיום תמחור"}</button>
          </div>
        </div>
      </div>, document.body)}
    </>
  );
}

const confirmClose = () => window.confirm("יש שינויים שלא נשמרו. לסגור בלי לשמור?");

const PRICING_CSS = (
  <style>{`
    .ngs-clamp1{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
    .ngs-clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .ngs-pz{position:fixed;top:0;left:0;right:0;height:100%;z-index:2100;background:var(--bg, #F5F7FA);display:flex;flex-direction:column;direction:rtl}
    .ngs-pz-head{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--card);border-bottom:1px solid var(--line)}
    .ngs-pz-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(260px,38%) 1fr}
    .ngs-pz-work{overflow:auto;padding:14px 16px;border-inline-end:1px solid var(--line);background:var(--tint-amber)}
    .ngs-pz-items{overflow:auto;padding:14px 16px 120px;display:grid;gap:8px;align-content:start}
    .ngs-pz-wline{display:flex;gap:8px;width:100%;text-align:right;padding:9px 10px;margin-bottom:6px;border:1px solid var(--tint-amber-line);border-radius:10px;background:var(--card);font-size:14px;line-height:1.4;cursor:pointer;color:var(--text)}
    .ngs-pz-line{border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--surface-2)}
    .ngs-pz-foot{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:var(--card);border-top:1px solid var(--line);box-shadow:0 -4px 16px rgba(0,0,0,.06)}
    @media (max-width: 800px){
      .ngs-pz-body{display:flex;flex-direction:column}
      .ngs-pz-work{flex:0 0 auto;max-height:142px;border-inline-end:none;border-bottom:1px solid var(--line);padding:6px 10px}
      .ngs-pz-work > div:first-child{font-size:11px !important;margin-bottom:4px !important}
      .ngs-pz-wline{padding:5px 8px;margin-bottom:4px;font-size:13px;line-height:1.3;border-radius:8px}
      .ngs-pz-items{flex:1;min-height:0;padding:10px 12px 60vh}
      .ngs-pz-head{padding:8px 10px}
      .ngs-pz-foot{padding:8px 12px calc(8px + env(safe-area-inset-bottom))}
    }
  `}</style>
);

// ---- הדפסת יומן (כולל תמחור, אם קיים) ----
export async function printWorkLog(supabase: any, w: any, serial: string) {
  const win = window.open("", "_blank");
  if (!win) return notify("הדפדפן חסם את חלון ההדפסה", "error");
  win.document.write(`<html dir="rtl"><head><title>טוען...</title></head><body style="font-family:Arial">טוען...</body></html>`);
  const res = await supabase.from("ngs_work_log_lines").select("*").eq("work_log_id", w.id).order("sort_order");
  const priced: any[] = res.error ? [] : (res.data || []);
  let listName = "";
  if (priced.length && w.price_list_id) {
    const l = await supabase.from("ngs_price_lists").select("name").eq("id", w.price_list_id).single();
    listName = l.data?.name || "";
  }
  const lines = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => w[`line${n}`]).filter(Boolean);
  const workers = [w.employee_name, w.workers].filter(Boolean).join(", ");
  const date = w.date ? new Date(w.date).toLocaleDateString("he-IL") : "-";
  let h = `<html dir="rtl"><head><meta charset="utf-8"><title>יומן עבודה #${serial}</title><style>
    body{font-family:Arial,sans-serif;padding:28px;direction:rtl;color:#111}h2{font-size:22px;margin:0 0 6px}h3{font-size:16px;margin:22px 0 6px}
    table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}td,th{border:1px solid #ccc;padding:6px 8px;text-align:right;vertical-align:top}
    th{background:#f1f5f9}.num{white-space:nowrap;text-align:left}.tot td{font-weight:bold;background:#f8fafc}@media print{button{display:none}}</style></head><body>`;
  h += `<h2>יומן עבודה #${serial}</h2>`;
  h += `<div>תאריך: ${esc(date)} | לקוח: ${esc(w.project_name || "-")} | סניף: ${esc(w.branch || "-")}</div>`;
  h += `<div>עובדים: ${esc(workers || "-")} | שעות: ${esc(w.hours || "-")} | ממלא: ${esc(w.filled_by || "-")}</div>`;
  h += `<h3>פירוט עבודה (מהשטח)</h3><table><thead><tr><th style="width:30px">#</th><th>פירוט</th></tr></thead><tbody>`;
  lines.forEach((l, i) => { h += `<tr><td>${i + 1}</td><td>${esc(l)}</td></tr>`; });
  h += `</tbody></table>`;
  if (w.client_notes) h += `<p><strong>הערות ללקוח:</strong> ${esc(w.client_notes)}</p>`;
  if (priced.length) {
    const sub = r2(priced.reduce((s, l) => s + lineTotal({ qty: Number(l.qty), base_price: Number(l.base_price), line_pct: Number(l.line_pct) }), 0));
    h += `<h3>סעיפים לחיוב${listName ? ` – ${esc(listName)}` : ""}</h3><table><thead><tr><th>#</th><th>סעיף</th><th>תיאור</th><th>יח׳</th><th>כמות</th><th>מחיר יח׳</th><th>סה״כ</th></tr></thead><tbody>`;
    priced.forEach((l, i) => {
      const L = { qty: Number(l.qty), base_price: Number(l.base_price), line_pct: Number(l.line_pct) };
      h += `<tr><td>${i + 1}</td><td class="num">${esc(l.code)}</td><td>${esc(l.description)}</td><td>${esc(l.unit)}</td><td class="num">${L.qty}</td><td class="num">${money(unitFinal(L))}</td><td class="num">${money(lineTotal(L))}</td></tr>`;
    });
    h += `<tr class="tot"><td colspan="6">סה״כ לפני מע״מ</td><td class="num">${money(sub)}</td></tr>`;
    h += `<tr><td colspan="6">מע״מ ${VAT_PCT}%</td><td class="num">${money(r2(sub * VAT_PCT / 100))}</td></tr>`;
    h += `<tr class="tot"><td colspan="6">סה״כ כולל מע״מ</td><td class="num">${money(r2(sub * (1 + VAT_PCT / 100)))}</td></tr></tbody></table>`;
  }
  h += `<br/><button onclick="window.print()">הדפס</button></body></html>`;
  win.document.open(); win.document.write(h); win.document.close();
}

// ---- לשונית מחירון: צפייה, חיפוש ועדכון מחיר ----
export function PriceListTab({ supabase, canPrice }: { supabase: any; canPrice: boolean }) {
  const [data, setData] = useState<{ lists: PriceList[]; items: PriceItem[] } | null>(null);
  const [listId, setListId] = useState("");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<{ id: string; price: string } | null>(null);
  useEffect(() => { loadPriceData(supabase).then(d => { setData(d); if (d.lists[0]) setListId(d.lists[0].id); }); }, [supabase]);
  const shown = useMemo(() => {
    const all = (data?.items || []).filter(i => i.price_list_id === listId);
    return q.trim() ? all.filter(i => matches(i, q)) : all;
  }, [data, listId, q]);
  async function savePrice(id: string, price: string) {
    const p = Number(price);
    if (!(p >= 0)) return notify("מחיר לא תקין", "error");
    if (!check(await supabase.from("ngs_price_items").update({ price: p }).eq("id", id), "המחיר עודכן")) return;
    setData(await loadPriceData(supabase, true)); setEditing(null);
  }
  if (!data) return <div className="card" style={{ padding: 20 }}>טוען מחירון...</div>;
  let lastCat = "";
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {data.lists.map(l => <button key={l.id} className={`btn ${l.id === listId ? "btn-primary" : "btn-outline"}`} onClick={() => setListId(l.id)}>{l.name}</button>)}
      </div>
      <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="חיפוש לפי מילה או מספר סעיף" />
      <div style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0" }}>{shown.length} סעיפים</div>
      <div style={{ display: "grid", gap: 6 }}>
        {shown.slice(0, 300).map(i => {
          const head = i.category && i.category !== lastCat ? (lastCat = i.category) : null;
          return (
            <div key={i.id}>
              {head && <div style={{ fontWeight: 800, fontSize: 14, margin: "12px 0 4px", color: "var(--blue-ink)" }}>{head}</div>}
              <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 10 }}>
                <div style={{ flex: 1, fontSize: 13, lineHeight: 1.35 }}><span style={{ color: "var(--muted)" }}>{i.code} · </span>{i.description}</div>
                {editing?.id === i.id ? (
                  <span style={{ display: "flex", gap: 4 }}>
                    <input className="input" dir="ltr" type="number" inputMode="decimal" value={editing.price} onChange={e => setEditing({ id: i.id, price: e.target.value })} style={{ width: 90, height: 36 }} autoFocus />
                    <button className="btn btn-primary" style={{ padding: "4px 10px" }} onClick={() => savePrice(i.id, editing.price)}>שמור</button>
                  </span>
                ) : (
                  <button type="button" disabled={!canPrice} onClick={() => setEditing({ id: i.id, price: String(i.price) })} style={{ border: "none", background: "none", fontWeight: 800, whiteSpace: "nowrap", cursor: canPrice ? "pointer" : "default", fontSize: 14 }}>
                    {money(Number(i.price))} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 12 }}>/ {i.unit}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {shown.length > 300 && <div style={{ fontSize: 12, color: "var(--muted)" }}>מוצגים 300 ראשונים, צמצם בחיפוש.</div>}
      </div>
    </div>
  );
}
