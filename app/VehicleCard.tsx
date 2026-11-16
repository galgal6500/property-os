"use client";
// כרטיס רכב: ליסינג, קילומטראז' חודשי, אוריאה חודשית, דוחות נזק והיסטוריית טיפולים
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Icon } from "./icons";
import { check, notify, uploadPhotos, PendingPhotos } from "./ngs-ui";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------- עזרים ----------
export function monthISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function monthLabel(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("he-IL", { month: "long", year: "numeric" });
}
function fmtNum(n: number | null | undefined) {
  return n == null ? "-" : Math.round(n).toLocaleString("he-IL");
}
function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function nowLocalInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

// מצב מכסת הק"מ: כמה נסע מתחילת הליסינג, וצפי לשנה
export function kmStatus(v: any, latestKm: number | null) {
  if (latestKm == null || !v?.km_quota_yearly || !v?.lease_start || v?.km_start == null) return null;
  const days = Math.max(1, daysBetween(new Date(v.lease_start + "T00:00:00"), new Date()));
  const driven = latestKm - Number(v.km_start);
  const allowedSoFar = (Number(v.km_quota_yearly) / 365) * days;
  const projected = days >= 14 ? (driven / days) * 365 : null;
  const ratio = projected != null ? projected / Number(v.km_quota_yearly) : driven / Math.max(1, allowedSoFar);
  const level: "ok" | "warn" | "danger" = ratio > 1.05 ? "danger" : ratio > 0.95 ? "warn" : "ok";
  return { driven, allowedSoFar, projected, level, quota: Number(v.km_quota_yearly) };
}

const LEVEL_STYLE: Record<string, { bg: string; line: string; text: string }> = {
  ok: { bg: "var(--tint-green)", line: "var(--tint-green-line)", text: "בתוך המכסה" },
  warn: { bg: "var(--tint-amber)", line: "var(--tint-amber-line)", text: "מתקרב לחריגה" },
  danger: { bg: "var(--tint-red)", line: "var(--tint-red-line)", text: "צפי לחריגה!" },
};

// ---------- תזכורות לעובד (מופיעות בראש המסך עד שממלאים) ----------
export function VehicleReminders({ vehicles, onOpen }: { vehicles: any[]; onOpen: (vehicle: any, tab: string) => void }) {
  const [missing, setMissing] = useState<{ v: any; km: boolean; urea: boolean }[]>([]);
  const month = monthISO();

  async function load() {
    if (!vehicles.length) { setMissing([]); return; }
    const ids = vehicles.map(v => v.id);
    const [m, u] = await Promise.all([
      supabase.from("ngs_vehicle_mileage").select("vehicle_id").eq("month", month).in("vehicle_id", ids),
      supabase.from("ngs_vehicle_urea").select("vehicle_id").eq("month", month).in("vehicle_id", ids),
    ]);
    const kmDone = new Set((m.data || []).map((r: any) => r.vehicle_id));
    const ureaDone = new Set((u.data || []).map((r: any) => r.vehicle_id));
    setMissing(vehicles
      .map(v => ({ v, km: !kmDone.has(v.id), urea: !!v.urea_required && !ureaDone.has(v.id) }))
      .filter(x => x.km || x.urea));
  }
  useEffect(() => { load(); }, [vehicles.map(v => v.id).join(",")]);
  useEffect(() => {
    const h = () => load();
    window.addEventListener("ngs-vehicle-updated", h);
    return () => window.removeEventListener("ngs-vehicle-updated", h);
  });

  if (!missing.length) return null;
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {missing.map(({ v, km, urea }) => (
        <div key={v.id} style={{ display: "grid", gap: 8 }}>
          {km && (
            <button onClick={() => onOpen(v, "km")} className="vc-nag" style={nagStyle("var(--tint-red)", "var(--tint-red-line)")}>
              <Icon name="vehicles" size={22} />
              <span style={{ display: "grid", gap: 2, textAlign: "right", flex: 1 }}>
                <b>חובה לדווח קילומטראז' לחודש {monthLabel(month)}</b>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>רכב {v.license_plate} · לחץ כדי לדווח</span>
              </span>
            </button>
          )}
          {urea && (
            <button onClick={() => onOpen(v, "urea")} className="vc-nag" style={nagStyle("var(--tint-amber)", "var(--tint-amber-line)")}>
              <Icon name="alert" size={22} />
              <span style={{ display: "grid", gap: 2, textAlign: "right", flex: 1 }}>
                <b>תזכורת: למלא אוריאה (AdBlue) החודש</b>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>רכב {v.license_plate} · ההודעה תופיע עד שתסמן שמילאת</span>
              </span>
            </button>
          )}
        </div>
      ))}
      <style>{`.vc-nag{animation:vcPulse 2.2s ease-in-out infinite}@keyframes vcPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.01)}}`}</style>
    </div>
  );
}
function nagStyle(bg: string, line: string): React.CSSProperties {
  return { display: "flex", alignItems: "center", gap: 12, background: bg, border: `2px solid ${line}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", fontFamily: "inherit", color: "var(--text)", width: "100%" };
}

// ---------- תגיות מצב חודשי לרשימת הרכבים (למנהל) ----------
export function VehicleMonthBadges({ vehicle }: { vehicle: any }) {
  const [state, setState] = useState<{ km: boolean; urea: boolean; openDamage: number } | null>(null);
  useEffect(() => {
    const month = monthISO();
    Promise.all([
      supabase.from("ngs_vehicle_mileage").select("id").eq("vehicle_id", vehicle.id).eq("month", month),
      supabase.from("ngs_vehicle_urea").select("id").eq("vehicle_id", vehicle.id).eq("month", month),
      supabase.from("ngs_vehicle_damage").select("id").eq("vehicle_id", vehicle.id).eq("status", "פתוח"),
    ]).then(([m, u, d]) => setState({ km: !!m.data?.length, urea: !!u.data?.length, openDamage: d.data?.length || 0 }));
  }, [vehicle.id]);
  if (!state) return null;
  const chip = (ok: boolean, okText: string, badText: string) => (
    <span className={ok ? "badge badge-success" : "badge badge-danger"}>{ok ? okText : badText}</span>
  );
  return (
    <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
      {chip(state.km, "ק\"מ דווח", "ק\"מ לא דווח")}
      {vehicle.urea_required && chip(state.urea, "אוריאה מולאה", "אוריאה לא מולאה")}
      {state.openDamage > 0 && <span className="badge badge-urgent">{state.openDamage} דוח נזק פתוח</span>}
    </span>
  );
}

// ---------- כרטיס הרכב ----------
export function VehicleCardModal({ vehicle, isAdmin, reporterName, initialTab = "overview", onClose, onOpenServices, onSaved }: {
  vehicle: any; isAdmin: boolean; reporterName: string; initialTab?: string;
  onClose: () => void; onOpenServices: () => void; onSaved: () => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [v, setV] = useState<any>(vehicle);
  const [mileage, setMileage] = useState<any[]>([]);
  const [urea, setUrea] = useState<any[]>([]);
  const [damage, setDamage] = useState<any[]>([]);
  const month = monthISO();

  async function load() {
    const [m, u, d] = await Promise.all([
      supabase.from("ngs_vehicle_mileage").select("*").eq("vehicle_id", v.id).order("month", { ascending: false }),
      supabase.from("ngs_vehicle_urea").select("*").eq("vehicle_id", v.id).order("month", { ascending: false }),
      supabase.from("ngs_vehicle_damage").select("*").eq("vehicle_id", v.id).order("occurred_at", { ascending: false }),
    ]);
    setMileage(m.data || []); setUrea(u.data || []); setDamage(d.data || []);
  }
  useEffect(() => { load(); }, [v.id]);
  function changed() { load(); onSaved(); window.dispatchEvent(new Event("ngs-vehicle-updated")); }

  const latestKm = mileage.length ? Math.max(...mileage.map(r => Number(r.km))) : null;
  const status = kmStatus(v, latestKm);
  const tabs = [
    { key: "overview", label: "סקירה" },
    { key: "km", label: "קילומטראז'" },
    ...(v.urea_required ? [{ key: "urea", label: "אוריאה" }] : []),
    { key: "damage", label: "דוח נזק" },
    { key: "services", label: "טיפולים" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "var(--card)", borderRadius: 20, width: "100%", maxWidth: 720, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 12px", borderBottom: "1px solid var(--surface-3)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 900 }}>כרטיס רכב — {v.license_plate}</h3>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{v.model || "-"}{v.year ? ` · ${v.year}` : ""}{v.driver ? ` · נהג: ${v.driver}` : ""}</div>
          </div>
          <button onClick={onClose} aria-label="סגור" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 26, color: "var(--muted)" }}>×</button>
        </div>
        <div style={{ display: "flex", gap: 6, padding: "10px 16px", borderBottom: "1px solid var(--line)", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.key} className={tab === t.key ? "btn btn-primary" : "btn btn-outline"} style={{ fontSize: 13, whiteSpace: "nowrap" }}
              onClick={() => (t.key === "services" ? onOpenServices() : setTab(t.key))}>{t.label}</button>
          ))}
        </div>
        <div style={{ padding: 18, overflowY: "auto", display: "grid", gap: 14 }}>
          {tab === "overview" && <OverviewTab v={v} setV={setV} isAdmin={isAdmin} status={status} latestKm={latestKm} mileage={mileage} urea={urea} damage={damage} month={month} onSaved={changed} />}
          {tab === "km" && <KmTab v={v} mileage={mileage} month={month} reporterName={reporterName} isAdmin={isAdmin} onSaved={changed} />}
          {tab === "urea" && <UreaTab v={v} urea={urea} month={month} reporterName={reporterName} onSaved={changed} />}
          {tab === "damage" && <DamageTab v={v} damage={damage} reporterName={reporterName} isAdmin={isAdmin} onSaved={changed} />}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 2 }}>
      <div style={{ fontSize: 11, color: "var(--muted-2)" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

// ---------- סקירה + פרטי ליסינג ----------
function OverviewTab({ v, setV, isAdmin, status, latestKm, mileage, urea, damage, month, onSaved }: any) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const kmThisMonth = mileage.some((r: any) => r.month === month);
  const ureaThisMonth = urea.some((r: any) => r.month === month);
  const openDamage = damage.filter((d: any) => d.status === "פתוח").length;
  const leaseDaysLeft = v.lease_end ? daysBetween(new Date(), new Date(v.lease_end + "T00:00:00")) : null;

  function startEdit() {
    setForm({
      lease_company: v.lease_company || "", lease_monthly: v.lease_monthly ?? "", lease_start: v.lease_start || "", lease_end: v.lease_end || "",
      km_quota_yearly: v.km_quota_yearly ?? "", km_start: v.km_start ?? "", urea_required: !!v.urea_required, service_interval_km: v.service_interval_km ?? 12000,
    });
    setEdit(true);
  }
  async function save() {
    setSaving(true);
    const payload = {
      lease_company: form.lease_company || null,
      lease_monthly: form.lease_monthly === "" ? null : Number(form.lease_monthly),
      lease_start: form.lease_start || null, lease_end: form.lease_end || null,
      km_quota_yearly: form.km_quota_yearly === "" ? null : Number(form.km_quota_yearly),
      km_start: form.km_start === "" ? null : Number(form.km_start),
      urea_required: !!form.urea_required,
      service_interval_km: Number(form.service_interval_km) || 12000,
    };
    const res = await supabase.from("ngs_vehicles").update(payload).eq("id", v.id);
    if (check(res, "פרטי הליסינג נשמרו")) { setV({ ...v, ...payload }); setEdit(false); onSaved(); }
    setSaving(false);
  }
  const f = (k: string, label: string, type = "text") => (
    <div className="field"><label>{label}</label><input className="input" type={type} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <StatusBox ok={kmThisMonth} okText="קילומטראז' החודש דווח" badText="קילומטראז' החודש לא דווח" />
        {v.urea_required && <StatusBox ok={ureaThisMonth} okText="אוריאה מולאה החודש" badText="אוריאה לא מולאה החודש" />}
        <StatusBox ok={openDamage === 0} okText="אין דוחות נזק פתוחים" badText={`${openDamage} דוחות נזק פתוחים`} />
      </div>

      <div style={{ background: "var(--surface-2)", borderRadius: 16, padding: 16, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <b>קילומטראז'</b>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
          <Row label="מד אחרון שדווח" value={latestKm != null ? `${fmtNum(latestKm)} ק"מ` : "-"} />
          {status && <Row label="נסע מתחילת הליסינג" value={`${fmtNum(status.driven)} ק"מ`} />}
          {status && <Row label="מותר עד היום" value={`${fmtNum(status.allowedSoFar)} ק"מ`} />}
          {status?.projected != null && <Row label="צפי שנתי" value={`${fmtNum(status.projected)} / ${fmtNum(status.quota)}`} />}
          {latestKm != null && (() => { const iv = Number(v.service_interval_km) || 12000; const next = (Math.floor(latestKm / iv) + 1) * iv; return <Row label="טיפול הבא" value={`ב-${fmtNum(next)} ק"מ (עוד ${fmtNum(next - latestKm)})`} />; })()}
        </div>
        {status && (
          <div style={{ background: LEVEL_STYLE[status.level].bg, border: `1px solid ${LEVEL_STYLE[status.level].line}`, borderRadius: 12, padding: "10px 12px", fontWeight: 700 }}>
            {LEVEL_STYLE[status.level].text}
            {status.level !== "ok" && status.projected != null && ` — לפי הקצב הנוכחי תעבור את המכסה בכ-${fmtNum(status.projected - status.quota)} ק"מ בשנה`}
          </div>
        )}
        {!status && isAdmin && <div style={{ fontSize: 13, color: "var(--muted)" }}>כדי לקבל התראת חריגה, מלא בפרטי הליסינג: תאריך התחלה, מד בתחילת הליסינג ומכסה שנתית.</div>}
      </div>

      {isAdmin && (
        <div style={{ background: "var(--surface-2)", borderRadius: 16, padding: 16, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b>פרטי ליסינג</b>
            {!edit && <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={startEdit}>עריכה</button>}
          </div>
          {!edit ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
              <Row label="חברת ליסינג" value={v.lease_company || "-"} />
              <Row label="עלות חודשית" value={v.lease_monthly != null ? `${fmtNum(v.lease_monthly)} ₪` : "-"} />
              <Row label="תחילת חוזה" value={v.lease_start ? new Date(v.lease_start).toLocaleDateString("he-IL") : "-"} />
              <Row label="סיום חוזה" value={v.lease_end ? `${new Date(v.lease_end).toLocaleDateString("he-IL")}${leaseDaysLeft != null && leaseDaysLeft <= 90 ? ` (עוד ${leaseDaysLeft} ימים)` : ""}` : "-"} />
              <Row label="מכסה שנתית" value={v.km_quota_yearly ? `${fmtNum(v.km_quota_yearly)} ק"מ` : "-"} />
              <Row label="מד בתחילת הליסינג" value={v.km_start != null ? `${fmtNum(v.km_start)} ק"מ` : "-"} />
              <Row label="דורש אוריאה" value={v.urea_required ? "כן" : "לא"} />
              <Row label="טיפול כל" value={`${fmtNum(v.service_interval_km || 12000)} ק"מ`} />
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                {f("lease_company", "חברת ליסינג")}
                {f("lease_monthly", "עלות חודשית (₪)", "number")}
                {f("lease_start", "תחילת חוזה", "date")}
                {f("lease_end", "סיום חוזה", "date")}
                {f("km_quota_yearly", "מכסה שנתית (ק\"מ)", "number")}
                {f("km_start", "מד בתחילת הליסינג", "number")}
                {f("service_interval_km", "טיפול כל (ק\"מ)", "number")}
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 700 }}>
                <input type="checkbox" checked={!!form.urea_required} onChange={e => setForm({ ...form, urea_required: e.target.checked })} />
                הרכב דורש אוריאה (AdBlue) – תזכורת חודשית לנהג
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
                <button className="btn btn-outline" onClick={() => setEdit(false)}>ביטול</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function StatusBox({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return (
    <div style={{ background: ok ? "var(--tint-green)" : "var(--tint-red)", border: `1px solid ${ok ? "var(--tint-green-line)" : "var(--tint-red-line)"}`, borderRadius: 14, padding: "12px 14px", fontWeight: 700, fontSize: 14 }}>
      {ok ? "✓ " : "! "}{ok ? okText : badText}
    </div>
  );
}

// ---------- קילומטראז' ----------
function KmTab({ v, mileage, month, reporterName, isAdmin, onSaved }: any) {
  const current = mileage.find((r: any) => r.month === month);
  const prev = mileage.find((r: any) => r.month < month);
  const [km, setKm] = useState<string>(current ? String(current.km) : "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  async function save() {
    const n = Number(km);
    if (!km || !Number.isFinite(n) || n <= 0) { notify("יש להזין מספר ק\"מ", "error"); return; }
    if (prev && n < Number(prev.km)) { notify(`המספר נמוך מהדיווח הקודם (${fmtNum(prev.km)} ק"מ)`, "error"); return; }
    setSaving(true);
    const res = await supabase.from("ngs_vehicle_mileage")
      .upsert({ vehicle_id: v.id, month, km: n, reported_by: reporterName }, { onConflict: "vehicle_id,month" })
      .select("id, photos").single();
    if (check(res, "הקילומטראז' נשמר")) {
      if (photos.length && res.data) {
        const urls = await uploadPhotos(supabase, "ngs_vehicle_mileage", res.data.id, photos);
        if (urls.length) await supabase.from("ngs_vehicle_mileage").update({ photos: [...(res.data.photos || []), ...urls] }).eq("id", res.data.id);
      }
      setPhotos([]);
      onSaved();
    }
    setSaving(false);
  }

  return (
    <>
      <div style={{ background: "var(--surface-2)", borderRadius: 16, padding: 16, display: "grid", gap: 12 }}>
        <b>דיווח לחודש {monthLabel(month)}{current ? " (דווח – אפשר לעדכן)" : ""}</b>
        <div className="field"><label>מה המספר במד הק"מ?</label>
          <input className="input" type="number" inputMode="numeric" value={km} onChange={e => setKm(e.target.value)} placeholder={prev ? `בחודש הקודם: ${prev.km}` : "לדוגמה 12500"} />
        </div>
        <PendingPhotos files={photos} onChange={setPhotos} />
        <div style={{ fontSize: 12, color: "var(--muted)" }}>מומלץ לצרף תמונה של לוח השעונים.</div>
        <button className="btn btn-primary" style={{ height: 48 }} onClick={save} disabled={saving}>{saving ? "שומר..." : "שמור קילומטראז'"}</button>
      </div>
      <History title="היסטוריית קילומטראז'" rows={mileage} render={(r: any, i: number) => {
        const older = mileage[i + 1];
        return (
          <>
            <span style={{ fontWeight: 700 }}>{monthLabel(r.month)}</span>
            <span>{fmtNum(r.km)} ק"מ{older ? <span style={{ color: "var(--muted)", fontSize: 12 }}> (+{fmtNum(r.km - older.km)})</span> : null}</span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>{r.reported_by || ""}</span>
            {r.photos?.length ? <a href={r.photos[0]} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>תמונה</a> : <span />}
            {isAdmin ? <DeleteBtn table="ngs_vehicle_mileage" id={r.id} onDone={onSaved} /> : <span />}
          </>
        );
      }} />
    </>
  );
}

// ---------- אוריאה ----------
function UreaTab({ v, urea, month, reporterName, onSaved }: any) {
  const done = urea.find((r: any) => r.month === month);
  const [saving, setSaving] = useState(false);
  async function mark() {
    setSaving(true);
    const res = await supabase.from("ngs_vehicle_urea").insert({ vehicle_id: v.id, month, reported_by: reporterName });
    if (check(res, "סומן שמילאת אוריאה – תודה!")) onSaved();
    setSaving(false);
  }
  return (
    <>
      <div style={{ background: done ? "var(--tint-green)" : "var(--tint-amber)", borderRadius: 16, padding: 18, display: "grid", gap: 12, textAlign: "center" }}>
        {done ? (
          <b>✓ מולאה אוריאה החודש ({new Date(done.created_at).toLocaleDateString("he-IL")}{done.reported_by ? ` · ${done.reported_by}` : ""})</b>
        ) : (
          <>
            <b style={{ fontSize: 17 }}>עוד לא סומן שמילאת אוריאה (AdBlue) החודש</b>
            <button className="btn btn-primary" style={{ height: 52, fontSize: 16 }} onClick={mark} disabled={saving}>{saving ? "שומר..." : "מילאתי אוריאה ✓"}</button>
          </>
        )}
      </div>
      <History title="היסטוריית אוריאה" rows={urea} render={(r: any) => (
        <>
          <span style={{ fontWeight: 700 }}>{monthLabel(r.month)}</span>
          <span>{new Date(r.created_at).toLocaleDateString("he-IL")}</span>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>{r.reported_by || ""}</span>
        </>
      )} />
    </>
  );
}

// ---------- דוח נזק ----------
function DamageTab({ v, damage, reporterName, isAdmin, onSaved }: any) {
  const [showForm, setShowForm] = useState(damage.length === 0);
  const [form, setForm] = useState({ occurred_at: nowLocalInput(), location: "", description: "" });
  const [photos, setPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [big, setBig] = useState<string | null>(null);

  function useMyLocation() {
    if (!navigator.geolocation) { notify("המכשיר לא תומך במיקום", "error"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      p => { setForm(f => ({ ...f, location: `https://maps.google.com/?q=${p.coords.latitude.toFixed(6)},${p.coords.longitude.toFixed(6)}` })); setLocating(false); },
      () => { notify("לא הצלחתי לקבל מיקום – כתוב כתובת ידנית", "error"); setLocating(false); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function submit() {
    if (!form.occurred_at || !form.location.trim()) { notify("יש למלא תאריך, שעה ומיקום", "error"); return; }
    if (!photos.length && !confirm("לא צירפת תמונות של הרכב. לשלוח בכל זאת?")) return;
    setSaving(true);
    const res = await supabase.from("ngs_vehicle_damage").insert({
      vehicle_id: v.id, occurred_at: new Date(form.occurred_at).toISOString(),
      location: form.location.trim(), description: form.description.trim() || null, reported_by: reporterName,
    }).select("id").single();
    if (!check(res, "דוח הנזק נשלח")) { setSaving(false); return; }
    let urls: string[] = [];
    if (photos.length && res.data) {
      urls = await uploadPhotos(supabase, "ngs_vehicle_damage", res.data.id, photos);
      if (urls.length) await supabase.from("ngs_vehicle_damage").update({ photos: urls }).eq("id", res.data.id);
    }
    fetch("/api/send-email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "vehicle_damage", data: {
        license_plate: v.license_plate, model: v.model, driver: v.driver, reported_by: reporterName,
        occurred_at: new Date(form.occurred_at).toLocaleString("he-IL"), location: form.location.trim(),
        description: form.description.trim(), photos: urls,
      } }),
    }).catch(() => {});
    setForm({ occurred_at: nowLocalInput(), location: "", description: "" });
    setPhotos([]); setShowForm(false); setSaving(false);
    onSaved();
  }

  async function setStatus(id: string, status: string) {
    if (check(await supabase.from("ngs_vehicle_damage").update({ status }).eq("id", id), "עודכן")) onSaved();
  }

  return (
    <>
      {!showForm && <button className="btn btn-primary" style={{ height: 48 }} onClick={() => setShowForm(true)}>+ דוח נזק / תאונה חדש</button>}
      {showForm && (
        <div style={{ background: "var(--tint-red)", border: "1px solid var(--tint-red-line)", borderRadius: 16, padding: 16, display: "grid", gap: 12 }}>
          <b>דיווח על נזק או תאונה</b>
          <div className="field"><label>תאריך ושעה *</label>
            <input className="input" type="datetime-local" value={form.occurred_at} onChange={e => setForm({ ...form, occurred_at: e.target.value })} />
          </div>
          <div className="field"><label>מיקום *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" style={{ flex: 1 }} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="כתובת או מקום" />
              <button className="btn btn-outline" type="button" onClick={useMyLocation} disabled={locating}><Icon name="pin" size={16} />{locating ? "מאתר..." : "המיקום שלי"}</button>
            </div>
          </div>
          <div className="field"><label>מה קרה?</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="תיאור קצר של האירוע והנזק" />
          </div>
          <PendingPhotos files={photos} onChange={setPhotos} />
          <div style={{ fontSize: 12, color: "var(--muted)" }}>צלם את הרכב מכל הכיוונים, את הנזק מקרוב, ואם יש צד ג' – גם את הרכב שלו ואת רישיון הרכב.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ height: 48, flex: 1 }} onClick={submit} disabled={saving}>{saving ? "שולח..." : "שלח דוח נזק"}</button>
            {damage.length > 0 && <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>}
          </div>
        </div>
      )}
      {damage.map((d: any) => (
        <div key={d.id} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 14, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <b>{new Date(d.occurred_at).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}</b>
            <span className={d.status === "פתוח" ? "badge badge-danger" : "badge badge-success"}>{d.status}</span>
          </div>
          <div style={{ fontSize: 14 }}>
            מיקום: {/^https?:\/\//.test(d.location || "") ? <a href={d.location} target="_blank" rel="noreferrer">פתח במפה</a> : d.location}
          </div>
          {d.description && <div style={{ fontSize: 14, color: "var(--muted)" }}>{d.description}</div>}
          {d.reported_by && <div style={{ fontSize: 12, color: "var(--muted-2)" }}>דווח ע"י {d.reported_by}</div>}
          {d.photos?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {d.photos.map((p: string) => <img key={p} src={p} alt="" onClick={() => setBig(p)} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, cursor: "zoom-in" }} />)}
            </div>
          )}
          {isAdmin && (
            <div style={{ display: "flex", gap: 8 }}>
              {d.status === "פתוח"
                ? <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => setStatus(d.id, "טופל")}>סמן כטופל</button>
                : <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => setStatus(d.id, "פתוח")}>פתח מחדש</button>}
              <DeleteBtn table="ngs_vehicle_damage" id={d.id} onDone={onSaved} />
            </div>
          )}
        </div>
      ))}
      {big && (
        <div onClick={() => setBig(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 4000, display: "grid", placeItems: "center", padding: 16, cursor: "zoom-out" }}>
          <img src={big} alt="" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} />
        </div>
      )}
    </>
  );
}

function History({ title, rows, render }: { title: string; rows: any[]; render: (r: any, i: number) => React.ReactNode }) {
  if (!rows.length) return null;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <b style={{ fontSize: 14 }}>{title}</b>
      {rows.map((r, i) => (
        <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr auto auto", gap: 8, alignItems: "center", borderBottom: "1px solid var(--surface-3)", padding: "8px 0", fontSize: 14 }}>
          {render(r, i)}
        </div>
      ))}
    </div>
  );
}

function DeleteBtn({ table, id, onDone }: { table: string; id: string; onDone: () => void }) {
  return (
    <button className="btn btn-outline" style={{ fontSize: 11, padding: "2px 8px", color: "var(--red)" }}
      onClick={async () => { if (!confirm("למחוק?")) return; if (check(await supabase.from(table).delete().eq("id", id), "נמחק")) onDone(); }}>מחק</button>
  );
}
