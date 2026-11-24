"use client";
// תמחור יומני עבודה לפי מחירון (נ.ג.ש מור)
import { useEffect, useMemo, useRef, useState } from "react";
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
function ItemSearch({ items, onPick, autoFocus }: { items: PriceItem[]; onPick: (i: PriceItem) => void; autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => (q.trim().length < 2 ? [] : items.filter(i => matches(i, q)).slice(0, 40)), [q, items]);
  return (
    <div style={{ position: "relative" }}>
      <input className="input" autoFocus={autoFocus} value={q} placeholder="חיפוש סעיף: למשל שקע, דלת, 08.01" onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)} />
      {open && results.length > 0 && (
        <div style={{ position: "absolute", insetInline: 0, top: "100%", zIndex: 30, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.15)", maxHeight: 300, overflow: "auto", marginTop: 4 }}>
          {results.map(i => (
            <button key={i.id} type="button" onMouseDown={e => e.preventDefault()} onClick={() => { onPick(i); setQ(""); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "right", padding: "10px 12px", border: "none", borderBottom: "1px solid var(--line)", background: "none", cursor: "pointer", fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{i.code}</span>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{money(Number(i.price))} / {i.unit}</span>
              </div>
              <div style={{ lineHeight: 1.35 }}>{i.description}</div>
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
export function WorkLogPricing({ supabase, workLog, canPrice, userName, onChanged }: {
  supabase: any; workLog: any; canPrice: boolean; userName: string; onChanged: (patch: any) => void;
}) {
  const [data, setData] = useState<{ lists: PriceList[]; items: PriceItem[] } | null>(null);
  const [listId, setListId] = useState<string>(workLog.price_list_id || "");
  const [lines, setLines] = useState<PricedLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const lastLog = useRef(workLog.id);

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
    lastLog.current = workLog.id;
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workLog.id]);

  const listItems = useMemo(() => (data?.items || []).filter(i => i.price_list_id === listId), [data, listId]);
  const subtotal = r2(lines.reduce((s, l) => s + lineTotal(l), 0));
  const edit = (key: string, patch: Partial<PricedLine>) => { setLines(ls => ls.map(l => l.key === key ? { ...l, ...patch } : l)); setDirty(true); };

  function addItem(i: PriceItem) {
    setLines(ls => [...ls, { key: newKey(), price_item_id: i.id, code: i.code, description: i.description, unit: i.unit, qty: 1, base_price: Number(i.price), line_pct: 0 }]);
    setDirty(true); setAdding(false);
  }

  async function save(finish: boolean) {
    setSaving(true);
    const del = await supabase.from("ngs_work_log_lines").delete().eq("work_log_id", workLog.id);
    if (!check(del)) { setSaving(false); return; }
    if (lines.length) {
      const ins = await supabase.from("ngs_work_log_lines").insert(lines.map((l, idx) => ({
        work_log_id: workLog.id, price_item_id: l.price_item_id, code: l.code, description: l.description, unit: l.unit,
        qty: Number(l.qty) || 0, base_price: Number(l.base_price) || 0, line_pct: Number(l.line_pct) || 0, sort_order: idx,
      })));
      if (!check(ins)) { setSaving(false); return; }
    }
    const patch: any = { price_list_id: listId || null };
    if (finish) { patch.performa = PRICED_STATUS; patch.priced_at = new Date().toISOString(); patch.priced_by = userName; }
    const up = await supabase.from("ngs_work_logs").update(patch).eq("id", workLog.id);
    if (!check(up, finish ? "היומן תומחר" : "התמחור נשמר")) { setSaving(false); return; }
    onChanged(patch); setDirty(false); setSaving(false);
  }

  if (!loaded) return <div style={{ padding: 12, color: "var(--muted)" }}>טוען מחירון...</div>;
  if (!canPrice && lines.length === 0) return null;

  return (
    <div style={{ marginTop: 18, borderTop: "2px solid var(--line)", paddingTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>תמחור לפי מחירון</div>
        {canPrice && data && data.lists.length > 1 && (
          <select className="input" style={{ width: "auto", minWidth: 180, height: 40 }} value={listId} onChange={e => { setListId(e.target.value); setDirty(true); }}>
            {data.lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        )}
      </div>
      {canPrice && data && data.lists.length === 0 && <div style={{ color: "var(--red)", fontSize: 13 }}>אין עדיין מחירון במערכת.</div>}

      <div style={{ display: "grid", gap: 8 }}>
        {lines.map((l, idx) => (
          <div key={l.key} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 10, background: "var(--surface-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontSize: 13, lineHeight: 1.35 }}><span style={{ color: "var(--muted)" }}>{idx + 1}. {l.code} · </span>{l.description}</div>
              {canPrice && <button type="button" aria-label="הסר שורה" onClick={() => { setLines(ls => ls.filter(x => x.key !== l.key)); setDirty(true); }} style={{ border: "none", background: "none", color: "var(--red)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginTop: 8 }}>
              <label style={{ display: "grid", gap: 2, fontSize: 11, color: "var(--muted)" }}>כמות ({l.unit})
                {canPrice ? <input className="input" dir="ltr" type="number" inputMode="decimal" min="0" step="any" value={l.qty} onChange={e => edit(l.key, { qty: e.target.value as any })} style={{ width: 80, height: 38 }} /> : <b style={{ fontSize: 14, color: "var(--text)" }}>{l.qty}</b>}
              </label>
              {canPrice && (
                <label style={{ display: "grid", gap: 2, fontSize: 11, color: "var(--muted)" }}>% תוספת / הנחה
                  <input className="input" dir="ltr" type="number" inputMode="decimal" step="any" value={l.line_pct} onChange={e => edit(l.key, { line_pct: e.target.value as any })} style={{ width: 80, height: 38, color: Number(l.line_pct) < 0 ? "var(--red)" : Number(l.line_pct) > 0 ? "var(--green)" : undefined }} />
                </label>
              )}
              <div style={{ fontSize: 12, color: "var(--muted)", paddingBottom: 8 }}>
                {canPrice && Number(l.line_pct) !== 0 && <><span style={{ textDecoration: "line-through" }}>{money(l.base_price)}</span>{" → "}</>}
                {money(unitFinal(l))} ליח׳
              </div>
              <div style={{ marginInlineStart: "auto", fontWeight: 800, fontSize: 15, paddingBottom: 8 }}>{money(lineTotal(l))}</div>
            </div>
          </div>
        ))}
      </div>

      {canPrice && (adding || lines.length === 0
        ? <div style={{ marginTop: 10 }}><ItemSearch items={listItems} onPick={addItem} autoFocus={adding} /></div>
        : <button type="button" className="btn btn-outline" style={{ marginTop: 10, width: "100%", minHeight: 46, fontSize: 15 }} onClick={() => setAdding(true)}>+ הוסף סעיף</button>)}

      {lines.length > 0 && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "var(--tint-blue)", display: "grid", gap: 4, fontSize: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>סה״כ לפני מע״מ</span><b>{money(subtotal)}</b></div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}><span>מע״מ {VAT_PCT}%</span><span>{money(r2(subtotal * VAT_PCT / 100))}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16 }}><span>סה״כ כולל מע״מ</span><b>{money(r2(subtotal * (1 + VAT_PCT / 100)))}</b></div>
        </div>
      )}

      {canPrice && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-outline" style={{ flex: 1, minHeight: 46 }} disabled={saving || !dirty} onClick={() => save(false)}>{saving ? "שומר..." : "שמור טיוטה"}</button>
          <button type="button" className="btn btn-primary" style={{ flex: 1, minHeight: 46 }} disabled={saving || lines.length === 0} onClick={() => save(true)}>סיום תמחור</button>
        </div>
      )}
      {workLog.priced_at && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>תומחר ע״י {workLog.priced_by || "-"} · {new Date(workLog.priced_at).toLocaleDateString("he-IL")}</div>}
    </div>
  );
}

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
