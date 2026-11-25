"use client";
// הצעות מחיר לפי מחירון (נ.ג.ש מור)
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { check, notify } from "./ngs-ui";
import { loadPriceData, PricedLinesEditor, PRICING_CSS, VAT_PCT, lineTotal, unitFinal, money, r2, esc, type PriceList, type PriceItem, type PricedLine } from "./ngs-pricing";

const COMPANY = "נ.ג.ש מור הנדסה בע״מ";
const fmtSerial = (n: any) => String(n ?? "").padStart(4, "0");
const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const fmtDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString("he-IL") : "-");

type Quote = {
  id?: string; serial_number?: number; quote_date: string; client_name: string; site: string; subject: string;
  price_list_id: string | null; discount_pct: number; terms: string; created_by?: string;
};

export function quoteTotals(lines: { qty: number; base_price: number; line_pct: number }[], discountPct: number) {
  const sub = r2(lines.reduce((s, l) => s + lineTotal(l), 0));
  const disc = r2(sub * (Number(discountPct) || 0) / 100);
  const net = r2(sub - disc);
  const vat = r2(net * VAT_PCT / 100);
  return { sub, disc, net, vat, total: r2(net + vat) };
}

async function loadTerms(supabase: any): Promise<string> {
  const r = await supabase.from("ngs_settings").select("value").eq("key", "quote_terms").maybeSingle();
  return r.data?.value || "";
}

// ---- לשונית הצעות מחיר ----
export function QuotesTab({ supabase, clients, userName }: { supabase: any; clients: any[]; userName: string }) {
  const [quotes, setQuotes] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Quote | null>(null);

  async function load() {
    const r = await supabase.from("ngs_quotes").select("*, ngs_quote_lines(qty,base_price,line_pct)").order("serial_number", { ascending: false });
    if (r.error) { notify("שגיאה בטעינת הצעות: " + r.error.message, "error"); setQuotes([]); return; }
    setQuotes(r.data || []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function newQuote() {
    const terms = await loadTerms(supabase);
    setEditing({ quote_date: todayISO(), client_name: "", site: "", subject: "", price_list_id: null, discount_pct: 0, terms });
  }

  const shown = useMemo(() => {
    const all = quotes || [];
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return all;
    return all.filter(x => { const hay = `${fmtSerial(x.serial_number)} ${x.client_name || ""} ${x.site || ""} ${x.subject || ""}`.toLowerCase(); return words.every(w => hay.includes(w)); });
  }, [quotes, q]);

  return (
    <div className="card" style={{ padding: 16 }}>
      {PRICING_CSS}{QUOTES_CSS}
      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>הצעות מחיר</div>
        <button className="btn btn-primary" style={{ minHeight: 44 }} onClick={newQuote}>+ הצעה חדשה</button>
      </div>
      <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="חיפוש לפי לקוח, נושא או מספר הצעה" />
      {!quotes ? <div style={{ padding: 16, color: "var(--muted)" }}>טוען...</div>
        : shown.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>{quotes.length ? "לא נמצאו הצעות" : "אין עדיין הצעות מחיר"}</div>
        : <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
            {shown.map(x => {
              const t = quoteTotals((x.ngs_quote_lines || []).map((l: any) => ({ qty: Number(l.qty), base_price: Number(l.base_price), line_pct: Number(l.line_pct) })), Number(x.discount_pct));
              return (
                <button key={x.id} type="button" className="ngs-q-row" onClick={() => setEditing({ ...x, site: x.site || "", subject: x.subject || "", client_name: x.client_name || "", terms: x.terms || "", discount_pct: Number(x.discount_pct) })}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <b>#{fmtSerial(x.serial_number)} · {x.client_name || "ללא לקוח"}</b>
                    <b style={{ whiteSpace: "nowrap" }}>{money(t.total)}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                    <span className="ngs-clamp1">{[x.subject, x.site].filter(Boolean).join(" · ") || "-"}</span>
                    <span style={{ whiteSpace: "nowrap" }}>{fmtDate(x.quote_date)} · {(x.ngs_quote_lines || []).length} סעיפים</span>
                  </div>
                </button>
              );
            })}
          </div>}
      {editing && <QuoteEditor supabase={supabase} initial={editing} clients={clients} userName={userName} onClose={() => setEditing(null)} onSaved={load} />}
    </div>
  );
}

// ---- עורך הצעת מחיר (מסך מלא) ----
function QuoteEditor({ supabase, initial, clients, userName, onClose, onSaved }: {
  supabase: any; initial: Quote; clients: any[]; userName: string; onClose: () => void; onSaved: () => void;
}) {
  const [quote, setQuote] = useState<Quote>(initial);
  const [data, setData] = useState<{ lists: PriceList[]; items: PriceItem[] } | null>(null);
  const [lines, setLines] = useState<PricedLine[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const clientNames = clients.map(c => c.name);
  const [otherClient, setOtherClient] = useState(!!initial.client_name && !clientNames.includes(initial.client_name));

  useEffect(() => {
    let alive = true;
    (async () => {
      const [d, res] = await Promise.all([
        loadPriceData(supabase),
        initial.id ? supabase.from("ngs_quote_lines").select("*").eq("quote_id", initial.id).order("sort_order") : Promise.resolve({ data: [] }),
      ]);
      if (!alive) return;
      setData(d);
      setQuote(qq => qq.price_list_id || !d.lists.length ? qq : { ...qq, price_list_id: d.lists[0].id });
      setLines((res.data || []).map((l: any) => ({ key: l.id, price_item_id: l.price_item_id, code: l.code, description: l.description, unit: l.unit, qty: Number(l.qty), base_price: Number(l.base_price), line_pct: Number(l.line_pct) })));
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // נעילת גלילה מאחור + התאמת גובה לאזור הנראה מעל המקלדת
  const pzRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const vv = window.visualViewport;
    const fit = () => { const el = pzRef.current; if (!el || !vv) return; el.style.top = vv.offsetTop + "px"; el.style.height = vv.height + "px"; };
    fit();
    vv?.addEventListener("resize", fit); vv?.addEventListener("scroll", fit);
    return () => { document.body.style.overflow = prev; vv?.removeEventListener("resize", fit); vv?.removeEventListener("scroll", fit); };
  }, []);

  const set = (patch: Partial<Quote>) => { setQuote(qq => ({ ...qq, ...patch })); setDirty(true); };
  const setLinesDirty = (fn: (ls: PricedLine[]) => PricedLine[]) => { setLines(fn); setDirty(true); };
  const listItems = useMemo(() => (data?.items || []).filter(i => i.price_list_id === quote.price_list_id), [data, quote.price_list_id]);
  const t = quoteTotals(lines, quote.discount_pct);

  async function save(): Promise<Quote | null> {
    (document.activeElement as HTMLElement | null)?.blur?.();
    setSaving(true);
    try {
      const row = {
        quote_date: quote.quote_date || todayISO(), client_name: quote.client_name.trim() || null, site: quote.site.trim() || null, subject: quote.subject.trim() || null,
        price_list_id: quote.price_list_id, discount_pct: Number(quote.discount_pct) || 0, terms: quote.terms, updated_at: new Date().toISOString(),
      };
      let saved: any;
      if (quote.id) {
        const r = await supabase.from("ngs_quotes").update(row).eq("id", quote.id).select().single();
        if (!check(r)) return null; saved = r.data;
      } else {
        const r = await supabase.from("ngs_quotes").insert({ ...row, created_by: userName }).select().single();
        if (!check(r)) return null; saved = r.data;
      }
      const del = await supabase.from("ngs_quote_lines").delete().eq("quote_id", saved.id);
      if (!check(del)) return null;
      if (lines.length) {
        const ins = await supabase.from("ngs_quote_lines").insert(lines.map((l, idx) => ({
          quote_id: saved.id, price_item_id: l.price_item_id, code: l.code, description: l.description, unit: l.unit,
          qty: Number(l.qty) || 0, base_price: Number(l.base_price) || 0, line_pct: Number(l.line_pct) || 0, sort_order: idx,
        })));
        if (!check(ins)) return null;
      }
      const next = { ...quote, id: saved.id, serial_number: saved.serial_number };
      setQuote(next); setDirty(false); onSaved();
      notify(`הצעה #${fmtSerial(saved.serial_number)} נשמרה`);
      return next;
    } catch (e: any) {
      notify("שגיאה בשמירה: " + (e?.message || "בדוק חיבור לאינטרנט"), "error"); return null;
    } finally { setSaving(false); }
  }

  async function saveAndPrint() {
    if (!lines.length) return notify("עוד לא נבחרו סעיפים", "error");
    const win = window.open("", "_blank"); // נפתח מיד כדי שהדפדפן לא יחסום
    if (!win) return notify("הדפדפן חסם את חלון ההדפסה", "error");
    win.document.write(`<html dir="rtl"><head><title>טוען...</title></head><body style="font-family:Arial">טוען...</body></html>`);
    const saved = dirty || !quote.id ? await save() : quote;
    if (!saved) { win.close(); return; }
    writeQuoteHtml(win, saved, lines, clients.find(c => c.name === saved.client_name));
  }

  async function remove() {
    if (!quote.id) { onClose(); return; }
    if (!window.confirm(`למחוק את הצעה #${fmtSerial(quote.serial_number)}? אי אפשר לשחזר.`)) return;
    if (!check(await supabase.from("ngs_quotes").delete().eq("id", quote.id), "ההצעה נמחקה")) return;
    onSaved(); onClose();
  }

  function duplicate() {
    if (dirty && !window.confirm("יש שינויים שלא נשמרו בהצעה הנוכחית. לשכפל בכל זאת?")) return;
    setQuote(qq => ({ ...qq, id: undefined, serial_number: undefined, quote_date: todayISO() }));
    setLines(ls => ls.map((l, i) => ({ ...l, key: `dup${Date.now()}_${i}` })));
    setDirty(true);
    notify("נוצר עותק – בחר לקוח, ערוך ושמור");
  }

  async function saveTermsAsDefault() {
    if (!window.confirm("לשמור את הנוסח הזה כברירת מחדל לכל ההצעות החדשות?")) return;
    check(await supabase.from("ngs_settings").upsert({ key: "quote_terms", value: quote.terms, updated_at: new Date().toISOString() }), "נשמר כברירת מחדל");
  }

  const breakdown = (
    <div style={{ display: "grid", gap: 2, fontSize: 14 }}>
      <div className="ngs-q-tl"><span>סה״כ</span><b>{money(t.sub)}</b></div>
      {t.disc > 0 && <div className="ngs-q-tl" style={{ color: "var(--red)" }}><span>הנחה {quote.discount_pct}%</span><span>-{money(t.disc)}</span></div>}
      {t.disc > 0 && <div className="ngs-q-tl"><span>סה״כ אחרי הנחה</span><b>{money(t.net)}</b></div>}
      <div className="ngs-q-tl" style={{ color: "var(--muted)", fontSize: 13 }}><span>מע״מ {VAT_PCT}%</span><span>{money(t.vat)}</span></div>
      <div className="ngs-q-tl" style={{ fontSize: 16 }}><span>סה״כ כולל מע״מ</span><b>{money(t.total)}</b></div>
    </div>
  );

  return createPortal(
    <div className="ngs-pz" ref={pzRef} role="dialog" aria-label="הצעת מחיר">
      {PRICING_CSS}{QUOTES_CSS}
      <div className="ngs-pz-head">
        <button type="button" className="btn btn-outline" style={{ minHeight: 40 }} onClick={() => { if (!dirty || window.confirm("יש שינויים שלא נשמרו. לסגור בלי לשמור?")) onClose(); }}>✕ סגור</button>
        <div style={{ fontWeight: 800, fontSize: 15, flex: 1, textAlign: "center", whiteSpace: "nowrap" }}>{quote.serial_number ? `הצעה #${fmtSerial(quote.serial_number)}` : "הצעת מחיר חדשה"}</div>
        {data && data.lists.length > 1 ? (
          <select className="input" style={{ width: "auto", maxWidth: 190, height: 40 }} value={quote.price_list_id || ""} onChange={e => set({ price_list_id: e.target.value })}>
            {data.lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        ) : <span />}
      </div>

      <div className="ngs-pz-body ngs-q-body">
        <section className="ngs-pz-items ngs-q-items">
          {/* פרטי ההצעה */}
          <div className="ngs-pz-line ngs-q-details">
            <label>לקוח
              {!otherClient ? (
                <select className="input" value={quote.client_name} onChange={e => { if (e.target.value === "__other") { setOtherClient(true); set({ client_name: "" }); } else set({ client_name: e.target.value }); }}>
                  <option value="">בחר לקוח</option>
                  {clientNames.map(n => <option key={n} value={n}>{n}</option>)}
                  <option value="__other">לקוח אחר (הקלדה)</option>
                </select>
              ) : (
                <span style={{ display: "flex", gap: 6 }}>
                  <input className="input" value={quote.client_name} onChange={e => set({ client_name: e.target.value })} placeholder="שם הלקוח" />
                  <button type="button" className="btn btn-outline" style={{ whiteSpace: "nowrap" }} onClick={() => { setOtherClient(false); set({ client_name: "" }); }}>מהרשימה</button>
                </span>
              )}
            </label>
            <label>תאריך<input className="input" type="date" value={quote.quote_date} onChange={e => set({ quote_date: e.target.value })} /></label>
            <label>סניף / אתר<input className="input" value={quote.site} onChange={e => set({ site: e.target.value })} placeholder="למשל: סניף הרצליה" /></label>
            <label>הנדון<input className="input" value={quote.subject} onChange={e => set({ subject: e.target.value })} placeholder="למשל: צביעת סניף והחלפת שקעים" /></label>
          </div>

          <div style={{ fontWeight: 800, fontSize: 14, marginTop: 4 }}>סעיפים{lines.length > 0 && <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 13 }}> · {lines.length}</span>}</div>
          {data && data.lists.length === 0 && <div style={{ color: "var(--red)", fontSize: 13 }}>אין עדיין מחירון במערכת.</div>}
          {data ? <PricedLinesEditor lines={lines} setLines={setLinesDirty} items={listItems} /> : <div style={{ color: "var(--muted)", fontSize: 13 }}>טוען מחירון...</div>}

          {/* הנחה כללית, סיכום ותנאים */}
          <div className="ngs-pz-line" style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700 }}>הנחה כללית (מוצגת ללקוח) %
              <input className="input" dir="ltr" type="number" inputMode="decimal" min="0" max="100" step="any" value={quote.discount_pct} onFocus={e => e.target.select()} onChange={e => set({ discount_pct: e.target.value as any })} style={{ width: 80, height: 38 }} />
            </label>
            {breakdown}
          </div>
          <div className="ngs-pz-line" style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <b style={{ fontSize: 14 }}>הערות ותנאים</b>
              <button type="button" className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }} onClick={saveTermsAsDefault}>שמור כברירת מחדל</button>
            </div>
            <textarea className="input" rows={5} value={quote.terms} onChange={e => set({ terms: e.target.value })} style={{ height: "auto", lineHeight: 1.5, resize: "vertical" }} />
          </div>
          {quote.id && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-outline" onClick={duplicate}>שכפל להצעה חדשה</button>
              <button type="button" className="btn btn-outline" style={{ color: "var(--red)" }} onClick={remove}>מחק הצעה</button>
            </div>
          )}
        </section>
      </div>

      <div className="ngs-pz-foot">
        <button type="button" onClick={() => setShowBreakdown(s => !s)} style={{ all: "unset", cursor: "pointer", flex: "1 1 200px", fontSize: 15 }}>
          {showBreakdown ? breakdown : <span>סה״כ כולל מע״מ: <b>{money(t.total)}</b> <span style={{ color: "var(--muted)", fontSize: 12 }}>▾ פירוט</span></span>}
        </button>
        <div style={{ display: "flex", gap: 8, flex: "1 1 260px" }}>
          <button type="button" className="btn btn-outline" style={{ flex: 1, minHeight: 48 }} disabled={saving} onPointerDown={e => e.preventDefault()} onClick={() => save()}>{saving ? "שומר..." : dirty || !quote.id ? "שמור" : "נשמר ✓"}</button>
          <button type="button" className="btn btn-primary" style={{ flex: 1, minHeight: 48 }} disabled={saving} onPointerDown={e => e.preventDefault()} onClick={saveAndPrint}>הדפסה / PDF</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---- הדפסת הצעת מחיר (מחיר יחידה כולל את התוספת השקטה; ההנחה הכללית מוצגת) ----
function writeQuoteHtml(win: Window, q: Quote, lines: PricedLine[], client: any) {
  const t = quoteTotals(lines, q.discount_pct);
  const logo = `${window.location.origin}/ngs-logo.png`;
  const serial = fmtSerial(q.serial_number);
  let h = `<!doctype html><html dir="rtl" lang="he"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>הצעת מחיר ${serial}${q.client_name ? " - " + esc(q.client_name) : ""}</title><style>
    @page{size:A4;margin:14mm 12mm}
    *{box-sizing:border-box}body{font-family:Arial,"Segoe UI",sans-serif;margin:0;padding:24px;direction:rtl;color:#1e293b;font-size:13px}
    .page{max-width:800px;margin:0 auto}
    .top{display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:3px solid #1e3a8a;padding-bottom:12px}
    .brand{display:flex;align-items:center;gap:14px}.brand img{height:78px}.brand .name{font-size:20px;font-weight:800;color:#1e3a8a}
    .meta{text-align:left;font-size:13px;line-height:1.7}.meta .title{font-size:22px;font-weight:800;color:#1e3a8a}
    .to{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin:16px 0 6px;font-size:14px;line-height:1.6}
    .subject{font-size:15px;font-weight:700;margin:8px 0 12px}
    table{width:100%;border-collapse:collapse;font-size:12.5px}th{background:#1e3a8a;color:#fff;font-weight:700}
    td,th{border:1px solid #cbd5e1;padding:7px 8px;text-align:right;vertical-align:top}tbody tr:nth-child(even) td{background:#f8fafc}
    .num{white-space:nowrap;text-align:left;direction:ltr}.code{white-space:nowrap;direction:ltr;text-align:right;color:#475569}
    .totals{margin-top:10px;margin-right:auto;width:300px;border-collapse:collapse}.totals td{border:none;border-bottom:1px solid #e2e8f0;padding:6px 8px;background:none!important}
    .totals .grand td{font-size:15px;font-weight:800;border-top:2px solid #1e3a8a;border-bottom:none;color:#1e3a8a}.totals .disc td{color:#b91c1c}
    .terms{margin-top:22px;white-space:pre-wrap;line-height:1.7;font-size:12.5px;border-top:1px solid #e2e8f0;padding-top:10px}
    .sign{display:flex;justify-content:space-between;gap:30px;margin-top:40px;font-size:13px}.sign div{flex:1}.line{border-bottom:1px solid #64748b;height:28px;margin-top:6px}
    .bar{position:sticky;top:0;background:#fff;padding:8px 0 12px;text-align:center}.bar button{font-size:16px;padding:10px 22px;border-radius:10px;border:none;background:#1e3a8a;color:#fff;cursor:pointer}
    thead{display:table-header-group}tr{page-break-inside:avoid}
    @media print{body{padding:0}.bar{display:none}th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    @media (max-width:600px){body{padding:12px}.top{flex-direction:column;align-items:flex-start}.meta{text-align:right}.to{grid-template-columns:1fr}.totals{width:100%}}
  </style></head><body><div class="page">`;
  h += `<div class="bar"><button onclick="window.print()">הדפסה / שמירה כ-PDF</button></div>`;
  h += `<div class="top"><div class="brand"><img src="${logo}" alt=""/><div class="name">${COMPANY}</div></div>`;
  h += `<div class="meta"><div class="title">הצעת מחיר</div><div>מס׳ ${serial}</div><div>תאריך: ${esc(fmtDate(q.quote_date))}</div></div></div>`;
  h += `<div class="to"><div><b>לכבוד:</b> ${esc(q.client_name || "-")}</div>`;
  if (q.site) h += `<div><b>סניף / אתר:</b> ${esc(q.site)}</div>`;
  if (client?.address) h += `<div><b>כתובת:</b> ${esc(client.address)}</div>`;
  if (client?.phone) h += `<div><b>טלפון:</b> ${esc(client.phone)}</div>`;
  h += `</div>`;
  if (q.subject) h += `<div class="subject">הנדון: ${esc(q.subject)}</div>`;
  h += `<table><thead><tr><th style="width:28px">#</th><th style="width:80px">סעיף</th><th>תיאור</th><th style="width:50px">יח׳</th><th style="width:55px">כמות</th><th style="width:85px">מחיר יח׳</th><th style="width:95px">סה״כ</th></tr></thead><tbody>`;
  lines.forEach((l, i) => {
    h += `<tr><td>${i + 1}</td><td class="code">${esc(l.code)}</td><td>${esc(l.description)}</td><td>${esc(l.unit)}</td><td class="num">${Number(l.qty)}</td><td class="num">${money(unitFinal(l))}</td><td class="num">${money(lineTotal(l))}</td></tr>`;
  });
  h += `</tbody></table><table class="totals"><tbody>`;
  h += `<tr><td>סה״כ</td><td class="num">${money(t.sub)}</td></tr>`;
  if (t.disc > 0) h += `<tr class="disc"><td>הנחה ${Number(q.discount_pct)}%</td><td class="num">-${money(t.disc)}</td></tr><tr><td>סה״כ אחרי הנחה</td><td class="num">${money(t.net)}</td></tr>`;
  h += `<tr><td>מע״מ ${VAT_PCT}%</td><td class="num">${money(t.vat)}</td></tr>`;
  h += `<tr class="grand"><td>סה״כ לתשלום כולל מע״מ</td><td class="num">${money(t.total)}</td></tr></tbody></table>`;
  if (q.terms?.trim()) h += `<div class="terms"><b>הערות ותנאים:</b>\n${esc(q.terms.trim())}</div>`;
  h += `<div class="sign"><div>בכבוד רב,<br/><b>${COMPANY}</b></div><div>אישור הלקוח (שם, חתימה ותאריך):<div class="line"></div></div></div>`;
  h += `</div></body></html>`;
  win.document.open(); win.document.write(h); win.document.close();
}

const QUOTES_CSS = (
  <style>{`
    .ngs-q-row{display:grid;gap:4px;width:100%;text-align:right;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--surface-2);color:var(--text);cursor:pointer;font-size:14px}
    .ngs-q-body{display:flex !important;flex-direction:column}
    .ngs-q-items{flex:1;min-height:0;width:100%;max-width:900px;margin:0 auto}
    .ngs-q-details{display:grid;grid-template-columns:1fr 1fr;gap:10px;background:var(--card)}
    .ngs-q-details label{display:grid;gap:4px;font-size:12px;color:var(--muted);font-weight:700}
    .ngs-q-tl{display:flex;justify-content:space-between;gap:12px}
    @media (max-width: 800px){ .ngs-q-details{grid-template-columns:1fr} }
  `}</style>
);
