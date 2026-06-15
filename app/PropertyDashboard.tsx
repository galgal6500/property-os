"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Data ───────────────────────────────────────────────────────────────────

const owners = [
  { id: 1, name: "יוסי כהן", phone: "052-1234567", email: "yossi@email.com" },
  { id: 2, name: "דוד לוי", phone: "054-7654321", email: "david@email.com" },
  { id: 3, name: "מיכל אברהם", phone: "050-1188223", email: "michal@email.com" },
];

const buildings = [
  { id: 1, name: "הרצל 10", city: "תל אביב", floors: 4 },
  { id: 2, name: "בן גוריון 22", city: "רמת גן", floors: 3 },
  { id: 3, name: "ויצמן 4", city: "גבעתיים", floors: 2 },
];

const apartments = [
  { id: 1, buildingId: 1, building: "הרצל 10", city: "תל אביב", apartmentNumber: "3", floor: 1, rooms: 3, status: "מושכר", owner: "יוסי כהן", tenant: "דני לוי", phone: "052-9991111", leaseEnd: "15/04/2026", openRequests: 1, notes: "דירה משופצת, מזגן חדש בסלון.", rentAmount: 5200, feeType: "percent", feeValue: 8, monthlyIncome: 416 },
  { id: 2, buildingId: 1, building: "הרצל 10", city: "תל אביב", apartmentNumber: "5", floor: 2, rooms: 4, status: "פנוי", owner: "יוסי כהן", tenant: "-", phone: "-", leaseEnd: "-", openRequests: 0, notes: "מוכנה לשיווק לדייר חדש.", rentAmount: 0, feeType: "percent", feeValue: 8, monthlyIncome: 0 },
  { id: 3, buildingId: 2, building: "בן גוריון 22", city: "רמת גן", apartmentNumber: "8", floor: 3, rooms: 2, status: "מושכר", owner: "דוד לוי", tenant: "שיר אדרי", phone: "050-7772233", leaseEnd: "01/06/2026", openRequests: 2, notes: "יש חניה ומחסן.", rentAmount: 4300, feeType: "percent", feeValue: 10, monthlyIncome: 430 },
  { id: 4, buildingId: 3, building: "ויצמן 4", city: "גבעתיים", apartmentNumber: "2", floor: 0, rooms: 3, status: "מושכר", owner: "מיכל אברהם", tenant: "איתי פרץ", phone: "053-8881234", leaseEnd: "20/03/2026", openRequests: 1, notes: "חוזה מסתיים בקרוב.", rentAmount: 6100, feeType: "fixed", feeValue: 550, monthlyIncome: 550 },
  { id: 5, buildingId: 1, building: "הרצל 10", city: "תל אביב", apartmentNumber: "7", floor: 3, rooms: 2, status: "מושכר", owner: "יוסי כהן", tenant: "רועי אמסלם", phone: "050-2233445", leaseEnd: "01/09/2026", openRequests: 0, notes: "יחידה קטנה ומתאימה ליחיד.", rentAmount: 3800, feeType: "percent", feeValue: 8, monthlyIncome: 304 },
  { id: 6, buildingId: 1, building: "הרצל 10", city: "תל אביב", apartmentNumber: "1", floor: 0, rooms: 2, status: "מושכר", owner: "יוסי כהן", tenant: "ליאור כהן", phone: "054-1112233", leaseEnd: "11/11/2026", openRequests: 0, notes: "יחידת קרקע.", rentAmount: 4100, feeType: "percent", feeValue: 8, monthlyIncome: 328 },
];

const serviceRequests = [
  { id: 1, apartment: "הרצל 10 / 3", issue: "נזילה במקלחת", urgency: "גבוהה", status: "בטיפול", cost: "450 ₪" },
  { id: 2, apartment: "בן גוריון 22 / 8", issue: "מזגן לא מקרר", urgency: "בינונית", status: "חדשה", cost: "-" },
  { id: 3, apartment: "ויצמן 4 / 2", issue: "דלת כניסה לא נסגרת", urgency: "גבוהה", status: "ממתין לבעל מקצוע", cost: "-" },
];

const leasesEndingSoon = [
  { id: 1, apartment: "ויצמן 4 / 2", tenant: "איתי פרץ", owner: "מיכל אברהם", endDate: "20/03/2026" },
  { id: 2, apartment: "הרצל 10 / 3", tenant: "דני לוי", owner: "יוסי כהן", endDate: "15/04/2026" },
];

const documents = [
  { id: 1, name: "חוזה שכירות 2025", type: "חוזה", date: "10/04/2025" },
  { id: 2, name: "תמונות מסירה", type: "תמונה", date: "12/04/2025" },
  { id: 3, name: "הצעת מחיר אינסטלטור", type: "הצעת מחיר", date: "08/03/2026" },
];

const tenantHistory = [
  { id: 1, name: "דני לוי", from: "15/04/2025", to: "פעיל" },
  { id: 2, name: "משה כהן", from: "01/03/2023", to: "01/03/2025" },
];

const leaseHistory = [
  { id: 1, from: "15/04/2025", to: "15/04/2026", rent: "5,200 ₪", status: "פעיל" },
  { id: 2, from: "01/03/2023", to: "01/03/2025", rent: "4,800 ₪", status: "הסתיים" },
];

const monthlyIncomeData = [
  { month: "ינו", amount: 5840 },
  { month: "פבר", amount: 6120 },
  { month: "מרץ", amount: 6840 },
  { month: "אפר", amount: 6710 },
  { month: "מאי", amount: 7020 },
  { month: "יוני", amount: 6980 },
];

const ownerExpenses = [
  { id: 1, ownerName: "יוסי כהן", apartment: "הרצל 10 / 3", date: "08/03/2026", category: "אינסטלציה", description: "תיקון נזילה במקלחת", vendor: "אינסטלטור", amount: 250, paidBy: "בעל נכס" },
  { id: 2, ownerName: "יוסי כהן", apartment: "הרצל 10 / 5", date: "10/03/2026", category: "חשמל", description: "תיקון קצר בארון חשמל", vendor: "חשמלאי", amount: 500, paidBy: "בעל נכס" },
  { id: 3, ownerName: "דוד לוי", apartment: "בן גוריון 22 / 8", date: "05/03/2026", category: "מזגן", description: "בדיקת מזגן", vendor: "טכנאי מזגנים", amount: 300, paidBy: "בעל נכס" },
];

const ownerMonthlySummary = [
  { ownerName: "יוסי כהן", month: "ינואר", income: 13100, expenses: 0 },
  { ownerName: "יוסי כהן", month: "פברואר", income: 13100, expenses: 500 },
  { ownerName: "יוסי כהן", month: "מרץ", income: 13100, expenses: 750 },
  { ownerName: "דוד לוי", month: "ינואר", income: 4300, expenses: 0 },
  { ownerName: "דוד לוי", month: "פברואר", income: 4300, expenses: 0 },
  { ownerName: "דוד לוי", month: "מרץ", income: 4300, expenses: 300 },
  { ownerName: "מיכל אברהם", month: "ינואר", income: 6100, expenses: 0 },
  { ownerName: "מיכל אברהם", month: "פברואר", income: 6100, expenses: 0 },
  { ownerName: "מיכל אברהם", month: "מרץ", income: 6100, expenses: 0 },
];

const tenantPortalData = {
  tenantName: "דני לוי", apartment: "הרצל 10 / דירה 3", building: "הרצל 10", floor: 1,
  leaseEnd: "15/04/2026", rentAmount: 5200, phone: "052-9991111",
  expenses: [
    { id: 1, description: "שכר דירה", amount: 5200, date: "01/03/2026" },
    { id: 2, description: "תיקון אינסטלטור", amount: 450, date: "08/03/2026" },
  ],
  requests: [
    { id: 1, issue: "נזילה במקלחת", status: "בטיפול", date: "08/03/2026" },
    { id: 2, issue: "מזגן לא מקרר", status: "חדשה", date: "02/02/2026" },
  ],
};

const navItems = [
  { key: "dashboard", label: "דשבורד" },
  { key: "apartments", label: "דירות" },
  { key: "requests", label: "קריאות שירות" },
  { key: "ngs", label: "נג״ש מור" },
  { key: "owners", label: "בעלי נכסים" },
  { key: "buildings", label: "מבנים" },
  { key: "leases", label: "חוזים" },
  { key: "payments", label: "תשלומים" },
  { key: "workcontracts", label: "חוזי עבודה" },
  { key: "documents", label: "מסמכים" },
  { key: "users", label: "משתמשים" },
  { key: "activity", label: "פעילות" },
  { key: "settings", label: "הגדרות" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSerial(n: number | null | undefined) {
  if (!n) return "0000";
  return String(n).padStart(4, "0");
}

function badgeClass(value: string) {
  if (["מושכר", "פעיל", "נסגרה"].includes(value)) return "badge badge-success";
  if (["פנוי", "חדשה", "בינונית"].includes(value)) return "badge badge-warning";
  if (["גבוהה"].includes(value)) return "badge badge-danger";
  if (["דחוף מאוד"].includes(value)) return "badge" + " " + "badge-urgent";
  return "badge badge-default";
}

function currency(value: number) {
  return new Intl.NumberFormat("he-IL").format(value) + " ₪";
}

function totalMonthlyIncome() {
  return apartments.reduce((sum, a) => sum + (a.monthlyIncome || 0), 0);
}

// ─── Small components ────────────────────────────────────────────────────────

function KPI({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="card kpi">
      <div className="label">{title}</div>
      <div className="value">{value}</div>
      <div className="small">{subtitle}</div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="info-box">
      <div className="l">{label}</div>
      <div className="v">{value}</div>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  return <span className={badgeClass(value)}>{value}</span>;
}

// ─── Page components ─────────────────────────────────────────────────────────

function IncomeChart() {
  const max = Math.max(...monthlyIncomeData.map((d) => d.amount));
  return (
    <div className="card">
      <h3 className="card-title">גרף הכנסות חודשי</h3>
      <div className="muted" style={{ marginBottom: 18 }}>מעקב אחר ההכנסה שלך מניהול נכסים</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 260, paddingTop: 10 }}>
        {monthlyIncomeData.map((item) => {
          const height = Math.max(40, (item.amount / max) * 220);
          return (
            <div key={item.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{item.amount.toLocaleString("he-IL")} ₪</div>
              <div style={{ width: "100%", maxWidth: 56, height, borderRadius: "18px 18px 8px 8px", background: "linear-gradient(180deg, #d5b57a, #b79253)", boxShadow: "0 12px 24px rgba(183,146,83,.28)" }} />
              <div style={{ fontSize: 13, color: "#475569", fontWeight: 700 }}>{item.month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Dashboard({ openApartment, openBuilding }: { openApartment: (id: string) => void; openBuilding: (id: any) => void }) {
  const vacant = apartments.filter((a) => a.status === "פנוי");
  const [quickAction, setQuickAction] = useState<string | null>(null);
  const [stats, setStats] = useState({ owners: 0, buildings: 0, apartments: 0, vacant: 0, openRequests: 0, endingSoon: 0, monthlyIncome: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [endingLeases, setEndingLeases] = useState<any[]>([]);
  const [vacantList, setVacantList] = useState<any[]>([]);
  const [dbApts, setDbApts] = useState<any[]>([]);
  const [dbBlds, setDbBlds] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [ownerForm, setOwnerForm] = useState({ name: "", phone: "", email: "" });
  const [aptForm, setAptForm] = useState({ building_id: "", apartment_number: "", floor: "0", rooms: "3", status: "פנוי", rent_amount: "", owner_name: "", tenant_name: "", tenant_phone: "", lease_end: "", fee_type: "fixed", fee_value: "0" });
  const [leaseForm, setLeaseForm] = useState({ apartment_id: "", tenant_name: "", start_date: "", end_date: "", rent_amount: "", deposit: "" });
  const [reqForm, setReqForm] = useState({ apartment_id: "", issue: "", urgency: "בינונית", vendor: "", cost: "" });

  useEffect(() => {
    supabase.from("apartments").select("id, apartment_number, buildings(name)").then(({ data }) => setDbApts(data || []));
    supabase.from("buildings").select("*").then(({ data }) => setDbBlds(data || []));

    // Load real stats
    Promise.all([
      supabase.from("owners").select("id", { count: "exact" }),
      supabase.from("buildings").select("id", { count: "exact" }),
      supabase.from("apartments").select("id, status, rent_amount, fee_type, fee_value", { count: "exact" }),
      supabase.from("service_requests").select("id", { count: "exact" }).neq("status", "הושלם"),
      supabase.from("leases").select("id, end_date, tenant_name, apartments(apartment_number, buildings(name))").eq("status", "פעיל"),
      supabase.from("service_requests").select("*, apartments(apartment_number, buildings(name))").neq("status", "הושלם").order("created_at", { ascending: false }).limit(5),
      supabase.from("apartments").select("id, apartment_number, buildings(name), rent_amount, owner_name").eq("status", "פנוי").limit(5),
    ]).then(([owners, buildings, apts, openReqs, leases, requests, vacant]) => {
      const allApts = apts.data || [];
      const allLeases = leases.data || [];
      const monthlyIncome = allApts.reduce((sum: number, a: any) => {
        if (!a.rent_amount) return sum;
        const fee = a.fee_type === "percent" ? (a.rent_amount * (a.fee_value || 8)) / 100 : (a.fee_value || 0);
        return sum + fee;
      }, 0);
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      const ending = allLeases.filter((l: any) => l.end_date && new Date(l.end_date) <= thirtyDays);
      setStats({
        owners: owners.count || 0,
        buildings: buildings.count || 0,
        apartments: apts.count || 0,
        vacant: allApts.filter((a: any) => a.status === "פנוי").length,
        openRequests: openReqs.count || 0,
        endingSoon: ending.length,
        monthlyIncome
      });
      setEndingLeases(ending.slice(0, 5));
      setRecentRequests(requests.data || []);
      setVacantList(vacant.data || []);
    });
  }, []);

  async function saveOwner() {
    if (!ownerForm.name) return;
    setSaving(true);
    await supabase.from("owners").insert(ownerForm);
    setOwnerForm({ name: "", phone: "", email: "" });
    setQuickAction(null);
    setSaving(false);
  }

  async function saveApt() {
    if (!aptForm.apartment_number) return;
    setSaving(true);
    await supabase.from("apartments").insert({ ...aptForm, floor: parseInt(aptForm.floor), rooms: parseFloat(aptForm.rooms), rent_amount: parseFloat(aptForm.rent_amount) || 0, fee_value: parseFloat(aptForm.fee_value) || 0 });
    setAptForm({ building_id: "", apartment_number: "", floor: "0", rooms: "3", status: "פנוי", rent_amount: "", owner_name: "", tenant_name: "", tenant_phone: "", lease_end: "", fee_type: "fixed", fee_value: "0" });
    setQuickAction(null);
    setSaving(false);
  }

  async function saveLease() {
    if (!leaseForm.tenant_name) return;
    setSaving(true);
    await supabase.from("leases").insert({ ...leaseForm, rent_amount: parseFloat(leaseForm.rent_amount) || 0, deposit: parseFloat(leaseForm.deposit) || 0, status: "פעיל" });
    setLeaseForm({ apartment_id: "", tenant_name: "", start_date: "", end_date: "", rent_amount: "", deposit: "" });
    setQuickAction(null);
    setSaving(false);
  }

  async function saveReq() {
    if (!reqForm.issue) return;
    setSaving(true);
    await supabase.from("service_requests").insert({ ...reqForm, cost: parseFloat(reqForm.cost) || 0, status: "חדשה" });
    setReqForm({ apartment_id: "", issue: "", urgency: "בינונית", vendor: "", cost: "" });
    setQuickAction(null);
    setSaving(false);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="kpi-grid">
        <KPI title="בעלי נכסים" value={String(stats.owners)} subtitle="לקוחות פעילים" />
        <KPI title="מבנים" value={String(stats.buildings)} subtitle="מבנים מנוהלים" />
        <KPI title="דירות" value={String(stats.apartments)} subtitle='סה״כ במערכת' />
        <KPI title="דירות פנויות" value={String(stats.vacant)} subtitle="דורש שיווק" />
        <KPI title="קריאות פתוחות" value={String(stats.openRequests)} subtitle="לטיפול" />
        <KPI title="חוזים קרובים לסיום" value={String(stats.endingSoon)} subtitle="30 יום קדימה" />
        <KPI title="הכנסה חודשית" value={currency(stats.monthlyIncome)} subtitle="הכנסה צפויה מניהול" />
      </div>

      <div className="grid-2-1">
        <div className="card">
          <h3 className="card-title">קריאות שירות שדורשות טיפול</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>דירה</th><th>תקלה</th><th>דחיפות</th><th>סטטוס</th></tr></thead>
              <tbody>
                {recentRequests.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: "#64748b", padding: 20 }}>אין קריאות פתוחות 🎉</td></tr>
                ) : recentRequests.map((item) => (
                  <tr key={item.id}>
                    <td>{item.apartments?.buildings?.name} / {item.apartments?.apartment_number}</td>
                    <td>{item.issue}</td>
                    <td><Badge value={item.urgency} /></td>
                    <td><Badge value={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">פעולות מהירות</h3>
          <div className="action-list">
            <button className="btn btn-primary" onClick={() => setQuickAction(quickAction === "owner" ? null : "owner")}>👤 הוסף בעל נכס</button>
            <button className="btn btn-secondary" onClick={() => setQuickAction(quickAction === "apt" ? null : "apt")}>🏠 הוסף דירה</button>
            <button className="btn btn-secondary" onClick={() => setQuickAction(quickAction === "lease" ? null : "lease")}>📋 הוסף חוזה</button>
            <button className="btn btn-secondary" onClick={() => setQuickAction(quickAction === "req" ? null : "req")}>🔧 פתח קריאת שירות</button>
          </div>

          {quickAction === "owner" && (
            <div style={{ marginTop: 16, display: "grid", gap: 10, background: "#f8fafc", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>בעל נכס חדש</div>
              <input className="input" placeholder="שם מלא *" value={ownerForm.name} onChange={e => setOwnerForm({...ownerForm, name: e.target.value})} />
              <input className="input" placeholder="טלפון" value={ownerForm.phone} onChange={e => setOwnerForm({...ownerForm, phone: e.target.value})} />
              <input className="input" placeholder="אימייל" value={ownerForm.email} onChange={e => setOwnerForm({...ownerForm, email: e.target.value})} />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={saveOwner} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
                <button className="btn btn-outline" onClick={() => setQuickAction(null)}>ביטול</button>
              </div>
            </div>
          )}

          {quickAction === "apt" && (
            <div style={{ marginTop: 16, display: "grid", gap: 10, background: "#f8fafc", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>דירה חדשה</div>
              <select className="input" value={aptForm.building_id} onChange={e => setAptForm({...aptForm, building_id: e.target.value})}>
                <option value="">בחר מבנה</option>
                {dbBlds.map((b: any) => <option key={b.id} value={b.id}>{b.name}, {b.city}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input className="input" placeholder="מספר דירה *" value={aptForm.apartment_number} onChange={e => setAptForm({...aptForm, apartment_number: e.target.value})} />
                <input className="input" placeholder="שכר דירה ₪" type="number" value={aptForm.rent_amount} onChange={e => setAptForm({...aptForm, rent_amount: e.target.value})} />
                <input className="input" placeholder="בעל נכס" value={aptForm.owner_name} onChange={e => setAptForm({...aptForm, owner_name: e.target.value})} />
                <input className="input" placeholder="דייר" value={aptForm.tenant_name} onChange={e => setAptForm({...aptForm, tenant_name: e.target.value})} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={saveApt} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
                <button className="btn btn-outline" onClick={() => setQuickAction(null)}>ביטול</button>
              </div>
            </div>
          )}

          {quickAction === "lease" && (
            <div style={{ marginTop: 16, display: "grid", gap: 10, background: "#f8fafc", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>חוזה חדש</div>
              <select className="input" value={leaseForm.apartment_id} onChange={e => setLeaseForm({...leaseForm, apartment_id: e.target.value})}>
                <option value="">בחר דירה</option>
                {dbApts.map((a: any) => <option key={a.id} value={a.id}>{a.buildings?.name} / {a.apartment_number}</option>)}
              </select>
              <input className="input" placeholder="שם דייר *" value={leaseForm.tenant_name} onChange={e => setLeaseForm({...leaseForm, tenant_name: e.target.value})} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input className="input" type="date" value={leaseForm.start_date} onChange={e => setLeaseForm({...leaseForm, start_date: e.target.value})} />
                <input className="input" type="date" value={leaseForm.end_date} onChange={e => setLeaseForm({...leaseForm, end_date: e.target.value})} />
                <input className="input" placeholder="שכר דירה ₪" type="number" value={leaseForm.rent_amount} onChange={e => setLeaseForm({...leaseForm, rent_amount: e.target.value})} />
                <input className="input" placeholder="פיקדון ₪" type="number" value={leaseForm.deposit} onChange={e => setLeaseForm({...leaseForm, deposit: e.target.value})} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={saveLease} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
                <button className="btn btn-outline" onClick={() => setQuickAction(null)}>ביטול</button>
              </div>
            </div>
          )}

          {quickAction === "req" && (
            <div style={{ marginTop: 16, display: "grid", gap: 10, background: "#f8fafc", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>קריאת שירות חדשה</div>
              <select className="input" value={reqForm.apartment_id} onChange={e => setReqForm({...reqForm, apartment_id: e.target.value})}>
                <option value="">בחר דירה</option>
                {dbApts.map((a: any) => <option key={a.id} value={a.id}>{a.buildings?.name} / {a.apartment_number}</option>)}
              </select>
              <input className="input" placeholder="נושא התקלה *" value={reqForm.issue} onChange={e => setReqForm({...reqForm, issue: e.target.value})} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <select className="input" value={reqForm.urgency} onChange={e => setReqForm({...reqForm, urgency: e.target.value})}>
                  <option>נמוכה</option><option>בינונית</option><option>גבוהה</option><option>דחוף מאוד</option>
                </select>
                <input className="input" placeholder="ספק / בעל מקצוע" value={reqForm.vendor} onChange={e => setReqForm({...reqForm, vendor: e.target.value})} />
                <input className="input" placeholder="עלות ₪" type="number" value={reqForm.cost} onChange={e => setReqForm({...reqForm, cost: e.target.value})} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={saveReq} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
                <button className="btn btn-outline" onClick={() => setQuickAction(null)}>ביטול</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid-1-1">
        <div className="card">
          <h3 className="card-title">חוזים שמסתיימים בקרוב</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>דירה</th><th>דייר</th><th>בעל נכס</th><th>תאריך סיום</th></tr></thead>
              <tbody>
                {endingLeases.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: "#64748b", padding: 20 }}>אין חוזים קרובים לסיום ✅</td></tr>
                ) : endingLeases.map((item: any) => (
                  <tr key={item.id}><td>{item.apartments?.buildings?.name} / {item.apartments?.apartment_number}</td><td>{item.tenant_name}</td><td>-</td><td>{item.end_date ? new Date(item.end_date).toLocaleDateString("he-IL") : "-"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">דירות פנויות שצריך לקדם</h3>
          <div className="vacant-list">
            {vacantList.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>אין דירות פנויות 🎉</div>
            ) : vacantList.map((item: any) => (
              <div key={item.id} className="vacant-item" onClick={() => openApartment(item.id)} style={{ cursor: "pointer" }}>
                <div style={{ fontWeight: 800 }}>{item.buildings?.name} / דירה {item.apartment_number}</div>
                <div className="muted" style={{ marginTop: 6 }}>בעל נכס: {item.owner_name || "-"}</div>
                <div style={{ marginTop: 12 }}><Badge value="פנוי" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <IncomeChart />
    </div>
  );
}

export function Owners({ openOwner }: { openOwner: (id: number) => void }) {
  const [dbOwners, setDbOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("owners").select("*").order("created_at", { ascending: false });
    setDbOwners(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addOwner() {
    if (!form.name) return;
    setSaving(true);
    await supabase.from("owners").insert(form);
    setForm({ name: "", phone: "", email: "", notes: "" });
    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function deleteOwner(id: string) {
    if (!confirm("למחוק את בעל הנכס?")) return;
    await supabase.from("owners").delete().eq("id", id);
    await load();
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card">
        <div className="section-top">
          <div>
            <h2 className="card-title" style={{ marginBottom: 6 }}>בעלי נכסים</h2>
            <div className="muted">רשימת הלקוחות שלך במערכת</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף בעל נכס</button>
        </div>

        {showForm && (
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 18, display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>בעל נכס חדש</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label>שם מלא</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="יוסי כהן" /></div>
              <div className="field"><label>טלפון</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="052-1234567" /></div>
              <div className="field"><label>אימייל</label><input className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="yossi@email.com" /></div>
              <div className="field"><label>הערות</label><input className="input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="הערות..." /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={addOwner} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>טוען...</div>
        ) : dbOwners.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>אין בעלי נכסים עדיין</div>
            <div>לחץ על "הוסף בעל נכס" כדי להתחיל</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>שם</th><th>טלפון</th><th>אימייל</th><th>הערות</th><th>פעולות</th></tr></thead>
              <tbody>
                {dbOwners.map((owner) => (
                  <tr key={owner.id}>
                    <td style={{ fontWeight: 800 }}>{owner.name}</td>
                    <td>{owner.phone || "-"}</td>
                    <td>{owner.email || "-"}</td>
                    <td>{owner.notes || "-"}</td>
                    <td><button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => deleteOwner(owner.id)}>מחק</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function OwnerDetails({ ownerId, back }: { ownerId: number; back: () => void }) {
  const owner = owners.find((o) => o.id === ownerId) || owners[0];
  const ownerUnits = apartments.filter((a) => a.owner === owner.name);
  const expenses = ownerExpenses.filter((e) => e.ownerName === owner.name && e.paidBy === "בעל נכס");
  const monthly = ownerMonthlySummary.filter((m) => m.ownerName === owner.name);
  const rentalIncome = ownerUnits.reduce((sum, u) => sum + (u.rentAmount || 0), 0);
  const managementIncome = ownerUnits.reduce((sum, u) => sum + (u.monthlyIncome || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="detail-top">
        <div>
          <button className="back-link" onClick={back}>← חזרה לבעלי נכסים</button>
          <h2 style={{ margin: "8px 0", fontSize: 34 }}>{owner.name}</h2>
          <div className="muted">{owner.phone} · {owner.email}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary">הוסף הוצאה</button>
          <button className="btn btn-secondary">הוסף דירה</button>
          <button className="btn btn-outline">הפק דוח לבעל נכס</button>
        </div>
      </div>

      <div className="detail-kpis">
        <KPI title="הכנסות שכירות" value={currency(rentalIncome)} subtitle="ברוטו מהדירות" />
        <KPI title="הוצאות" value={currency(totalExpenses)} subtitle="תיקונים ובעלי מקצוע" />
        <KPI title="רווח נטו" value={currency(rentalIncome - totalExpenses)} subtitle="לפני עמלת ניהול" />
        <KPI title="עמלת ניהול" value={currency(managementIncome)} subtitle="ההכנסה שלך" />
        <KPI title="מספר דירות" value={String(ownerUnits.length)} subtitle="דירות משויכות" />
      </div>

      <div className="grid-1-1">
        <div className="card">
          <h3 className="card-title">הדירות של בעל הנכס</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>מבנה</th><th>דירה</th><th>דייר</th><th>שכירות</th><th>עמלת ניהול</th><th>סטטוס</th></tr></thead>
              <tbody>
                {ownerUnits.map((u) => (
                  <tr key={u.id}>
                    <td>{u.building}</td><td>{u.apartmentNumber}</td><td>{u.tenant}</td>
                    <td>{currency(u.rentAmount)}</td><td>{currency(u.monthlyIncome)}</td>
                    <td><Badge value={u.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">סיכום חודשי</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>חודש</th><th>הכנסות</th><th>הוצאות</th><th>רווח נטו</th></tr></thead>
              <tbody>
                {monthly.map((m, i) => (
                  <tr key={i}><td>{m.month}</td><td>{currency(m.income)}</td><td>{currency(m.expenses)}</td><td>{currency(m.income - m.expenses)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">הוצאות על הדירות</h3>
        <div className="muted" style={{ marginBottom: 14 }}>כל התיקונים והספקים שבעל הנכס שילם עליהם</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>תאריך</th><th>דירה</th><th>סוג הוצאה</th><th>תיאור</th><th>ספק</th><th>עלות</th></tr></thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}><td>{e.date}</td><td>{e.apartment}</td><td>{e.category}</td><td>{e.description}</td><td>{e.vendor}</td><td>{currency(e.amount)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Settings({ userEmail }: { userEmail: string }) {
  const [tab, setTab] = useState("business");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Business settings
  const [business, setBusiness] = useState({
    name: "GM ניהול נכסים", phone: "", email: "", address: "", vat: ""
  });

  // Issue types
  const [issueTypes, setIssueTypes] = useState([
    "נזילה", "חשמל", "מזגן", "דלת/חלון", "ריצוף", "צנרת", "גינה", "אחר"
  ]);
  const [newIssue, setNewIssue] = useState("");

  // Default fee
  const [defaultFee, setDefaultFee] = useState({ type: "percent", value: "8" });

  // Password change
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [passError, setPassError] = useState("");
  const [passSaved, setPassSaved] = useState(false);

  // Email alerts
  const [alerts, setAlerts] = useState({
    leaseEnding: true, newRequest: true, requestClosed: false, newUser: true
  });

  async function saveBusiness() {
    setSaving(true);
    await supabase.from("settings").upsert({ key: "business", value: JSON.stringify(business) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  }

  async function saveAlerts() {
    setSaving(true);
    await supabase.from("settings").upsert({ key: "alerts", value: JSON.stringify(alerts) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  }

  async function saveFee() {
    setSaving(true);
    await supabase.from("settings").upsert({ key: "default_fee", value: JSON.stringify(defaultFee) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  }

  async function changePassword() {
    setPassError("");
    if (passwords.newPass !== passwords.confirm) { setPassError("הסיסמאות לא תואמות"); return; }
    if (passwords.newPass.length < 6) { setPassError("סיסמה חייבת להיות לפחות 6 תווים"); return; }
    const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
    if (error) { setPassError("שגיאה בשינוי הסיסמה"); return; }
    setPassSaved(true);
    setPasswords({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPassSaved(false), 3000);
  }

  const tabs = [
    { key: "business", label: "🏢 פרטי העסק" },
    { key: "issues", label: "🔧 סוגי תקלות" },
    { key: "fees", label: "💰 עמלות" },
    { key: "alerts", label: "🔔 התראות" },
    { key: "password", label: "🔑 סיסמה" },
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card">
        <h2 className="card-title">הגדרות מערכת</h2>
        <div className="tab-bar">
          {tabs.map(t => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
      </div>

      {tab === "business" && (
        <div className="card">
          <div className="section-top" style={{ marginBottom: 16 }}>
            <h3 className="card-title" style={{ margin: 0 }}>פרטי העסק</h3>
            {saved && <span style={{ color: "#16a34a", fontWeight: 700 }}>✅ נשמר!</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="field"><label>שם העסק</label><input className="input" value={business.name} onChange={e => setBusiness({...business, name: e.target.value})} placeholder="GM ניהול נכסים" /></div>
            <div className="field"><label>טלפון</label><input className="input" value={business.phone} onChange={e => setBusiness({...business, phone: e.target.value})} placeholder="052-1234567" /></div>
            <div className="field"><label>אימייל</label><input className="input" value={business.email} onChange={e => setBusiness({...business, email: e.target.value})} placeholder="gm@property.com" /></div>
            <div className="field"><label>כתובת</label><input className="input" value={business.address} onChange={e => setBusiness({...business, address: e.target.value})} placeholder="רחוב הרצל 1, תל אביב" /></div>
            <div className="field"><label>ח.פ / ע.מ</label><input className="input" value={business.vat} onChange={e => setBusiness({...business, vat: e.target.value})} placeholder="123456789" /></div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={saveBusiness} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
        </div>
      )}

      {tab === "issues" && (
        <div className="card">
          <h3 className="card-title">סוגי תקלות</h3>
          <div className="muted" style={{ marginBottom: 16 }}>סוגי התקלות שיופיעו בטופס קריאת שירות</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {issueTypes.map((issue, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f1f5f9", borderRadius: 20, padding: "6px 14px" }}>
                <span>{issue}</span>
                <button onClick={() => setIssueTypes(issueTypes.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="input" style={{ maxWidth: 220 }} value={newIssue} onChange={e => setNewIssue(e.target.value)} placeholder="סוג תקלה חדש..." onKeyDown={e => { if (e.key === "Enter" && newIssue) { setIssueTypes([...issueTypes, newIssue]); setNewIssue(""); }}} />
            <button className="btn btn-primary" onClick={() => { if (newIssue) { setIssueTypes([...issueTypes, newIssue]); setNewIssue(""); }}}>הוסף</button>
          </div>
        </div>
      )}

      {tab === "fees" && (
        <div className="card">
          <div className="section-top" style={{ marginBottom: 16 }}>
            <h3 className="card-title" style={{ margin: 0 }}>עמלת ניהול ברירת מחדל</h3>
            {saved && <span style={{ color: "#16a34a", fontWeight: 700 }}>✅ נשמר!</span>}
          </div>
          <div className="muted" style={{ marginBottom: 16 }}>ערך זה ישמש כברירת מחדל בעת הוספת דירה חדשה</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 400 }}>
            <div className="field">
              <label>סוג עמלה</label>
              <select className="input" value={defaultFee.type} onChange={e => setDefaultFee({...defaultFee, type: e.target.value})}>
                <option value="percent">אחוז מהשכירות</option>
                <option value="fixed">סכום קבוע</option>
              </select>
            </div>
            <div className="field">
              <label>{defaultFee.type === "percent" ? "אחוז (%)" : "סכום (₪)"}</label>
              <input className="input" type="number" value={defaultFee.value} onChange={e => setDefaultFee({...defaultFee, value: e.target.value})} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={saveFee} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
        </div>
      )}

      {tab === "alerts" && (
        <div className="card">
          <div className="section-top" style={{ marginBottom: 16 }}>
            <h3 className="card-title" style={{ margin: 0 }}>התראות באימייל</h3>
            {saved && <span style={{ color: "#16a34a", fontWeight: 700 }}>✅ נשמר!</span>}
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              { key: "leaseEnding", label: "חוזה מסתיים בעוד 30 יום", desc: "שלח התראה כשחוזה עומד להסתיים" },
              { key: "newRequest", label: "קריאת שירות חדשה", desc: "שלח התראה בכל קריאה חדשה" },
              { key: "requestClosed", label: "קריאת שירות נסגרה", desc: "שלח התראה כשקריאה מסומנת כהושלם" },
              { key: "newUser", label: "משתמש חדש נרשם", desc: "שלח התראה כשמשתמש חדש מבקש גישה" },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.label}</div>
                  <div className="muted" style={{ marginTop: 4 }}>{item.desc}</div>
                </div>
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setAlerts({...alerts, [item.key]: !alerts[item.key as keyof typeof alerts]})}>
                  <div style={{ width: 48, height: 26, borderRadius: 13, background: alerts[item.key as keyof typeof alerts] ? "#c9a227" : "#cbd5e1", transition: "background 0.2s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: alerts[item.key as keyof typeof alerts] ? 25 : 3, transition: "left 0.2s" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={saveAlerts} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
        </div>
      )}

      {tab === "password" && (
        <div className="card">
          <h3 className="card-title">שינוי סיסמה</h3>
          <div className="muted" style={{ marginBottom: 16 }}>מחובר כ: {userEmail}</div>
          <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
            <div className="field"><label>סיסמה חדשה</label><input className="input" type="password" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} placeholder="לפחות 6 תווים" /></div>
            <div className="field"><label>אימות סיסמה</label><input className="input" type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} placeholder="הזן שוב את הסיסמה" /></div>
          </div>
          {passError && <div style={{ color: "#dc2626", marginTop: 10, fontSize: 14 }}>{passError}</div>}
          {passSaved && <div style={{ color: "#16a34a", marginTop: 10, fontWeight: 700 }}>✅ הסיסמה שונתה בהצלחה!</div>}
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={changePassword}>שמור סיסמה חדשה</button>
        </div>
      )}
    </div>
  );
}

export function ActivityLog() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("הכל");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("user_activity").select("*").order("created_at", { ascending: false }).limit(200);
      setActivities(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === "הכל" ? activities : activities.filter(a => a.user_name === filter);
  const users = Array.from(new Set(activities.map(a => a.user_name).filter(Boolean)));

  // סיכום לפי משתמש
  const summary = users.map(name => {
    const userActs = activities.filter(a => a.user_name === name);
    const lastLogin = userActs[0]?.session_start;
    return { name, count: userActs.length, lastLogin, role: userActs[0]?.user_role };
  });

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h3 className="card-title">👁️ מעקב פעילות משתמשים</h3>

        {/* סיכום לפי משתמש */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
          {summary.map(u => (
            <div key={u.name} style={{ background: "#f8fafc", borderRadius: 14, padding: 14, border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{u.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{u.role}</div>
              <div style={{ fontSize: 12, color: "#475569" }}>כניסות: <strong>{u.count}</strong></div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                אחרון: {u.lastLogin ? new Date(u.lastLogin).toLocaleString("he-IL") : "-"}
              </div>
            </div>
          ))}
        </div>

        {/* סינון */}
        <div className="chips" style={{ marginBottom: 14 }}>
          <button className={`btn ${filter === "הכל" ? "btn-dark" : "btn-outline"}`} onClick={() => setFilter("הכל")}>הכל</button>
          {users.map(u => <button key={u} className={`btn ${filter === u ? "btn-dark" : "btn-outline"}`} onClick={() => setFilter(u)}>{u}</button>)}
        </div>

        {loading ? <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>טוען...</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>משתמש</th><th>תפקיד</th><th>פעולה</th><th>תאריך ושעה</th></tr></thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 700 }}>{a.user_name || "-"}</td>
                    <td>{a.user_role || "-"}</td>
                    <td><span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>כניסה</span></td>
                    <td>{a.session_start ? new Date(a.session_start).toLocaleString("he-IL") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apts, setApts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "Aa123456!", role: "ngs_worker", phone: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");

  // הרשאות לפי תפקיד
  const rolePermissions: Record<string, string> = {
    admin: "גישה מלאה לכל המערכת",
    ngs_worker: "רואה רק את מודול נג\"ש מור",
    owner: "רואה רק את הדירות והחוזים שלו",
    tenant: "רואה רק את הדירה וקריאות השירות שלו",
  };

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*, apartments(apartment_number, buildings(name))").order("created_at", { ascending: false });
    const { data: ap } = await supabase.from("apartments").select("id, apartment_number, buildings(name)");
    setUsers(data || []);
    setApts(ap || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addUser() {
    setFormError(""); setFormSuccess("");
    if (!form.full_name || !form.email || !form.password) { setFormError("יש למלא שם, אימייל וסיסמה"); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (error) { setFormError(error.message); setSaving(false); return; }
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: form.full_name,
          phone: form.phone,
          role: form.role,
          status: "מאושר",
        });
        if (profileError) { setFormError(profileError.message); setSaving(false); return; }
        setFormSuccess(`✅ המשתמש "${form.full_name}" נוסף! סיסמה: ${form.password}`);
        setForm({ full_name: "", email: "", password: "Aa123456!", role: "ngs_worker", phone: "" });
        await load();
      }
    } catch (e) {
      setFormError("שגיאה ביצירת המשתמש");
    }
    setSaving(false);
  }

  async function saveName(id: string) {
    if (!editingNameValue.trim()) return;
    await supabase.from("profiles").update({ full_name: editingNameValue.trim() }).eq("id", id);
    setEditingNameId(null);
    await load();
  }

  async function rejectUser(id: string) {
    if (!confirm("לדחות את הבקשה?")) return;
    await supabase.from("profiles").update({ status: "נדחה" }).eq("id", id);
    await load();
  }

  async function assignApartment(id: string, apartment_id: string) {
    await supabase.from("profiles").update({ apartment_id: apartment_id || null }).eq("id", id);
    await load();
  }

  const pending = users.filter(u => u.status === "ממתין לאישור");
  const approved = users.filter(u => u.status === "מאושר");

  const roleLabel: Record<string, string> = {
    admin: "מנהל", ngs_worker: 'עובד נג"ש', owner: "בעל נכס", tenant: "דייר"
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>

      {/* כרטיסי סיכום */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: 'סה״כ משתמשים', value: users.length, color: "#d5b57a" },
          { label: "מנהלים", value: users.filter(u => u.role === "admin").length, color: "#60a5fa" },
          { label: 'עובדי נג"ש', value: users.filter(u => u.role === "ngs_worker").length, color: "#a78bfa" },
          { label: "ממתינים", value: pending.length, color: "#f87171" },
        ].map(item => (
          <div key={item.label} style={{ background: "#1e293b", borderRadius: 16, padding: "16px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* טופס הוספת משתמש */}
      <div className="card">
        <div className="section-top">
          <div><h2 className="card-title">ניהול משתמשים</h2><div className="muted">הוספה, עריכת תפקידים והרשאות</div></div>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setFormError(""); setFormSuccess(""); }}>+ הוסף משתמש</button>
        </div>

        {showForm && (
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 18, display: "grid", gap: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>👤 משתמש חדש</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label>שם מלא *</label><input className="input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="ישראל ישראלי" /></div>
              <div className="field"><label>אימייל *</label><input className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="user@email.com" /></div>
              <div className="field"><label>סיסמה ראשונית</label><input className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
              <div className="field"><label>טלפון</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="050-0000000" /></div>
              <div className="field" style={{ gridColumn: "span 2" }}>
                <label>תפקיד והרשאות</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                  {[
                    { value: "ngs_worker", label: '👷 עובד נג"ש', desc: 'רואה רק את מודול נג"ש' },
                    { value: "admin", label: "👑 מנהל", desc: "גישה מלאה לכל המערכת" },
                    { value: "owner", label: "🏠 בעל נכס", desc: "רואה רק את הנכסים שלו" },
                    { value: "tenant", label: "🔑 דייר", desc: "רואה רק את הדירה שלו" },
                  ].map(opt => (
                    <div key={opt.value} onClick={() => setForm({...form, role: opt.value})}
                      style={{ border: `2px solid ${form.role === opt.value ? "#c9a227" : "#e2e8f0"}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", background: form.role === opt.value ? "#fef9ec" : "#fff" }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {formError && <div style={{ color: "#dc2626", fontSize: 14 }}>{formError}</div>}
            {formSuccess && <div style={{ color: "#16a34a", fontSize: 14, fontWeight: 700 }}>{formSuccess}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={addUser} disabled={saving}>{saving ? "יוצר..." : "➕ צור משתמש"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}
      </div>

      {/* ממתינים לאישור */}
      {pending.length > 0 && (
        <div className="card">
          <h3 className="card-title">⏳ ממתינים לאישור ({pending.length})</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>שם</th><th>תפקיד</th><th>תאריך</th><th>פעולות</th></tr></thead>
              <tbody>
                {pending.map(u => (
                  <tr key={u.id} style={{ background: "#fffbeb" }}>
                    <td style={{ fontWeight: 700 }}>{u.full_name}</td>
                    <td><Badge value={roleLabel[u.role] || u.role} /></td>
                    <td>{new Date(u.created_at).toLocaleDateString("he-IL")}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: "4px 12px" }} onClick={async () => { await supabase.from("profiles").update({ status: "מאושר" }).eq("id", u.id); await load(); }}>✅ אשר</button>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px", color: "#dc2626" }} onClick={() => rejectUser(u.id)}>❌ דחה</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* משתמשים מאושרים */}
      <div className="card">
        <h3 className="card-title">✅ משתמשים פעילים ({approved.length})</h3>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>טוען...</div>
        : approved.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>אין משתמשים עדיין</div>
        : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>שם</th><th>טלפון</th><th>תפקיד</th><th>הרשאות</th><th>דירה משויכת</th><th>פעולות</th></tr></thead>
              <tbody>
                {approved.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>
                      {editingNameId === u.id ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input
                            className="input"
                            style={{ padding: "4px 8px", fontSize: 13, width: 140 }}
                            value={editingNameValue}
                            onChange={e => setEditingNameValue(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveName(u.id); if (e.key === "Escape") setEditingNameId(null); }}
                            autoFocus
                          />
                          <button className="btn btn-primary" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => saveName(u.id)}>✓</button>
                          <button className="btn btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => setEditingNameId(null)}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{u.full_name}</span>
                          <button onClick={() => { setEditingNameId(u.id); setEditingNameValue(u.full_name || ""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#94a3b8" }}>✏️</button>
                        </div>
                      )}
                    </td>
                    <td>{u.phone || "-"}</td>
                    <td>
                      <select style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 8px", fontSize: 13 }}
                        value={u.role || "tenant"}
                        onChange={e => supabase.from("profiles").update({ role: e.target.value }).eq("id", u.id).then(() => load())}>
                        <option value="ngs_worker">עובד נג"ש</option>
                        <option value="tenant">דייר</option>
                        <option value="owner">בעל נכס</option>
                        <option value="admin">מנהל</option>
                      </select>
                    </td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>{rolePermissions[u.role] || "-"}</td>
                    <td>
                      {u.role === "tenant" || u.role === "owner" ? (
                        <select style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 8px", fontSize: 13 }}
                          value={u.apartment_id || ""}
                          onChange={e => assignApartment(u.id, e.target.value)}>
                          <option value="">לא משויך</option>
                          {apts.map((a: any) => <option key={a.id} value={a.id}>{a.buildings?.name} / {a.apartment_number}</option>)}
                        </select>
                      ) : <span style={{ color: "#94a3b8", fontSize: 13 }}>לא רלוונטי</span>}
                    </td>
                    <td>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px", color: "#dc2626" }} onClick={() => rejectUser(u.id)}>הסר</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function Leases() {
  const [leases, setLeases] = useState<any[]>([]);
  const [apts, setApts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("פעיל");
  const [form, setForm] = useState({
    apartment_id: "", tenant_name: "", start_date: "", end_date: "",
    rent_amount: "", deposit: "", status: "פעיל", notes: ""
  });

  async function load() {
    setLoading(true);
    const { data: ls } = await supabase.from("leases").select("*, apartments(apartment_number, buildings(name))").order("created_at", { ascending: false });
    const { data: ap } = await supabase.from("apartments").select("id, apartment_number, buildings(name)");
    setLeases(ls || []);
    setApts(ap || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function addLease() {
    if (!form.tenant_name) return;
    setSaving(true);
    await supabase.from("leases").insert({
      apartment_id: form.apartment_id || null,
      tenant_name: form.tenant_name,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      rent_amount: parseFloat(form.rent_amount) || 0,
      deposit: parseFloat(form.deposit) || 0,
      status: form.status,
      notes: form.notes
    });
    setForm({ apartment_id: "", tenant_name: "", start_date: "", end_date: "", rent_amount: "", deposit: "", status: "פעיל", notes: "" });
    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function uploadDocument(leaseId: string, file: File) {
    setUploadingId(leaseId);
    const ext = file.name.split(".").pop();
    const path = `leases/${leaseId}.${ext}`;
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      await supabase.from("leases").update({ document_url: urlData.publicUrl }).eq("id", leaseId);
      await load();
    }
    setUploadingId(null);
  }

  async function deleteLease(id: string) {
    if (!confirm("למחוק את החוזה?")) return;
    await supabase.from("leases").delete().eq("id", id);
    await load();
  }

  const filtered = filter === "הכל" ? leases : leases.filter(l => l.status === filter);

  function daysLeft(endDate: string) {
    if (!endDate) return null;
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card">
        <div className="section-top">
          <div><h2 className="card-title">חוזים</h2><div className="muted">ניהול חוזי שכירות ותשלומים</div></div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ חוזה חדש</button>
        </div>

        {showForm && (
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 18, display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>חוזה חדש</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>דירה</label>
                <select className="input" value={form.apartment_id} onChange={e => setForm({...form, apartment_id: e.target.value})}>
                  <option value="">בחר דירה</option>
                  {apts.map((a: any) => <option key={a.id} value={a.id}>{a.buildings?.name} / {a.apartment_number}</option>)}
                </select>
              </div>
              <div className="field"><label>שם דייר</label><input className="input" value={form.tenant_name} onChange={e => setForm({...form, tenant_name: e.target.value})} placeholder="דני לוי" /></div>
              <div className="field">
                <label>סטטוס</label>
                <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option>פעיל</option><option>הסתיים</option><option>בוטל</option>
                </select>
              </div>
              <div className="field"><label>תאריך התחלה</label><input className="input" type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
              <div className="field"><label>תאריך סיום</label><input className="input" type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
              <div className="field"><label>שכר דירה (₪)</label><input className="input" type="number" value={form.rent_amount} onChange={e => setForm({...form, rent_amount: e.target.value})} placeholder="5200" /></div>
              <div className="field"><label>פיקדון (₪)</label><input className="input" type="number" value={form.deposit} onChange={e => setForm({...form, deposit: e.target.value})} placeholder="5200" /></div>
              <div className="field" style={{ gridColumn: "span 2" }}><label>הערות</label><input className="input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="הערות לחוזה..." /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={addLease} disabled={saving}>{saving ? "שומר..." : "שמור חוזה"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}

        <div className="chips" style={{ marginBottom: 16 }}>
          {["הכל", "פעיל", "הסתיים", "בוטל"].map(f => (
            <button key={f} className={`btn ${filter === f ? "btn-dark" : "btn-outline"}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>טוען...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>אין חוזים עדיין</div>
            <div>לחץ על "חוזה חדש" כדי להוסיף</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>דירה</th><th>דייר</th><th>התחלה</th><th>סיום</th><th>ימים נותרים</th><th>שכירות</th><th>פיקדון</th><th>סטטוס</th><th>מסמך</th><th>פעולות</th></tr></thead>
              <tbody>
                {filtered.map((l) => {
                  const days = daysLeft(l.end_date);
                  return (
                    <tr key={l.id}>
                      <td>{l.apartments?.buildings?.name} / {l.apartments?.apartment_number}</td>
                      <td style={{ fontWeight: 700 }}>{l.tenant_name}</td>
                      <td>{l.start_date ? new Date(l.start_date).toLocaleDateString("he-IL") : "-"}</td>
                      <td>{l.end_date ? new Date(l.end_date).toLocaleDateString("he-IL") : "-"}</td>
                      <td style={{ color: days !== null && days < 30 ? "#dc2626" : "#16a34a", fontWeight: 700 }}>
                        {days !== null ? (days < 0 ? "פג תוקף" : days + " ימים") : "-"}
                      </td>
                      <td>{currency(l.rent_amount)}</td>
                      <td>{currency(l.deposit)}</td>
                      <td><Badge value={l.status} /></td>
                      <td>
                        {l.document_url ? (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <a href={l.document_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}>📄 פתח</a>
                            <label style={{ cursor: "pointer", fontSize: 12, color: "#64748b" }}>
                              🔄
                              <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadDocument(l.id, e.target.files[0])} />
                            </label>
                          </div>
                        ) : (
                          <label style={{ cursor: "pointer" }}>
                            <span className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}>
                              {uploadingId === l.id ? "מעלה..." : "📎 העלה"}
                            </span>
                            <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadDocument(l.id, e.target.files[0])} />
                          </label>
                        )}
                      </td>
                      <td><button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => deleteLease(l.id)}>מחק</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function ServiceRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("חדשה");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [form, setForm] = useState({
    apartment_id: "", apartment_manual: "", issue: "", description: "",
    urgency: "בינונית", status: "חדשה", cost: "", vendor: ""
  });

  async function load() {
    setLoading(true);
    const { data: reqs } = await supabase.from("service_requests").select("*, apartments(apartment_number, buildings(name))").order("created_at", { ascending: false });
    const { data: apts } = await supabase.from("apartments").select("id, apartment_number, buildings(name)");
    setRequests(reqs || []);
    setApartments(apts || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addRequest() {
    if (!form.issue) return;
    setSaving(true);
    const apt = apartments.find((a: any) => a.id === form.apartment_id);
    await supabase.from("service_requests").insert({
      apartment_id: form.apartment_id || null,
      apartment_manual: form.apartment_manual || null,
      issue: form.issue,
      description: form.description,
      urgency: form.urgency,
      status: form.status,
      cost: parseFloat(form.cost) || 0,
      vendor: form.vendor
    });
    // שליחת מייל התראה
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "new_service_request",
        data: {
          issue: form.issue,
          apartment: form.apartment_manual || (apt ? `${apt.buildings?.name} / ${apt.apartment_number}` : "-"),
          urgency: form.urgency,
          description: form.description,
        }
      })
    }).catch(() => {});
    setForm({ apartment_id: "", apartment_manual: "", issue: "", description: "", urgency: "בינונית", status: "חדשה", cost: "", vendor: "" });
    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("service_requests").update({ status }).eq("id", id);
    await load();
  }

  async function deleteRequest(id: string) {
    if (!confirm("למחוק את הקריאה?")) return;
    await supabase.from("service_requests").delete().eq("id", id);
    await load();
  }

  async function transferToNgs(r: any) {
    const apartment = r.apartments?.buildings?.name ? `${r.apartments.buildings.name} / ${r.apartments.apartment_number}` : "";
    await supabase.from("ngs_service_calls").insert({
      issue: r.issue,
      client_name: apartment,
      urgency: r.urgency,
      status: "חדשה",
      notes: r.description || "",
      source_request_id: r.id,
    });
    await supabase.from("service_requests").update({ status: "בטיפול" }).eq("id", r.id);
    await load();
    alert("✅ הקריאה הועברה לנג\"ש בהצלחה!");
  }

  const filtered = filter === "הכל" ? requests : requests.filter(r => r.status === filter);

  return (
    <>
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card">
        <div className="section-top">
          <div><h2 className="card-title">קריאות שירות</h2><div className="muted">ניהול כל הקריאות, תיקונים ובעלי מקצוע</div></div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ קריאה חדשה</button>
        </div>

        {showForm && (
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 18, display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>קריאת שירות חדשה</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>דירה</label>
                <select className="input" value={form.apartment_id} onChange={e => setForm({...form, apartment_id: e.target.value, apartment_manual: ""})}>
                  <option value="">בחר דירה מהרשימה</option>
                  {apartments.map((a: any) => <option key={a.id} value={a.id}>{a.buildings?.name} / {a.apartment_number}</option>)}
                </select>
              </div>
              <div className="field">
                <label>או כתוב כתובת ידנית</label>
                <input className="input" value={form.apartment_manual || ""} onChange={e => setForm({...form, apartment_manual: e.target.value, apartment_id: ""})} placeholder="למשל: רחוב הרצל 5 / דירה 3" disabled={!!form.apartment_id} style={{ opacity: form.apartment_id ? 0.5 : 1 }} />
              </div>
              <div className="field"><label>נושא התקלה</label><input className="input" value={form.issue} onChange={e => setForm({...form, issue: e.target.value})} placeholder="נזילה במקלחת" /></div>
              <div className="field">
                <label>דחיפות</label>
                <select className="input" value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})}>
                  <option>נמוכה</option><option>בינונית</option><option>גבוהה</option><option>דחוף מאוד</option>
                </select>
              </div>
              <div className="field">
                <label>סטטוס</label>
                <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option>חדשה</option><option>בטיפול</option><option>ממתין לבעל מקצוע</option><option>הושלם</option>
                </select>
              </div>
              <div className="field"><label>ספק / בעל מקצוע</label><input className="input" value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} placeholder="אינסטלטור משה" /></div>
              <div className="field"><label>עלות (₪)</label><input className="input" type="number" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} placeholder="450" /></div>
            </div>
            <div className="field"><label>תיאור מפורט</label><textarea className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="תיאור התקלה..." style={{ minHeight: 80, resize: "vertical" }} /></div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={addRequest} disabled={saving}>{saving ? "שומר..." : "שמור קריאה"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16, background: "#1e293b", borderRadius: 16, padding: "14px 20px" }}>
            {[
              { label: 'סה״כ', value: requests.length, color: "#d5b57a" },
              { label: "חדשות", value: requests.filter(r => r.status === "חדשה").length, color: "#60a5fa" },
              { label: "בטיפול", value: requests.filter(r => r.status === "בטיפול").length, color: "#fbbf24" },
              { label: "ממתין לבעל מקצוע", value: requests.filter(r => r.status === "ממתין לבעל מקצוע").length, color: "#f87171" },
              { label: "הושלמו", value: requests.filter(r => r.status === "הושלם").length, color: "#34d399" },
            ].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="chips" style={{ marginBottom: 16 }}>
          {["הכל", "חדשה", "בטיפול", "ממתין לבעל מקצוע", "הושלם"].map(f => (
            <button key={f} className={`btn ${filter === f ? "btn-dark" : "btn-outline"}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>טוען...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>אין קריאות שירות</div>
            <div>לחץ על "קריאה חדשה" כדי להוסיף</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>תאריך</th><th>דירה</th><th>תקלה</th><th>דחיפות</th><th>ספק</th><th>עלות</th><th>סטטוס</th><th>פעולות</th></tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleDateString("he-IL")}</td>
                    <td>{r.apartment_manual || (r.apartments?.buildings?.name ? `${r.apartments.buildings.name} / ${r.apartments.apartment_number}` : "-")}</td>
                    <td style={{ fontWeight: 700 }}>{r.issue}</td>
                    <td><Badge value={r.urgency} /></td>
                    <td>{r.vendor || "-"}</td>
                    <td>{r.cost ? currency(r.cost) : "-"}</td>
                    <td>
                      <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 8px", fontSize: 13 }}>
                        <option>חדשה</option><option>בטיפול</option><option>ממתין לבעל מקצוע</option><option>הושלם</option>
                      </select>
                    </td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => setSelectedRequest(r)}>👁 צפייה</button>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "#c9a227", borderColor: "#c9a227" }} onClick={() => transferToNgs(r)}>🏗 נג"ש</button>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => deleteRequest(r.id)}>מחק</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {/* מודל צפייה בקריאה */}
    {selectedRequest && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 560, maxHeight: "85vh", overflow: "auto" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>🔧 {selectedRequest.issue}</h3>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{selectedRequest.apartment_manual || (selectedRequest.apartments?.buildings?.name ? `${selectedRequest.apartments.buildings.name} / ${selectedRequest.apartments.apartment_number}` : "-")}</div>
            </div>
            <button onClick={() => setSelectedRequest(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}>×</button>
          </div>
          <div style={{ padding: "20px 24px", display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>סטטוס</div>
                <Badge value={selectedRequest.status} />
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>דחיפות</div>
                <Badge value={selectedRequest.urgency} />
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>ספק / בעל מקצוע</div>
                <div style={{ fontWeight: 700 }}>{selectedRequest.vendor || "-"}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>עלות</div>
                <div style={{ fontWeight: 700 }}>{selectedRequest.cost ? currency(selectedRequest.cost) : "-"}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>תאריך פתיחה</div>
                <div style={{ fontWeight: 700 }}>{new Date(selectedRequest.created_at).toLocaleDateString("he-IL")}</div>
              </div>
            </div>
            {selectedRequest.description && (
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>תיאור הבעיה</div>
                <div style={{ fontSize: 14, lineHeight: 1.7 }}>{selectedRequest.description}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <select value={selectedRequest.status} onChange={async e => { await updateStatus(selectedRequest.id, e.target.value); setSelectedRequest({...selectedRequest, status: e.target.value}); }} style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", fontSize: 14 }}>
                <option>חדשה</option><option>בטיפול</option><option>ממתין לבעל מקצוע</option><option>הושלם</option>
              </select>
              <button className="btn btn-outline" onClick={() => setSelectedRequest(null)}>סגור</button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export function Buildings({ openBuilding }: { openBuilding: (id: any) => void }) {
  const [dbBuildings, setDbBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newFloors, setNewFloors] = useState("1");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function loadBuildings() {
    setLoading(true);
    const { data } = await supabase.from("buildings").select("*").order("created_at", { ascending: false });
    setDbBuildings(data || []);
    setLoading(false);
  }

  useEffect(() => { loadBuildings(); }, []);

  async function addBuilding() {
    if (!newName || !newCity) return;
    setSaving(true);
    await supabase.from("buildings").insert({ name: newName, city: newCity, floors: parseInt(newFloors) });
    setNewName(""); setNewCity(""); setNewFloors("1");
    setShowForm(false);
    await loadBuildings();
    setSaving(false);
  }

  async function deleteBuilding(id: string) {
    await supabase.from("buildings").delete().eq("id", id);
    setDeleteId(null);
    await loadBuildings();
  }

  async function saveEdit() {
    if (!editId) return;
    setSavingEdit(true);
    await supabase.from("buildings").update({
      name: editForm.name,
      city: editForm.city,
      floors: parseInt(editForm.floors),
    }).eq("id", editId);
    setEditId(null);
    setEditForm(null);
    await loadBuildings();
    setSavingEdit(false);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card">
        <div className="section-top">
          <div><h2 className="card-title">מבנים</h2><div className="muted">ניהול הבניינים שבהם יש לך יחידות</div></div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף מבנה</button>
        </div>

        {showForm && (
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 18, display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>מבנה חדש</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 12 }}>
              <div className="field"><label>שם המבנה</label><input className="input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="הרצל 10" /></div>
              <div className="field"><label>עיר</label><input className="input" value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="תל אביב" /></div>
              <div className="field"><label>קומות</label><input className="input" type="number" value={newFloors} onChange={e => setNewFloors(e.target.value)} min="1" /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={addBuilding} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>טוען...</div>
        ) : dbBuildings.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>אין מבנים עדיין</div>
            <div>לחץ על "הוסף מבנה" כדי להתחיל</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>שם המבנה</th><th>עיר</th><th>קומות</th><th>תאריך הוספה</th><th>פעולות</th></tr></thead>
              <tbody>
                {dbBuildings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 800 }}>{b.name}</td>
                    <td>{b.city}</td>
                    <td>{b.floors}</td>
                    <td>{new Date(b.created_at).toLocaleDateString("he-IL")}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => openBuilding(b.id)}>👁 צפייה</button>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => { setEditId(b.id); setEditForm({ name: b.name, city: b.city, floors: String(b.floors) }); }}>✏️ עריכה</button>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px", color: "#dc2626" }} onClick={() => setDeleteId(b.id)}>🗑 מחק</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 380, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑</div>
            <h3 style={{ margin: "0 0 8px" }}>מחיקת מבנה</h3>
            <p style={{ color: "#64748b", marginBottom: 24 }}>האם אתה בטוח? המחיקה תמחק גם את כל הדירות במבנה.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn btn-primary" style={{ background: "#dc2626" }} onClick={() => deleteBuilding(deleteId)}>כן, מחק</button>
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {editId && editForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 480, width: "95%" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 20 }}>✏️ עריכת מבנה</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <div className="field"><label>שם המבנה</label><input className="input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
              <div className="field"><label>עיר</label><input className="input" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} /></div>
              <div className="field"><label>מספר קומות</label><input className="input" type="number" value={editForm.floors} onChange={e => setEditForm({...editForm, floors: e.target.value})} min="1" /></div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="btn btn-primary" onClick={saveEdit} disabled={savingEdit}>{savingEdit ? "שומר..." : "💾 שמור"}</button>
              <button className="btn btn-outline" onClick={() => { setEditId(null); setEditForm(null); }}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BuildingDetails({ buildingId, back, openApartment }: { buildingId: any; back: () => void; openApartment: (id: any) => void }) {
  const [building, setBuilding] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [addForm, setAddForm] = useState({ apartment_number: "", floor: "0", rooms: "3", status: "פנוי", rent_amount: "", owner_name: "", tenant_name: "", arnona_number: "", arnona_cost: "", arnona_payer: "דייר", electric_meter: "", electric_payer: "דייר", payment_method: "העברה בנקאית" });

  useEffect(() => {
    load();
  }, [buildingId]);

  async function load() {
    setLoading(true);
    const { data: b } = await supabase.from("buildings").select("*").eq("id", buildingId).single();
    const { data: apts } = await supabase.from("apartments").select("*").eq("building_id", buildingId).order("floor").order("apartment_number");
    setBuilding(b);
    setUnits(apts || []);
    setLoading(false);
  }

  async function addUnit() {
    if (!addForm.apartment_number) return;
    setSaving(true);
    await supabase.from("apartments").insert({
      building_id: buildingId,
      apartment_number: addForm.apartment_number,
      floor: parseInt(addForm.floor),
      rooms: parseFloat(addForm.rooms),
      status: addForm.status,
      rent_amount: parseFloat(addForm.rent_amount) || 0,
      owner_name: addForm.owner_name,
      tenant_name: addForm.tenant_name,
      arnona_number: addForm.arnona_number,
      arnona_cost: parseFloat(addForm.arnona_cost) || 0,
      arnona_payer: addForm.arnona_payer,
      electric_meter: addForm.electric_meter,
      electric_payer: addForm.electric_payer,
      payment_method: addForm.payment_method,
    });
    setAddForm({ apartment_number: "", floor: "0", rooms: "3", status: "פנוי", rent_amount: "", owner_name: "", tenant_name: "", arnona_number: "", arnona_cost: "", arnona_payer: "דייר", electric_meter: "", electric_payer: "דייר", payment_method: "העברה בנקאית" });
    setShowAddForm(false);
    await load();
    setSaving(false);
  }

  async function saveUnit() {
    if (!editingUnit) return;
    setSaving(true);
    await supabase.from("apartments").update({
      apartment_number: editingUnit.apartment_number,
      floor: parseInt(editingUnit.floor),
      rooms: parseFloat(editingUnit.rooms),
      status: editingUnit.status,
      rent_amount: parseFloat(editingUnit.rent_amount) || 0,
      owner_name: editingUnit.owner_name,
      tenant_name: editingUnit.tenant_name,
      arnona_number: editingUnit.arnona_number || "",
      arnona_cost: parseFloat(editingUnit.arnona_cost) || 0,
      arnona_payer: editingUnit.arnona_payer || "דייר",
      electric_meter: editingUnit.electric_meter || "",
      electric_payer: editingUnit.electric_payer || "דייר",
      payment_method: editingUnit.payment_method || "העברה בנקאית",
    }).eq("id", editingUnit.id);
    setEditingUnit(null);
    await load();
    setSaving(false);
  }

  async function deleteUnit(id: string) {
    if (!confirm("למחוק את הדירה?")) return;
    await supabase.from("apartments").delete().eq("id", id);
    await load();
  }

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>טוען...</div>;
  if (!building) return <div style={{ padding: 60, textAlign: "center", color: "#dc2626" }}>לא נמצא מבנה</div>;

  const totalIncome = units.reduce((sum, u) => sum + (u.fee_type === "percent" ? (u.rent_amount * (u.fee_value || 8)) / 100 : (u.fee_value || 0)), 0);
  const rentedUnits = units.filter(u => u.status === "מושכר").length;
  const vacantUnits = units.filter(u => u.status === "פנוי").length;
  const floors = Array.from(new Set(units.map(u => u.floor))).sort((a: any, b: any) => a - b);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="detail-top">
        <div>
          <button className="back-link" onClick={back}>← חזרה לרשימת מבנים</button>
          <h2 style={{ margin: "8px 0", fontSize: 34 }}>{building.name}</h2>
          <div className="muted">{building.city} · {building.floors} קומות</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>+ הוסף דירה</button>
      </div>

      {/* טופס הוספת דירה */}
      {showAddForm && (
        <div className="card" style={{ background: "#f8fafc" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>➕ דירה חדשה ב{building.name}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="field"><label>מספר דירה *</label><input className="input" value={addForm.apartment_number} onChange={e => setAddForm({...addForm, apartment_number: e.target.value})} placeholder="1א" /></div>
            <div className="field"><label>קומה</label><input className="input" type="number" value={addForm.floor} onChange={e => setAddForm({...addForm, floor: e.target.value})} /></div>
            <div className="field"><label>חדרים</label><input className="input" type="number" value={addForm.rooms} onChange={e => setAddForm({...addForm, rooms: e.target.value})} step="0.5" /></div>
            <div className="field"><label>סטטוס</label><select className="input" value={addForm.status} onChange={e => setAddForm({...addForm, status: e.target.value})}><option>פנוי</option><option>מושכר</option></select></div>
            <div className="field"><label>שכר דירה ₪</label><input className="input" type="number" value={addForm.rent_amount} onChange={e => setAddForm({...addForm, rent_amount: e.target.value})} placeholder="5000" /></div>
            <div className="field"><label>בעל נכס</label><input className="input" value={addForm.owner_name} onChange={e => setAddForm({...addForm, owner_name: e.target.value})} placeholder="שם בעל הנכס" /></div>
            <div className="field"><label>דייר</label><input className="input" value={addForm.tenant_name} onChange={e => setAddForm({...addForm, tenant_name: e.target.value})} placeholder="שם הדייר" /></div>
            <div className="field"><label>אמצעי תשלום</label><select className="input" value={addForm.payment_method} onChange={e => setAddForm({...addForm, payment_method: e.target.value})}><option>העברה בנקאית</option><option>מזומן</option><option>צ׳קים</option></select></div>
          </div>
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, marginTop: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#475569" }}>🏛️ ארנונה</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field"><label>מספר משלם ארנונה</label><input className="input" value={addForm.arnona_number} onChange={e => setAddForm({...addForm, arnona_number: e.target.value})} placeholder="123456" /></div>
              <div className="field"><label>עלות ארנונה ₪/חודש</label><input className="input" type="number" value={addForm.arnona_cost} onChange={e => setAddForm({...addForm, arnona_cost: e.target.value})} placeholder="500" /></div>
              <div className="field"><label>מי משלם ארנונה</label><select className="input" value={addForm.arnona_payer} onChange={e => setAddForm({...addForm, arnona_payer: e.target.value})}><option>דייר</option><option>בעל נכס</option></select></div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#475569" }}>⚡ חשמל</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label>מספר מונה חשמל</label><input className="input" value={addForm.electric_meter} onChange={e => setAddForm({...addForm, electric_meter: e.target.value})} placeholder="12345678" /></div>
              <div className="field"><label>מי משלם חשמל</label><select className="input" value={addForm.electric_payer} onChange={e => setAddForm({...addForm, electric_payer: e.target.value})}><option>דייר</option><option>בעל נכס</option></select></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={addUnit} disabled={saving}>{saving ? "שומר..." : "💾 שמור דירה"}</button>
            <button className="btn btn-outline" onClick={() => setShowAddForm(false)}>ביטול</button>
          </div>
        </div>
      )}

      <div className="detail-kpis">
        <KPI title="שם המבנה" value={building.name} subtitle={building.city} />
        <KPI title='סה״כ יחידות' value={String(units.length)} subtitle="בבניין הזה" />
        <KPI title="יחידות מושכרות" value={String(rentedUnits)} subtitle="פעילות כרגע" />
        <KPI title="יחידות פנויות" value={String(vacantUnits)} subtitle="דורש שיווק" />
        <KPI title="הכנסה חודשית" value={currency(totalIncome)} subtitle="עמלת ניהול" />
      </div>

      <div className="card">
        <h3 className="card-title">יחידות לפי קומה</h3>
        {units.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 40 }}>🏠</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>אין יחידות עדיין</div>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowAddForm(true)}>+ הוסף דירה ראשונה</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            {floors.map((floor: any) => {
              const floorUnits = units.filter(u => u.floor === floor);
              return (
                <div key={floor} style={{ border: "1px solid #e8eef6", borderRadius: 20, padding: 18, background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>קומה {floor} <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400 }}>({floorUnits.length} יחידות)</span></div>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {floorUnits.map(unit => (
                      <div key={unit.id}>
                        {editingUnit?.id === unit.id ? (
                          // מצב עריכה
                          <div style={{ border: "2px solid #c9a227", borderRadius: 16, padding: 16, background: "#fef9ec" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                              <div className="field"><label>מספר דירה</label><input className="input" value={editingUnit.apartment_number} onChange={e => setEditingUnit({...editingUnit, apartment_number: e.target.value})} /></div>
                              <div className="field"><label>קומה</label><input className="input" type="number" value={editingUnit.floor} onChange={e => setEditingUnit({...editingUnit, floor: e.target.value})} /></div>
                              <div className="field"><label>חדרים</label><input className="input" type="number" value={editingUnit.rooms} onChange={e => setEditingUnit({...editingUnit, rooms: e.target.value})} step="0.5" /></div>
                              <div className="field"><label>סטטוס</label><select className="input" value={editingUnit.status} onChange={e => setEditingUnit({...editingUnit, status: e.target.value})}><option>פנוי</option><option>מושכר</option></select></div>
                              <div className="field"><label>שכר דירה ₪</label><input className="input" type="number" value={editingUnit.rent_amount || ""} onChange={e => setEditingUnit({...editingUnit, rent_amount: e.target.value})} /></div>
                              <div className="field"><label>בעל נכס</label><input className="input" value={editingUnit.owner_name || ""} onChange={e => setEditingUnit({...editingUnit, owner_name: e.target.value})} /></div>
                              <div className="field"><label>דייר</label><input className="input" value={editingUnit.tenant_name || ""} onChange={e => setEditingUnit({...editingUnit, tenant_name: e.target.value})} /></div>
                              <div className="field"><label>אמצעי תשלום</label><select className="input" value={editingUnit.payment_method || "העברה בנקאית"} onChange={e => setEditingUnit({...editingUnit, payment_method: e.target.value})}><option>העברה בנקאית</option><option>מזומן</option><option>צ׳קים</option></select></div>
                            </div>
                            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, marginBottom: 12 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#475569" }}>🏛️ ארנונה</div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                                <div className="field"><label>מספר משלם</label><input className="input" value={editingUnit.arnona_number || ""} onChange={e => setEditingUnit({...editingUnit, arnona_number: e.target.value})} /></div>
                                <div className="field"><label>עלות ₪/חודש</label><input className="input" type="number" value={editingUnit.arnona_cost || ""} onChange={e => setEditingUnit({...editingUnit, arnona_cost: e.target.value})} /></div>
                                <div className="field"><label>מי משלם</label><select className="input" value={editingUnit.arnona_payer || "דייר"} onChange={e => setEditingUnit({...editingUnit, arnona_payer: e.target.value})}><option>דייר</option><option>בעל נכס</option></select></div>
                              </div>
                            </div>
                            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, marginBottom: 12 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#475569" }}>⚡ חשמל</div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <div className="field"><label>מספר מונה</label><input className="input" value={editingUnit.electric_meter || ""} onChange={e => setEditingUnit({...editingUnit, electric_meter: e.target.value})} /></div>
                                <div className="field"><label>מי משלם</label><select className="input" value={editingUnit.electric_payer || "דייר"} onChange={e => setEditingUnit({...editingUnit, electric_payer: e.target.value})}><option>דייר</option><option>בעל נכס</option></select></div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="btn btn-primary" onClick={saveUnit} disabled={saving}>{saving ? "שומר..." : "💾 שמור"}</button>
                              <button className="btn btn-outline" onClick={() => setEditingUnit(null)}>ביטול</button>
                            </div>
                          </div>
                        ) : (
                          // מצב תצוגה
                          <div style={{ border: "1px solid #e8eef6", borderRadius: 16, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "#fbfcfe" }}>
                            <div style={{ display: "flex", gap: 20, alignItems: "center", flex: 1, flexWrap: "wrap" }}>
                              <div><div style={{ fontWeight: 800, fontSize: 15 }}>דירה {unit.apartment_number}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>{unit.rooms} חדרים</div></div>
                              <div><div style={{ fontSize: 12, color: "#64748b" }}>דייר</div><div style={{ fontWeight: 600 }}>{unit.tenant_name || "-"}</div></div>
                              <div><div style={{ fontSize: 12, color: "#64748b" }}>בעל נכס</div><div style={{ fontWeight: 600 }}>{unit.owner_name || "-"}</div></div>
                              <div><div style={{ fontSize: 12, color: "#64748b" }}>שכירות</div><div style={{ fontWeight: 600 }}>{unit.rent_amount ? currency(unit.rent_amount) : "-"}</div></div>
                              {unit.payment_method && <div><div style={{ fontSize: 12, color: "#64748b" }}>תשלום</div><div style={{ fontWeight: 600 }}>{unit.payment_method}</div></div>}
                              {unit.arnona_number && <div><div style={{ fontSize: 12, color: "#64748b" }}>🏛️ ארנונה</div><div style={{ fontWeight: 600 }}>{unit.arnona_number} · {unit.arnona_cost ? currency(unit.arnona_cost) : ""} · {unit.arnona_payer}</div></div>}
                              {unit.electric_meter && <div><div style={{ fontSize: 12, color: "#64748b" }}>⚡ מונה</div><div style={{ fontWeight: 600 }}>{unit.electric_meter} · {unit.electric_payer}</div></div>}
                              <Badge value={unit.status} />
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => openApartment(unit.id)}>פתח</button>
                              <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setEditingUnit({...unit, floor: String(unit.floor), rooms: String(unit.rooms), rent_amount: String(unit.rent_amount || "")})}>✏️</button>
                              <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "#dc2626" }} onClick={() => deleteUnit(unit.id)}>🗑</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* לוח תפוסה */}
      {units.length > 0 && (
        <div className="card">
          <h3 className="card-title">לוח תפוסה</h3>
          <div className="muted" style={{ marginBottom: 16 }}>🟢 מושכר · 🟡 פנוי</div>
          <div style={{ display: "grid", gap: 18 }}>
            {[...floors].reverse().map((floor: any) => {
              const floorUnits = units.filter(u => u.floor === floor);
              return (
                <div key={floor} className="building-floor-card">
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14 }}>קומה {floor}</div>
                  <div className="building-board-row">
                    {floorUnits.map(unit => (
                      <div key={unit.id} className="building-unit-box" onClick={() => openApartment(unit.id)}
                        style={{ background: unit.status === "פנוי" ? "#eab308" : "#16a34a" }}>
                        <div>דירה {unit.apartment_number}</div>
                        <div style={{ fontSize: 12, marginTop: 6 }}>{unit.tenant_name || "פנוי"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


export function Apartments({ openApartment }: { openApartment: (id: any) => void }) {
  const [filter, setFilter] = useState("הכל");
  const [query, setQuery] = useState("");
  const [dbApartments, setDbApartments] = useState<any[]>([]);
  const [dbBuildings, setDbBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFilter, setReportFilter] = useState("הכל");
  const [reportBuilding, setReportBuilding] = useState("הכל");
  const [reportFields, setReportFields] = useState<string[]>(["address", "floor", "apartment_number", "owner_name", "tenant_name", "rent_amount", "lease_end", "status"]);
  const [form, setForm] = useState({
    building_id: "", apartment_number: "", floor: "0", rooms: "3",
    status: "פנוי", rent_amount: "", owner_name: "", tenant_name: "",
    tenant_phone: "", lease_end: "", fee_type: "fixed", fee_value: "0", notes: ""
  });

  const [dbOwners, setDbOwners] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    const { data: apts } = await supabase.from("apartments").select("*, buildings(name, city)").order("created_at", { ascending: false });
    const { data: blds } = await supabase.from("buildings").select("*").order("name");
    const { data: ows } = await supabase.from("owners").select("id, name").order("name");
    setDbApartments(apts || []);
    setDbBuildings(blds || []);
    setDbOwners(ows || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addApartment() {
    if (!form.building_id || !form.apartment_number) return;
    setSaving(true);
    await supabase.from("apartments").insert({
      building_id: form.building_id,
      apartment_number: form.apartment_number,
      floor: parseInt(form.floor),
      rooms: parseFloat(form.rooms),
      status: form.status,
      rent_amount: parseFloat(form.rent_amount) || 0,
      owner_name: form.owner_name,
      tenant_name: form.tenant_name,
      tenant_phone: form.tenant_phone,
      lease_end: form.lease_end,
      fee_type: form.fee_type,
      fee_value: parseFloat(form.fee_value) || 0,
      notes: form.notes
    });
    setShowForm(false);
    setForm({ building_id: "", apartment_number: "", floor: "0", rooms: "3", status: "פנוי", rent_amount: "", owner_name: "", tenant_name: "", tenant_phone: "", lease_end: "", fee_type: "fixed", fee_value: "0", notes: "" });
    await load();
    setSaving(false);
  }

  async function deleteApartment(id: string) {
    if (!confirm("למחוק את הדירה?")) return;
    await supabase.from("apartments").delete().eq("id", id);
    await load();
  }

  const filtered = dbApartments.filter(a => {
    const q = !query || a.apartment_number?.includes(query) || a.owner_name?.includes(query) || a.tenant_name?.includes(query) || a.buildings?.name?.includes(query);
    const s = filter === "הכל" ? true : a.status === filter;
    return q && s;
  });

  function generateReport() {
    const today = new Date().toLocaleDateString("he-IL");
    const thirtyDays = new Date(); thirtyDays.setDate(thirtyDays.getDate() + 30);

    const allFields: Record<string, string> = {
      address: "כתובת", floor: "קומה", apartment_number: "דירה", owner_name: "בעל נכס",
      tenant_name: "דייר", tenant_phone: "טלפון דייר", rent_amount: "שכירות חודשית",
      lease_end: "חוזה עד", status: "סטטוס", rooms: "חדרים", payment_method: "אמצעי תשלום",
      arnona_number: "מספר ארנונה", arnona_cost: "עלות ארנונה", arnona_payer: "מי משלם ארנונה",
      electric_meter: "מונה חשמל", electric_payer: "מי משלם חשמל", days_left: "ימים לסיום חוזה",
    };

    let rows = dbApartments;
    if (reportFilter !== "הכל") rows = rows.filter(a => a.status === reportFilter);
    if (reportBuilding !== "הכל") rows = rows.filter(a => a.buildings?.name === reportBuilding);

    const headers = reportFields.map(f => allFields[f]);
    const tableRows = rows.map(a => {
      const daysLeft = a.lease_end ? Math.ceil((new Date(a.lease_end).getTime() - Date.now()) / (1000*60*60*24)) : null;
      return reportFields.map(f => {
        if (f === "address") return a.buildings?.name || "-";
        if (f === "rent_amount") return a.rent_amount ? `${Number(a.rent_amount).toLocaleString("he-IL")} ₪` : "-";
        if (f === "arnona_cost") return a.arnona_cost ? `${Number(a.arnona_cost).toLocaleString("he-IL")} ₪` : "-";
        if (f === "lease_end") return a.lease_end ? new Date(a.lease_end).toLocaleDateString("he-IL") : "-";
        if (f === "days_left") return daysLeft !== null ? (daysLeft < 0 ? "⚠️ פג תוקף!" : daysLeft + " ימים") : "-";
        return a[f] || "-";
      });
    });

    const totalRent = rows.reduce((s, a) => s + (a.rent_amount || 0), 0);
    const title = `דוח דירות${reportFilter !== "הכל" ? ` — ${reportFilter}` : ""}${reportBuilding !== "הכל" ? ` | ${reportBuilding}` : ""}`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html dir="rtl"><head><title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; padding: 30px; color: #1e293b; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .meta { color: #64748b; font-size: 13px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #1e293b; color: #d5b57a; padding: 10px 12px; text-align: right; font-size: 12px; }
        td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
        tr:nth-child(even) td { background: #f8fafc; }
        .total { margin-top: 14px; font-weight: bold; font-size: 14px; padding: 10px 14px; background: #f1f5f9; border-radius: 8px; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>🏠 ${title}</h1>
      <div class="meta">תאריך הפקה: ${today} · סה״כ יחידות: ${rows.length}</div>
      <button onclick="window.print()" style="background:#1e293b;color:white;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:13px;margin-bottom:14px">🖨️ הדפס / שמור PDF</button>
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${tableRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
      <div class="total">סה״כ הכנסה חודשית: ${totalRent.toLocaleString("he-IL")} ₪</div>
      </body></html>
    `);
    win.document.close();
    setShowReportModal(false);
  }

  return (
    <>
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card">
        <div className="section-top">
          <div><h2 className="card-title" style={{ marginBottom: 6 }}>דירות</h2><div className="muted">ניהול כל הדירות, הדיירים, החוזים וההכנסה שלך במקום אחד</div></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => setShowReportModal(true)}>📊 הפק דוח</button>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף דירה</button>
          </div>
        </div>

        {showForm && (
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 18, display: "grid", gap: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>דירה חדשה</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>מבנה</label>
                <select className="input" value={form.building_id} onChange={e => setForm({...form, building_id: e.target.value})}>
                  <option value="">בחר מבנה</option>
                  {dbBuildings.map(b => <option key={b.id} value={b.id}>{b.name}, {b.city}</option>)}
                </select>
              </div>
              <div className="field"><label>מספר דירה</label><input className="input" value={form.apartment_number} onChange={e => setForm({...form, apartment_number: e.target.value})} placeholder="3" /></div>
              <div className="field"><label>קומה</label><input className="input" type="number" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} /></div>
              <div className="field"><label>חדרים</label><input className="input" type="number" value={form.rooms} onChange={e => setForm({...form, rooms: e.target.value})} step="0.5" /></div>
              <div className="field">
                <label>סטטוס</label>
                <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option>פנוי</option><option>מושכר</option>
                </select>
              </div>
              <div className="field"><label>שכר דירה</label><input className="input" type="number" value={form.rent_amount} onChange={e => setForm({...form, rent_amount: e.target.value})} placeholder="5200" /></div>
              <div className="field">
                <label>בעל נכס</label>
                <select className="input" value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})}>
                  <option value="">-- בחר בעל נכס --</option>
                  {dbOwners.map((o: any) => <option key={o.id} value={o.name}>{o.name}</option>)}
                </select>
              </div>
              <div className="field"><label>דייר</label><input className="input" value={form.tenant_name} onChange={e => setForm({...form, tenant_name: e.target.value})} placeholder="דני לוי" /></div>
              <div className="field"><label>טלפון דייר</label><input className="input" value={form.tenant_phone} onChange={e => setForm({...form, tenant_phone: e.target.value})} placeholder="052-1234567" /></div>
              <div className="field"><label>חוזה עד</label><input className="input" type="date" value={form.lease_end} onChange={e => setForm({...form, lease_end: e.target.value})} /></div>
              <div className="field">
                <label>סוג עמלה</label>
                <select className="input" value={form.fee_type} onChange={e => setForm({...form, fee_type: e.target.value})}>
                  <option value="percent">אחוז</option><option value="fixed">סכום קבוע</option>
                </select>
              </div>
              <div className="field"><label>{form.fee_type === "percent" ? "אחוז עמלה" : "עמלה קבועה (₪)"}</label><input className="input" type="number" value={form.fee_value} onChange={e => setForm({...form, fee_value: e.target.value})} /></div>
            </div>
            <div className="field"><label>הערות</label><textarea className="input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="הערות על הדירה..." style={{ minHeight: 80, resize: "vertical" }} /></div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={addApartment} disabled={saving}>{saving ? "שומר..." : "שמור דירה"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}

        <div className="filter-row">
          <input className="search" style={{ width: "100%" }} placeholder="חיפוש לפי מבנה, דייר, בעל נכס או מספר דירה" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="chips">
            {["הכל", "מושכר", "פנוי"].map((f) => (
              <button key={f} className={`btn ${filter === f ? "btn-dark" : "btn-outline"}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>טוען...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>אין דירות עדיין</div>
            <div>לחץ על "הוסף דירה" כדי להתחיל</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>כתובת</th><th>קומה</th><th>דירה</th><th>בעל נכס</th><th>דייר</th><th>טלפון</th><th>חוזה עד</th><th>שכירות</th><th>סטטוס</th><th>פעולות</th></tr></thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{item.buildings?.name}</td>
                    <td>{item.floor}</td>
                    <td>{item.apartment_number}</td>
                    <td>{item.owner_name || "-"}</td>
                    <td>{item.tenant_name || "-"}</td>
                    <td>{item.tenant_phone || "-"}</td>
                    <td>{item.lease_end ? new Date(item.lease_end).toLocaleDateString("he-IL") : "-"}</td>
                    <td>{item.rent_amount ? currency(item.rent_amount) : "-"}</td>
                    <td><Badge value={item.status} /></td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => openApartment(item.id)}>צפייה</button>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px", color: "#dc2626" }} onClick={() => deleteApartment(item.id)}>מחק</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {showReportModal && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 580, maxHeight: "90vh", overflow: "auto", padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>📊 הפקת דוח דירות</h2>
            <button onClick={() => setShowReportModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}>×</button>
          </div>

          {/* סינון */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div className="field">
              <label>סטטוס דירות</label>
              <select className="input" value={reportFilter} onChange={e => setReportFilter(e.target.value)}>
                <option value="הכל">הכל</option>
                <option value="מושכר">מושכרות בלבד</option>
                <option value="פנוי">פנויות בלבד</option>
              </select>
            </div>
            <div className="field">
              <label>כתובת / מבנה</label>
              <select className="input" value={reportBuilding} onChange={e => setReportBuilding(e.target.value)}>
                <option value="הכל">כל הכתובות</option>
                {dbBuildings.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {/* בחירת שדות */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>✅ בחר שדות לדוח:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { key: "address", label: "📍 כתובת" },
                { key: "floor", label: "🏢 קומה" },
                { key: "apartment_number", label: "🚪 מספר דירה" },
                { key: "owner_name", label: "👤 בעל נכס" },
                { key: "tenant_name", label: "🔑 שם דייר" },
                { key: "tenant_phone", label: "📞 טלפון דייר" },
                { key: "rent_amount", label: "💰 שכירות חודשית" },
                { key: "lease_end", label: "📅 תאריך סיום חוזה" },
                { key: "days_left", label: "⏳ ימים לסיום חוזה" },
                { key: "status", label: "🏷️ סטטוס" },
                { key: "rooms", label: "🛏️ מספר חדרים" },
                { key: "payment_method", label: "💳 אמצעי תשלום" },
                { key: "arnona_number", label: "🏛️ מספר ארנונה" },
                { key: "arnona_cost", label: "🏛️ עלות ארנונה" },
                { key: "arnona_payer", label: "🏛️ מי משלם ארנונה" },
                { key: "electric_meter", label: "⚡ מונה חשמל" },
                { key: "electric_payer", label: "⚡ מי משלם חשמל" },
              ].map(field => (
                <label key={field.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, cursor: "pointer", background: reportFields.includes(field.key) ? "#fef9ec" : "#f8fafc", border: `1px solid ${reportFields.includes(field.key) ? "#c9a227" : "#e2e8f0"}` }}>
                  <input type="checkbox" checked={reportFields.includes(field.key)}
                    onChange={e => setReportFields(e.target.checked ? [...reportFields, field.key] : reportFields.filter(f => f !== field.key))}
                    style={{ width: 16, height: 16, accentColor: "#c9a227" }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, marginBottom: 20, fontSize: 13, color: "#64748b" }}>
            סה״כ דירות בדוח: <strong>{dbApartments.filter(a => (reportFilter === "הכל" || a.status === reportFilter) && (reportBuilding === "הכל" || a.buildings?.name === reportBuilding)).length}</strong>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1, height: 48 }} onClick={generateReport} disabled={reportFields.length === 0}>🖨️ הפק ופתח דוח</button>
            <button className="btn btn-outline" onClick={() => setShowReportModal(false)}>ביטול</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export function ApartmentDetails({ apartmentId, back }: { apartmentId: string; back: () => void }) {
  const [tab, setTab] = useState("summary");
  const [apt, setApt] = useState<any>(null);
  const [leases, setLeases] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbOwners, setDbOwners] = useState<any[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: a } = await supabase.from("apartments").select("*, buildings(name, city)").eq("id", apartmentId).single();
      setApt(a);
      if (a) setEditForm({
        status: a.status || "פנוי",
        tenant_name: a.tenant_name || "",
        tenant_phone: a.tenant_phone || "",
        owner_name: a.owner_name || "",
        rent_amount: a.rent_amount || "",
        lease_end: a.lease_end || "",
        fee_type: a.fee_type || "fixed",
        fee_value: a.fee_value || "0",
        notes: a.notes || "",
        arnona_number: a.arnona_number || "",
        arnona_cost: a.arnona_cost || "",
        arnona_payer: a.arnona_payer || "דייר",
        electric_meter: a.electric_meter || "",
        electric_payer: a.electric_payer || "דייר",
        payment_method: a.payment_method || "העברה בנקאית",
      });
      const { data: ls } = await supabase.from("leases").select("*").eq("apartment_id", apartmentId).order("created_at", { ascending: false });
      setLeases(ls || []);
      const { data: rs } = await supabase.from("service_requests").select("*").eq("apartment_id", apartmentId).order("created_at", { ascending: false });
      setRequests(rs || []);
      const { data: ows } = await supabase.from("owners").select("id, name").order("name");
      setDbOwners(ows || []);
      setLoading(false);
    }
    load();
  }, [apartmentId]);

  async function uploadDoc(leaseId: string, file: File) {
    setUploadingId(leaseId);
    const ext = file.name.split(".").pop();
    const path = `leases/${leaseId}.${ext}`;
    await supabase.storage.from("documents").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
    await supabase.from("leases").update({ document_url: urlData.publicUrl }).eq("id", leaseId);
    const { data: ls } = await supabase.from("leases").select("*").eq("apartment_id", apartmentId).order("created_at", { ascending: false });
    setLeases(ls || []);
    setUploadingId(null);
  }

  async function saveEdit() {
    setSavingEdit(true);
    await supabase.from("apartments").update({
      status: editForm.status,
      owner_name: editForm.owner_name,
      tenant_name: editForm.tenant_name,
      tenant_phone: editForm.tenant_phone,
      rent_amount: parseFloat(editForm.rent_amount) || 0,
      lease_end: editForm.lease_end || null,
      fee_type: editForm.fee_type,
      fee_value: parseFloat(editForm.fee_value) || 0,
      notes: editForm.notes,
      arnona_number: editForm.arnona_number || "",
      arnona_cost: parseFloat(editForm.arnona_cost) || 0,
      arnona_payer: editForm.arnona_payer || "דייר",
      electric_meter: editForm.electric_meter || "",
      electric_payer: editForm.electric_payer || "דייר",
      payment_method: editForm.payment_method || "העברה בנקאית",
    }).eq("id", apartmentId);
    const { data: a } = await supabase.from("apartments").select("*, buildings(name, city)").eq("id", apartmentId).single();
    setApt(a);
    setEditing(false);
    setSavingEdit(false);
  }

  async function updateRequestStatus(id: string, status: string) {
    await supabase.from("service_requests").update({ status }).eq("id", id);
    const { data: rs } = await supabase.from("service_requests").select("*").eq("apartment_id", apartmentId).order("created_at", { ascending: false });
    setRequests(rs || []);
  }

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>טוען...</div>;
  if (!apt) return <div style={{ padding: 60, textAlign: "center", color: "#dc2626" }}>לא נמצאה דירה</div>;

  const activeLease = leases.find(l => l.status === "פעיל");
  const pastLeases = leases.filter(l => l.status !== "פעיל");
  const openRequests = requests.filter(r => r.status !== "הושלם");
  const closedRequests = requests.filter(r => r.status === "הושלם");

  const tabs = [
    { key: "summary", label: "סיכום" },
    { key: "tenant", label: "דייר נוכחי" },
    { key: "lease", label: "חוזים" },
    { key: "requests", label: `קריאות (${openRequests.length})` },
    { key: "documents", label: "מסמכים" },
    { key: "history", label: "היסטוריה" },
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="detail-top">
        <div>
          <button className="back-link" onClick={back}>← חזרה לרשימת דירות</button>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>{apt.buildings?.city}</div>
            <h2 style={{ margin: "0 0 4px", fontSize: 36, fontWeight: 900, lineHeight: 1.1 }}>{apt.buildings?.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
              <span style={{ background: "#1e293b", color: "#d5b57a", borderRadius: 999, padding: "4px 14px", fontSize: 15, fontWeight: 800 }}>קומה {apt.floor}</span>
              <span style={{ background: "#d5b57a", color: "#1e293b", borderRadius: 999, padding: "4px 14px", fontSize: 15, fontWeight: 800 }}>דירה {apt.apartment_number}</span>
              <span style={{ fontSize: 14, color: "#64748b" }}>{apt.rooms} חדרים</span>
              <Badge value={apt.status} />
            </div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(!editing)}>✏️ עריכה</button>
      </div>

      {editing && (
        <div className="card" style={{ background: "#f8fafc", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>עריכת פרטי דירה</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>סטטוס</label>
              <select className="input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                <option>פנוי</option><option>מושכר</option>
              </select>
            </div>
            <div className="field"><label>דייר</label><input className="input" value={editForm.tenant_name} onChange={e => setEditForm({...editForm, tenant_name: e.target.value})} placeholder="שם הדייר" /></div>
            <div className="field"><label>טלפון דייר</label><input className="input" value={editForm.tenant_phone} onChange={e => setEditForm({...editForm, tenant_phone: e.target.value})} placeholder="052-0000000" /></div>
            <div className="field">
              <label>בעל נכס</label>
              <select className="input" value={editForm.owner_name} onChange={e => setEditForm({...editForm, owner_name: e.target.value})}>
                <option value="">-- בחר בעל נכס --</option>
                {dbOwners.map((o: any) => <option key={o.id} value={o.name}>{o.name}</option>)}
              </select>
            </div>
            <div className="field"><label>שכר דירה ₪</label><input className="input" type="number" value={editForm.rent_amount} onChange={e => setEditForm({...editForm, rent_amount: e.target.value})} /></div>
            <div className="field"><label>חוזה עד</label><input className="input" type="date" value={editForm.lease_end} onChange={e => setEditForm({...editForm, lease_end: e.target.value})} /></div>
            <div className="field">
              <label>סוג עמלה</label>
              <select className="input" value={editForm.fee_type} onChange={e => setEditForm({...editForm, fee_type: e.target.value})}>
                <option value="percent">אחוז</option><option value="fixed">קבוע</option>
              </select>
            </div>
            <div className="field"><label>{editForm.fee_type === "percent" ? "אחוז %" : "עמלה ₪"}</label><input className="input" type="number" value={editForm.fee_value} onChange={e => setEditForm({...editForm, fee_value: e.target.value})} /></div>
            <div className="field"><label>הערות</label><input className="input" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} /></div>
          </div>
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, marginTop: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#475569" }}>🏛️ ארנונה</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field"><label>מספר משלם ארנונה</label><input className="input" value={editForm.arnona_number} onChange={e => setEditForm({...editForm, arnona_number: e.target.value})} placeholder="123456" /></div>
              <div className="field"><label>עלות ₪/חודש</label><input className="input" type="number" value={editForm.arnona_cost} onChange={e => setEditForm({...editForm, arnona_cost: e.target.value})} /></div>
              <div className="field"><label>מי משלם</label><select className="input" value={editForm.arnona_payer} onChange={e => setEditForm({...editForm, arnona_payer: e.target.value})}><option>דייר</option><option>בעל נכס</option></select></div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#475569" }}>⚡ חשמל ותשלום</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field"><label>מספר מונה חשמל</label><input className="input" value={editForm.electric_meter} onChange={e => setEditForm({...editForm, electric_meter: e.target.value})} placeholder="12345678" /></div>
              <div className="field"><label>מי משלם חשמל</label><select className="input" value={editForm.electric_payer} onChange={e => setEditForm({...editForm, electric_payer: e.target.value})}><option>דייר</option><option>בעל נכס</option></select></div>
              <div className="field"><label>אמצעי תשלום</label><select className="input" value={editForm.payment_method} onChange={e => setEditForm({...editForm, payment_method: e.target.value})}><option>העברה בנקאית</option><option>מזומן</option><option>צ׳קים</option></select></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={saveEdit} disabled={savingEdit}>{savingEdit ? "שומר..." : "שמור שינויים"}</button>
            <button className="btn btn-outline" onClick={() => setEditing(false)}>ביטול</button>
          </div>
        </div>
      )}

      <div className="detail-kpis">
        <KPI title="בעל נכס" value={apt.owner_name || "-"} subtitle="לקוח משויך" />
        <KPI title="דייר נוכחי" value={apt.tenant_name || "פנוי"} subtitle={apt.tenant_phone || ""} />
        <KPI title="שכר דירה" value={apt.rent_amount ? currency(apt.rent_amount) : "-"} subtitle="חודשי" />
        <KPI title="חוזה עד" value={activeLease?.end_date ? new Date(activeLease.end_date).toLocaleDateString("he-IL") : "-"} subtitle="מועד סיום" />
        <KPI title="קריאות פתוחות" value={String(openRequests.length)} subtitle="לטיפול" />
      </div>

      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="card">
          <div className="section-top" style={{ marginBottom: 16 }}>
            <h3 className="card-title" style={{ margin: 0 }}>פרטי הדירה</h3>
            {!editing ? (
              <button className="btn btn-primary" onClick={() => { setEditForm({ status: apt.status, owner_name: apt.owner_name || "", tenant_name: apt.tenant_name || "", tenant_phone: apt.tenant_phone || "", rent_amount: apt.rent_amount || "", lease_end: apt.lease_end || "", fee_type: apt.fee_type || "fixed", fee_value: apt.fee_value || 0, notes: apt.notes || "" }); setEditing(true); }}>✏️ עריכה</button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={saveEdit} disabled={savingEdit}>{savingEdit ? "שומר..." : "💾 שמור"}</button>
                <button className="btn btn-outline" onClick={() => setEditing(false)}>ביטול</button>
              </div>
            )}
          </div>

          {!editing ? (
            <>
            <div className="info-grid">
              <InfoBox label="מבנה" value={apt.buildings?.name} />
              <InfoBox label="עיר" value={apt.buildings?.city} />
              <InfoBox label="מספר דירה" value={apt.apartment_number} />
              <InfoBox label="קומה" value={String(apt.floor)} />
              <InfoBox label="חדרים" value={String(apt.rooms)} />
              <InfoBox label="סטטוס" value={apt.status} />
              <InfoBox label="בעל נכס" value={apt.owner_name || "-"} />
              <InfoBox label="דייר" value={apt.tenant_name || "-"} />
              <InfoBox label="טלפון דייר" value={apt.tenant_phone || "-"} />
              <InfoBox label="שכר דירה" value={apt.rent_amount ? currency(apt.rent_amount) : "-"} />
              <InfoBox label="עמלת ניהול" value={apt.fee_type === "percent" ? apt.fee_value + "%" : currency(apt.fee_value)} />
              <InfoBox label="אמצעי תשלום" value={apt.payment_method || "-"} />
              <InfoBox label="הערות" value={apt.notes || "-"} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <div style={{ background: "#f8fafc", borderRadius: 14, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10, color: "#475569" }}>🏛️ ארנונה</div>
                <div style={{ display: "grid", gap: 8 }}>
                  <InfoBox label="מספר משלם" value={apt.arnona_number || "-"} />
                  <InfoBox label="עלות חודשית" value={apt.arnona_cost ? currency(apt.arnona_cost) : "-"} />
                  <InfoBox label="מי משלם" value={apt.arnona_payer || "-"} />
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 14, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10, color: "#475569" }}>⚡ חשמל</div>
                <div style={{ display: "grid", gap: 8 }}>
                  <InfoBox label="מספר מונה" value={apt.electric_meter || "-"} />
                  <InfoBox label="מי משלם" value={apt.electric_payer || "-"} />
                </div>
              </div>
            </div>
            </>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>סטטוס</label>
                <select className="input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                  <option>פנוי</option><option>מושכר</option>
                </select>
              </div>
              <div className="field"><label>בעל נכס</label><input className="input" value={editForm.owner_name} onChange={e => setEditForm({...editForm, owner_name: e.target.value})} /></div>
              <div className="field"><label>דייר</label><input className="input" value={editForm.tenant_name} onChange={e => setEditForm({...editForm, tenant_name: e.target.value})} /></div>
              <div className="field"><label>טלפון דייר</label><input className="input" value={editForm.tenant_phone} onChange={e => setEditForm({...editForm, tenant_phone: e.target.value})} /></div>
              <div className="field"><label>שכר דירה (₪)</label><input className="input" type="number" value={editForm.rent_amount} onChange={e => setEditForm({...editForm, rent_amount: e.target.value})} /></div>
              <div className="field"><label>חוזה עד</label><input className="input" type="date" value={editForm.lease_end} onChange={e => setEditForm({...editForm, lease_end: e.target.value})} /></div>
              <div className="field">
                <label>סוג עמלה</label>
                <select className="input" value={editForm.fee_type} onChange={e => setEditForm({...editForm, fee_type: e.target.value})}>
                  <option value="percent">אחוז</option><option value="fixed">קבוע</option>
                </select>
              </div>
              <div className="field"><label>{editForm.fee_type === "percent" ? "אחוז עמלה" : "עמלה קבועה (₪)"}</label><input className="input" type="number" value={editForm.fee_value} onChange={e => setEditForm({...editForm, fee_value: e.target.value})} /></div>
              <div className="field" style={{ gridColumn: "span 3" }}><label>הערות</label><textarea className="input" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} style={{ minHeight: 70 }} /></div>
            </div>
          )}
        </div>
      )}

      {tab === "tenant" && (
        <div className="card">
          <h3 className="card-title">דייר נוכחי</h3>
          {!apt.tenant_name ? (
            <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
              <div style={{ fontWeight: 700 }}>הדירה פנויה</div>
            </div>
          ) : (
            <div className="info-grid">
              <InfoBox label="שם" value={apt.tenant_name} />
              <InfoBox label="טלפון" value={apt.tenant_phone || "-"} />
              <InfoBox label="חוזה עד" value={apt.lease_end ? new Date(apt.lease_end).toLocaleDateString("he-IL") : "-"} />
              <InfoBox label="שכר דירה" value={apt.rent_amount ? currency(apt.rent_amount) : "-"} />
            </div>
          )}
        </div>
      )}

      {tab === "lease" && (
        <div style={{ display: "grid", gap: 14 }}>
          {activeLease && (
            <div className="card">
              <h3 className="card-title" style={{ color: "#16a34a" }}>✅ חוזה פעיל</h3>
              <div className="info-grid">
                <InfoBox label="דייר" value={activeLease.tenant_name} />
                <InfoBox label="התחלה" value={activeLease.start_date ? new Date(activeLease.start_date).toLocaleDateString("he-IL") : "-"} />
                <InfoBox label="סיום" value={activeLease.end_date ? new Date(activeLease.end_date).toLocaleDateString("he-IL") : "-"} />
                <InfoBox label="שכירות" value={currency(activeLease.rent_amount)} />
                <InfoBox label="פיקדון" value={currency(activeLease.deposit)} />
                <InfoBox label="הערות" value={activeLease.notes || "-"} />
              </div>
              <div style={{ marginTop: 14 }}>
                {activeLease.document_url ? (
                  <a href={activeLease.document_url} target="_blank" rel="noreferrer" className="btn btn-outline">📄 פתח חוזה</a>
                ) : (
                  <label style={{ cursor: "pointer" }}>
                    <span className="btn btn-outline">{uploadingId === activeLease.id ? "מעלה..." : "📎 העלה חוזה"}</span>
                    <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadDoc(activeLease.id, e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>
          )}
          {pastLeases.length > 0 && (
            <div className="card">
              <h3 className="card-title">📋 דיירים קודמים</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>דייר</th><th>התחלה</th><th>סיום</th><th>שכירות</th><th>סטטוס</th><th>מסמך</th></tr></thead>
                  <tbody>
                    {pastLeases.map(l => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 700 }}>{l.tenant_name}</td>
                        <td>{l.start_date ? new Date(l.start_date).toLocaleDateString("he-IL") : "-"}</td>
                        <td>{l.end_date ? new Date(l.end_date).toLocaleDateString("he-IL") : "-"}</td>
                        <td>{currency(l.rent_amount)}</td>
                        <td><Badge value={l.status} /></td>
                        <td>{l.document_url ? <a href={l.document_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}>📄 פתח</a> : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!activeLease && pastLeases.length === 0 && (
            <div className="card"><div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>אין חוזים עדיין</div></div>
          )}
        </div>
      )}

      {tab === "requests" && (
        <div style={{ display: "grid", gap: 14 }}>
          {openRequests.length > 0 && (
            <div className="card">
              <h3 className="card-title" style={{ color: "#dc2626" }}>🔧 קריאות פתוחות ({openRequests.length})</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>תאריך</th><th>תקלה</th><th>דחיפות</th><th>ספק</th><th>עלות</th><th>סטטוס</th></tr></thead>
                  <tbody>
                    {openRequests.map(r => (
                      <tr key={r.id}>
                        <td>{new Date(r.created_at).toLocaleDateString("he-IL")}</td>
                        <td style={{ fontWeight: 700 }}>{r.issue}</td>
                        <td><Badge value={r.urgency} /></td>
                        <td>{r.vendor || "-"}</td>
                        <td>{r.cost ? currency(r.cost) : "-"}</td>
                        <td>
                          <select value={r.status} onChange={e => updateRequestStatus(r.id, e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 8px", fontSize: 13 }}>
                            <option>חדשה</option><option>בטיפול</option><option>ממתין לבעל מקצוע</option><option>הושלם</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {closedRequests.length > 0 && (
            <div className="card">
              <h3 className="card-title">✅ קריאות שטופלו ({closedRequests.length})</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>תאריך</th><th>תקלה</th><th>ספק</th><th>עלות</th></tr></thead>
                  <tbody>
                    {closedRequests.map(r => (
                      <tr key={r.id}>
                        <td>{new Date(r.created_at).toLocaleDateString("he-IL")}</td>
                        <td>{r.issue}</td>
                        <td>{r.vendor || "-"}</td>
                        <td>{r.cost ? currency(r.cost) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {requests.length === 0 && (
            <div className="card"><div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>אין קריאות שירות לדירה זו</div></div>
          )}
        </div>
      )}

      {tab === "documents" && (
        <div className="card">
          <h3 className="card-title">📄 מסמכים</h3>
          {leases.filter(l => l.document_url).length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>אין מסמכים עדיין</div>
          ) : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: "8px 0" }}>
              {leases.filter(l => l.document_url).map(l => (
                <a key={l.id} href={l.document_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  📄 חוזה — {l.tenant_name} ({l.status})
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="card">
          <h3 className="card-title">📋 היסטוריה מלאה</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>תאריך</th><th>סוג</th><th>פרטים</th></tr></thead>
              <tbody>
                {[...leases.map(l => ({ date: l.created_at, type: "חוזה", details: `${l.tenant_name} — ${l.status}` })),
                  ...requests.map(r => ({ date: r.created_at, type: "קריאת שירות", details: `${r.issue} — ${r.status}` }))
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, i) => (
                  <tr key={i}>
                    <td>{new Date(item.date).toLocaleDateString("he-IL")}</td>
                    <td><Badge value={item.type} /></td>
                    <td>{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


export function PaymentsTracker() {
  const [payments, setPayments] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  const [filterStatus, setFilterStatus] = useState("הכל");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({ apartment_id: "", tenant_name: "", amount: "", month: String(new Date().getMonth() + 1).padStart(2, "0"), year: String(new Date().getFullYear()), status: "לא שולם", payment_date: "", payment_method: "העברה בנקאית", notes: "" });

  const months = [
    { val: "01", label: "ינואר" }, { val: "02", label: "פברואר" }, { val: "03", label: "מרץ" },
    { val: "04", label: "אפריל" }, { val: "05", label: "מאי" }, { val: "06", label: "יוני" },
    { val: "07", label: "יולי" }, { val: "08", label: "אוגוסט" }, { val: "09", label: "ספטמבר" },
    { val: "10", label: "אוקטובר" }, { val: "11", label: "נובמבר" }, { val: "12", label: "דצמבר" },
  ];
  const years = ["2023", "2024", "2025", "2026", "2027"];

  async function load() {
    setLoading(true);
    const { data: apts } = await supabase.from("apartments").select("id, apartment_number, tenant_name, rent_amount, buildings(name, city)").eq("status", "מושכר");
    const { data: pays } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    setApartments(apts || []);
    setPayments(pays || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addPayment() {
    if (!form.apartment_id) return;
    setSaving(true);
    const apt = apartments.find(a => a.id === form.apartment_id);
    await supabase.from("payments").insert({
      apartment_id: form.apartment_id,
      tenant_name: form.tenant_name || apt?.tenant_name || "",
      amount: parseFloat(form.amount) || apt?.rent_amount || 0,
      month: form.month,
      year: parseInt(form.year),
      status: form.status,
      payment_date: form.payment_date || null,
      payment_method: form.payment_method,
      notes: form.notes,
    });
    setForm({ apartment_id: "", tenant_name: "", amount: "", month: String(new Date().getMonth() + 1).padStart(2, "0"), year: String(new Date().getFullYear()), status: "לא שולם", payment_date: "", payment_method: "העברה בנקאית", notes: "" });
    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function updatePaymentStatus(id: string, status: string, payment_date?: string) {
    await supabase.from("payments").update({ status, payment_date: payment_date || null }).eq("id", id);
    await load();
  }

  async function deletePayment(id: string) {
    if (!confirm("למחוק תשלום?")) return;
    await supabase.from("payments").delete().eq("id", id);
    await load();
  }

  // סינון
  const filtered = payments.filter(p => {
    const monthMatch = filterMonth === "הכל" || p.month === filterMonth;
    const yearMatch = p.year === parseInt(filterYear);
    const statusMatch = filterStatus === "הכל" || p.status === filterStatus;
    const apt = apartments.find(a => a.id === p.apartment_id);
    const q = searchQuery.trim().toLowerCase();
    const searchMatch = !q ||
      p.tenant_name?.toLowerCase().includes(q) ||
      apt?.apartment_number?.toLowerCase().includes(q) ||
      apt?.buildings?.name?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q);
    return monthMatch && yearMatch && statusMatch && searchMatch;
  });

  const totalExpected = filtered.reduce((s, p) => s + (p.amount || 0), 0);
  const totalPaid = filtered.filter(p => p.status === "שולם").reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = filtered.filter(p => p.status === "לא שולם").reduce((s, p) => s + (p.amount || 0), 0);
  const paidCount = filtered.filter(p => p.status === "שולם").length;
  const pendingCount = filtered.filter(p => p.status === "לא שולם").length;
  const lateCount = filtered.filter(p => p.status === "באיחור").length;

  const statusColor: Record<string, string> = { "שולם": "#16a34a", "לא שולם": "#dc2626", "באיחור": "#d97706", "שולם חלקית": "#2563eb" };
  const statusBg: Record<string, string> = { "שולם": "#dcfce7", "לא שולם": "#fee2e2", "באיחור": "#fef3c7", "שולם חלקית": "#dbeafe" };

  // יצירת תשלומים חודשיים אוטומטית לכל הדירות המושכרות
  async function generateMonthlyPayments() {
    if (!confirm(`ליצור תשלומים עבור ${months.find(m => m.val === filterMonth)?.label} ${filterYear} לכל הדירות המושכרות?`)) return;
    setSaving(true);
    for (const apt of apartments) {
      const exists = payments.find(p => p.apartment_id === apt.id && p.month === filterMonth && p.year === parseInt(filterYear));
      if (!exists) {
        await supabase.from("payments").insert({
          apartment_id: apt.id,
          tenant_name: apt.tenant_name || "",
          amount: apt.rent_amount || 0,
          month: filterMonth,
          year: parseInt(filterYear),
          status: "לא שולם",
          payment_method: "העברה בנקאית",
        });
      }
    }
    await load();
    setSaving(false);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* כותרת */}
      <div className="card">
        <div className="section-top">
          <div>
            <h2 className="card-title" style={{ marginBottom: 6 }}>💰 מעקב תשלומים</h2>
            <div className="muted">מעקב אחר תשלומי שכירות מכל הדיירים</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-outline" onClick={generateMonthlyPayments} disabled={saving}>⚡ צור תשלומים חודשיים</button>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף תשלום</button>
          </div>
        </div>

        {/* סינון */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div className="field">
            <label>חודש</label>
            <select className="input" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              <option value="הכל">כל החודשים</option>
              {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>שנה</label>
            <select className="input" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="field">
            <label>סטטוס</label>
            <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="הכל">הכל</option>
              <option>שולם</option><option>לא שולם</option><option>באיחור</option><option>שולם חלקית</option>
            </select>
          </div>
        </div>
        {/* חיפוש */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input className="input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="🔍 חפש דייר, כתובת, מבנה..."
            style={{ paddingRight: 16, background: searchQuery ? "#fef9ec" : "#f8fafc", borderColor: searchQuery ? "#c9a227" : "#e2e8f0" }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}>×</button>
          )}
        </div>

        {/* טופס הוספה */}
        {showForm && (
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 18, display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>תשלום חדש</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>דירה *</label>
                <select className="input" value={form.apartment_id} onChange={e => {
                  const apt = apartments.find(a => a.id === e.target.value);
                  setForm({...form, apartment_id: e.target.value, tenant_name: apt?.tenant_name || "", amount: String(apt?.rent_amount || "")});
                }}>
                  <option value="">בחר דירה</option>
                  {apartments.map(a => <option key={a.id} value={a.id}>{a.buildings?.name} / {a.apartment_number} — {a.tenant_name}</option>)}
                </select>
              </div>
              <div className="field"><label>שם דייר</label><input className="input" value={form.tenant_name} onChange={e => setForm({...form, tenant_name: e.target.value})} /></div>
              <div className="field"><label>סכום ₪</label><input className="input" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
              <div className="field">
                <label>חודש</label>
                <select className="input" value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
                  {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>שנה</label>
                <select className="input" value={form.year} onChange={e => setForm({...form, year: e.target.value})}>
                  {years.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="field">
                <label>סטטוס</label>
                <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option>לא שולם</option><option>שולם</option><option>באיחור</option><option>שולם חלקית</option>
                </select>
              </div>
              <div className="field"><label>תאריך תשלום</label><input className="input" type="date" value={form.payment_date} onChange={e => setForm({...form, payment_date: e.target.value})} /></div>
              <div className="field">
                <label>אמצעי תשלום</label>
                <select className="input" value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})}>
                  <option>העברה בנקאית</option><option>מזומן</option><option>צ׳קים</option>
                </select>
              </div>
              <div className="field"><label>הערות</label><input className="input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" onClick={addPayment} disabled={saving}>{saving ? "שומר..." : "💾 שמור"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}
      </div>

      {/* כרטיסי סיכום */}
      <div className="detail-kpis">
        <KPI title="סה״כ צפוי" value={currency(totalExpected)} subtitle={`${filtered.length} תשלומים`} />
        <KPI title="שולם" value={currency(totalPaid)} subtitle={`${paidCount} דיירים`} />
        <KPI title="לא שולם" value={currency(totalPending)} subtitle={`${pendingCount} דיירים`} />
        <KPI title="באיחור" value={String(lateCount)} subtitle="דיירים" />
        <KPI title="אחוז גבייה" value={totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) + "%" : "0%"} subtitle="מהצפוי" />
      </div>

      {/* טבלת תשלומים */}
      <div className="card">
        {loading ? <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>טוען...</div>
        : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 40 }}>💰</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>אין תשלומים לתקופה זו</div>
            <div style={{ fontSize: 13, marginTop: 6, color: "#94a3b8" }}>לחץ "צור תשלומים חודשיים" כדי ליצור אוטומטית לכל הדירות</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map(p => {
              const apt = apartments.find(a => a.id === p.apartment_id);
              const monthLabel = months.find(m => m.val === p.month)?.label || p.month;
              return (
                <div key={p.id} style={{ border: `1px solid ${statusBg[p.status] || "#f1f5f9"}`, borderRight: `4px solid ${statusColor[p.status] || "#94a3b8"}`, borderRadius: 14, padding: "14px 16px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{p.tenant_name || "-"}</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{apt ? `${apt.buildings?.name} / ${apt.apartment_number}` : "-"}</span>
                      <span style={{ fontSize: 12, background: "#f1f5f9", borderRadius: 999, padding: "2px 10px", fontWeight: 600 }}>{monthLabel} {p.year}</span>
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{currency(p.amount)}</span>
                      {p.payment_method && <span style={{ fontSize: 12, color: "#94a3b8" }}>{p.payment_method}</span>}
                      {p.payment_date && <span style={{ fontSize: 12, color: "#64748b" }}>שולם: {new Date(p.payment_date).toLocaleDateString("he-IL")}</span>}
                      {p.notes && <span style={{ fontSize: 12, color: "#94a3b8" }}>{p.notes}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select value={p.status} onChange={e => updatePaymentStatus(p.id, e.target.value, e.target.value === "שולם" ? new Date().toISOString().split("T")[0] : undefined)}
                      style={{ border: `1px solid ${statusColor[p.status] || "#e2e8f0"}`, borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700, background: statusBg[p.status] || "#fff", color: statusColor[p.status] || "#334155" }}>
                      <option>לא שולם</option>
                      <option>שולם</option>
                      <option>באיחור</option>
                      <option>שולם חלקית</option>
                    </select>
                    <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "#dc2626" }} onClick={() => deletePayment(p.id)}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [form, setForm] = useState({ owner_id: "", owner_name: "", start_date: "", end_date: "", fee_type: "fixed", fee_value: "0", status: "פעיל", notes: "" });

  async function load() {
    setLoading(true);
    const { data: cs } = await supabase.from("work_contracts").select("*").order("created_at", { ascending: false });
    const { data: os } = await supabase.from("owners").select("*").order("name");
    setContracts(cs || []);
    setOwners(os || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addContract() {
    if (!form.owner_name) return;
    setSaving(true);
    await supabase.from("work_contracts").insert({ owner_id: form.owner_id || null, owner_name: form.owner_name, start_date: form.start_date || null, end_date: form.end_date || null, fee_type: form.fee_type, fee_value: parseFloat(form.fee_value) || 0, status: form.status, notes: form.notes });
    setForm({ owner_id: "", owner_name: "", start_date: "", end_date: "", fee_type: "fixed", fee_value: "0", status: "פעיל", notes: "" });
    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function uploadDocument(id: string, file: File) {
    setUploadingId(id);
    const ext = file.name.split(".").pop();
    const path = `work-contracts/${id}.${ext}`;
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      await supabase.from("work_contracts").update({ document_url: urlData.publicUrl }).eq("id", id);
      await load();
    }
    setUploadingId(null);
  }

  async function deleteContract(id: string) {
    if (!confirm("למחוק את החוזה?")) return;
    await supabase.from("work_contracts").delete().eq("id", id);
    await load();
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card">
        <div className="section-top">
          <div><h2 className="card-title">חוזי עבודה</h2><div className="muted">חוזים בינך לבין בעלי הנכסים</div></div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ חוזה עבודה חדש</button>
        </div>

        {showForm && (
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 18, display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>חוזה עבודה חדש</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>בעל נכס</label>
                <select className="input" value={form.owner_id} onChange={e => { const o = owners.find((x: any) => x.id === e.target.value); setForm({...form, owner_id: e.target.value, owner_name: o?.name || ""}); }}>
                  <option value="">בחר בעל נכס</option>
                  {owners.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="field"><label>שם (ידני)</label><input className="input" value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} placeholder="יוסי כהן" /></div>
              <div className="field"><label>סטטוס</label><select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option>פעיל</option><option>הסתיים</option><option>בוטל</option></select></div>
              <div className="field"><label>תאריך התחלה</label><input className="input" type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
              <div className="field"><label>תאריך סיום</label><input className="input" type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
              <div className="field"><label>סוג עמלה</label><select className="input" value={form.fee_type} onChange={e => setForm({...form, fee_type: e.target.value})}><option value="percent">אחוז</option><option value="fixed">קבוע</option></select></div>
              <div className="field"><label>{form.fee_type === "percent" ? "אחוז (%)" : "סכום (₪)"}</label><input className="input" type="number" value={form.fee_value} onChange={e => setForm({...form, fee_value: e.target.value})} /></div>
              <div className="field" style={{ gridColumn: "span 2" }}><label>הערות</label><input className="input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="תנאים מיוחדים..." /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={addContract} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}

        {loading ? <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>טוען...</div> : contracts.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📝</div><div style={{ fontWeight: 700 }}>אין חוזי עבודה עדיין</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>בעל נכס</th><th>התחלה</th><th>סיום</th><th>עמלה</th><th>סטטוס</th><th>מסמך</th><th>פעולות</th></tr></thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.owner_name}</td>
                    <td>{c.start_date ? new Date(c.start_date).toLocaleDateString("he-IL") : "-"}</td>
                    <td>{c.end_date ? new Date(c.end_date).toLocaleDateString("he-IL") : "-"}</td>
                    <td>{c.fee_type === "percent" ? c.fee_value + "%" : currency(c.fee_value)}</td>
                    <td><Badge value={c.status} /></td>
                    <td>
                      {c.document_url ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <a href={c.document_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}>📄 פתח</a>
                          <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>🔄<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadDocument(c.id, e.target.files[0])} /></label>
                        </div>
                      ) : (
                        <label style={{ cursor: "pointer" }}>
                          <span className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}>{uploadingId === c.id ? "מעלה..." : "📎 העלה"}</span>
                          <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadDocument(c.id, e.target.files[0])} />
                        </label>
                      )}
                    </td>
                    <td><button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => deleteContract(c.id)}>מחק</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function OwnerDashboard({ userProfile }: { userProfile: any }) {
  const [ownerApts, setOwnerApts] = useState<any[]>([]);
  const [ownerLeases, setOwnerLeases] = useState<any[]>([]);
  const [ownerWorkContracts, setOwnerWorkContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const ownerName = userProfile?.full_name || "";
      const { data: apts } = await supabase.from("apartments")
        .select("*, buildings(name, city)")
        .eq("owner_name", ownerName);
      setOwnerApts(apts || []);

      if (apts && apts.length > 0) {
        const aptIds = apts.map((a: any) => a.id);
        const { data: leases } = await supabase.from("leases")
          .select("*, apartments(apartment_number, buildings(name))")
          .in("apartment_id", aptIds)
          .eq("status", "פעיל");
        setOwnerLeases(leases || []);
      }

      const { data: wc } = await supabase.from("work_contracts")
        .select("*")
        .eq("owner_name", ownerName)
        .eq("status", "פעיל");
      setOwnerWorkContracts(wc || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>טוען...</div>;

  const totalRent = ownerApts.reduce((s, a) => s + (a.rent_amount || 0), 0);
  const thirtyDays = new Date(); thirtyDays.setDate(thirtyDays.getDate() + 30);
  const endingSoon = ownerLeases.filter(l => l.end_date && new Date(l.end_date) <= thirtyDays);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <KPI title="הדירות שלי" value={String(ownerApts.length)} subtitle="דירות משויכות" />
        <KPI title="הכנסות החודש" value={currency(totalRent)} subtitle="שכירות מכל הדירות" />
        <KPI title="חוזים קרובים לסיום" value={String(endingSoon.length)} subtitle="30 יום קדימה" />
      </div>

      <div className="card">
        <h3 className="card-title">💰 הדירות שלי</h3>
        {ownerApts.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>אין דירות משויכות לשמך עדיין</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>מבנה</th><th>דירה</th><th>דייר</th><th>שכירות</th><th>סטטוס</th></tr></thead>
              <tbody>
                {ownerApts.map(a => (
                  <tr key={a.id}>
                    <td>{a.buildings?.name}</td>
                    <td>{a.apartment_number}</td>
                    <td>{a.tenant_name || "-"}</td>
                    <td style={{ fontWeight: 700, color: "#16a34a" }}>{currency(a.rent_amount)}</td>
                    <td><Badge value={a.status} /></td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #e2e8f0" }}>
                  <td colSpan={3} style={{ fontWeight: 700 }}>סה״כ הכנסות</td>
                  <td style={{ fontWeight: 800, color: "#16a34a" }}>{currency(totalRent)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="card-title">📄 המסמכים שלי</h3>
        {ownerWorkContracts.filter((c: any) => c.document_url).length === 0 && ownerLeases.filter(l => l.document_url).length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>אין מסמכים עדיין</div>
        ) : (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: "8px 0" }}>
            {ownerWorkContracts.filter((c: any) => c.document_url).map((c: any) => (
              <a key={c.id} href={c.document_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                📝 חוזה עבודה — {c.owner_name}
              </a>
            ))}
            {ownerLeases.filter(l => l.document_url).map(l => (
              <a key={l.id} href={l.document_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                📄 חוזה שכירות — {l.apartments?.buildings?.name} / {l.apartments?.apartment_number}
              </a>
            ))}
          </div>
        )}
      </div>

      {endingSoon.length > 0 && (
        <div className="card">
          <h3 className="card-title">⚠️ חוזים שמסתיימים בקרוב</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>דירה</th><th>דייר</th><th>תאריך סיום</th></tr></thead>
              <tbody>
                {endingSoon.map(l => (
                  <tr key={l.id}>
                    <td>{l.apartments?.buildings?.name} / {l.apartments?.apartment_number}</td>
                    <td>{l.tenant_name}</td>
                    <td style={{ color: "#dc2626", fontWeight: 800 }}>{new Date(l.end_date).toLocaleDateString("he-IL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function TenantPortal({ userProfile }: { userProfile: any }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card">
        <div className="section-top">
          <div><h2 className="card-title" style={{ marginBottom: 6 }}>פורטל דייר</h2><div className="muted">תצוגה עתידית לאזור האישי של הדייר</div></div>
          <button className="btn btn-primary">פתיחת קריאה חדשה</button>
        </div>
        <div className="detail-kpis">
          <KPI title="שם הדייר" value={tenantPortalData.tenantName} subtitle="משתמש פעיל" />
          <KPI title="הדירה שלי" value={tenantPortalData.apartment} subtitle="יחידה משויכת" />
          <KPI title="חוזה עד" value={tenantPortalData.leaseEnd} subtitle="מועד סיום" />
          <KPI title="שכר דירה" value={currency(tenantPortalData.rentAmount)} subtitle="תשלום חודשי" />
          <KPI title="הוצאה חודשית" value={currency(tenantPortalData.expenses.reduce((s,e) => s + e.amount, 0))} subtitle="סה״כ החודש" />
        </div>
      </div>

      <div className="grid-1-1">
        <div className="card">
          <h3 className="card-title">הבית שלי</h3>
          <div className="info-grid">
            <InfoBox label="מבנה" value={tenantPortalData.building} />
            <InfoBox label="דירה" value={tenantPortalData.apartment} />
            <InfoBox label="קומה" value={tenantPortalData.floor} />
            <InfoBox label="חוזה עד" value={tenantPortalData.leaseEnd} />
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">פעולות מהירות לדייר</h3>
          <div className="action-list">
            <button className="btn btn-primary">פתיחת קריאת שירות</button>
            <button className="btn btn-secondary">צפייה בחוזה</button>
            <button className="btn btn-outline">צור קשר עם מנהל הנכס</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">קריאות השירות שלי</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>תאריך</th><th>תקלה</th><th>סטטוס</th></tr></thead>
            <tbody>
              {tenantPortalData.requests.map((item) => (
                <tr key={item.id}><td>{item.date}</td><td>{item.issue}</td><td><Badge value={item.status} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">הוצאות חודשיות</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>תאריך</th><th>תיאור</th><th>סכום</th></tr></thead>
            <tbody>
              {tenantPortalData.expenses.map((item) => (
                <tr key={item.id}><td>{item.date}</td><td>{item.description}</td><td style={{fontWeight:700}}>{currency(item.amount)}</td></tr>
              ))}
              <tr style={{borderTop:"2px solid #e2e8f0"}}>
                <td colSpan={2} style={{fontWeight:700}}>סה״כ</td>
                <td style={{fontWeight:800, color:"#dc2626"}}>{currency(tenantPortalData.expenses.reduce((s,e) => s + e.amount, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">טופס פתיחת קריאה</h3>
        <div style={{ display: "grid", gap: 12, maxWidth: 620 }}>
          <input className="search" style={{ width: "100%" }} placeholder="נושא התקלה" />
          <textarea placeholder="תיאור התקלה" style={{ width: "100%", minHeight: 120, border: "1px solid #dbe3ee", borderRadius: 16, padding: 14, resize: "vertical", fontFamily: "inherit" }} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary">שלח קריאה</button>
            <button className="btn btn-outline">צרף תמונה</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Placeholder({ title, text }: { title: string; text: string }) {
  return (
    <div className="card placeholder">
      <div className="placeholder-box">
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}

function VehicleServicesModal({ vehicleId, licensePlate, onClose }: { vehicleId: string; licensePlate: string; onClose: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [form, setForm] = useState({ service_type: "", date: "", notes: "" });
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("ngs_vehicle_services").select("*").eq("vehicle_id", vehicleId).order("date", { ascending: false });
    setServices(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function addService() {
    if (!form.service_type || !form.date) return;
    setSaving(true);
    await supabase.from("ngs_vehicle_services").insert({ vehicle_id: vehicleId, ...form });
    setForm({ service_type: "", date: "", notes: "" });
    setShowForm(false);
    await load();
    setSaving(false);
  }
  async function deleteService(id: string) {
    if (!confirm("למחוק?")) return;
    await supabase.from("ngs_vehicle_services").delete().eq("id", id);
    await load();
  }
  const serviceTypes = ["טיפול שמן", "טסט", "גלגלים", "בלמים", "מצבר", "מזגן", "תיקון כללי", "אחר"];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>🔧 היסטוריית טיפולים</h3><div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>רכב: {licensePlate}</div></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => setShowForm(!showForm)}>+ טיפול חדש</button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#64748b" }}>×</button>
          </div>
        </div>
        {showForm && (
          <div style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #e8eef6" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div className="field"><label>סוג טיפול *</label><select className="input" value={form.service_type} onChange={e => setForm({...form, service_type: e.target.value})}><option value="">בחר סוג</option>{serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="field"><label>תאריך *</label><input className="input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
              <div className="field" style={{ gridColumn: "span 2" }}><label>הערות</label><input className="input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="פרטים נוספים..." /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" onClick={addService} disabled={saving}>{saving ? "שומר..." : "שמור"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          {loading ? <div style={{ padding: 30, textAlign: "center" }}>טוען...</div> : services.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}><div style={{ fontSize: 40 }}>🔧</div><div style={{ fontWeight: 700, marginTop: 8 }}>אין טיפולים עדיין</div></div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {services.map(s => (
                <div key={s.id} style={{ border: "1px solid #e8eef6", borderRadius: 14, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontWeight: 800 }}>🔧 {s.service_type}</span>
                    <span style={{ fontSize: 13, color: "#64748b", marginRight: 8 }}>{s.date ? new Date(s.date).toLocaleDateString("he-IL") : "-"}</span>
                    {s.notes && <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{s.notes}</div>}
                  </div>
                  <button className="btn btn-outline" style={{ fontSize: 12, padding: "3px 8px", color: "#dc2626" }} onClick={() => deleteService(s.id)}>מחק</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InventoryTab({ isWorker, workerName }: { isWorker: boolean; workerName: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("הכל");
  const [form, setForm] = useState({ item: "", quantity: "", category: "כללי", notes: "" });

  const categories = ["כללי", "כלי עבודה", "חומרי גלם", "ציוד בטיחות", "חשמל", "אינסטלציה", "רכב", "אחר"];

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("ngs_inventory").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addItem() {
    if (!form.item) return;
    setSaving(true);
    await supabase.from("ngs_inventory").insert({
      item: form.item,
      quantity: form.quantity,
      category: form.category,
      notes: form.notes,
      status: "חסר",
      added_by: workerName || "מנהל",
    });
    setForm({ item: "", quantity: "", category: "כללי", notes: "" });
    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("ngs_inventory").update({ status }).eq("id", id);
    await load();
  }

  async function deleteItem(id: string) {
    if (!confirm("למחוק?")) return;
    await supabase.from("ngs_inventory").delete().eq("id", id);
    await load();
  }

  const filtered = filter === "הכל" ? items : items.filter(i => i.status === filter);
  const missing = items.filter(i => i.status === "חסר").length;
  const ordered = items.filter(i => i.status === "הוזמן").length;
  const received = items.filter(i => i.status === "התקבל").length;

  const statusColor: Record<string, string> = {
    "חסר": "#dc2626", "הוזמן": "#f59e0b", "התקבל": "#16a34a"
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* כרטיסי סיכום */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          { label: "פריטים חסרים", value: missing, color: "#dc2626", bg: "#fee2e2" },
          { label: "הוזמנו", value: ordered, color: "#d97706", bg: "#fef3c7" },
          { label: "התקבלו", value: received, color: "#16a34a", bg: "#dcfce7" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: "16px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: s.color, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-top">
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>🛒 ציוד חסר / רשימת קניות</h3>
            <div className="muted" style={{ marginTop: 4 }}>רשום כאן כל פריט שחסר — כולם רואים ויכולים לעדכן</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף פריט</button>
        </div>

        {showForm && (
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, marginBottom: 16, display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div className="field"><label>שם הפריט *</label><input className="input" value={form.item} onChange={e => setForm({...form, item: e.target.value})} placeholder="למשל: ברגים M6" autoFocus /></div>
              <div className="field"><label>כמות</label><input className="input" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="למשל: 100 יח׳" /></div>
              <div className="field">
                <label>קטגוריה</label>
                <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field" style={{ gridColumn: "span 3" }}><label>הערות</label><input className="input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="פרטים נוספים, איפה נמצא, למה נחוץ..." /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" onClick={addItem} disabled={saving}>{saving ? "שומר..." : "➕ הוסף לרשימה"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}

        {/* סינון */}
        <div className="chips" style={{ marginBottom: 16 }}>
          {["הכל", "חסר", "הוזמן", "התקבל"].map(f => (
            <button key={f} className={`btn ${filter === f ? "btn-dark" : "btn-outline"}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {loading ? <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>טוען...</div>
        : filtered.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 40 }}>🛒</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>{filter === "חסר" ? "אין פריטים חסרים כרגע! 🎉" : "אין פריטים"}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map(item => (
              <div key={item.id} style={{ border: `2px solid ${statusColor[item.status] || "#e2e8f0"}30`, borderRight: `4px solid ${statusColor[item.status] || "#e2e8f0"}`, borderRadius: 14, padding: 14, background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{item.item}</span>
                    {item.quantity && <span style={{ background: "#f1f5f9", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>כמות: {item.quantity}</span>}
                    <span style={{ background: "#f1f5f9", borderRadius: 999, padding: "2px 10px", fontSize: 12, color: "#64748b" }}>{item.category}</span>
                    <span style={{ background: `${statusColor[item.status]}20`, color: statusColor[item.status], borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{item.status}</span>
                  </div>
                  {item.notes && <div style={{ fontSize: 13, color: "#64748b" }}>{item.notes}</div>}
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>נוסף ע"י: {item.added_by || "-"} · {new Date(item.created_at).toLocaleDateString("he-IL")}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)}
                    style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 8px", fontSize: 12, background: `${statusColor[item.status]}10` }}>
                    <option value="חסר">❌ חסר</option>
                    <option value="הוזמן">🕐 הוזמן</option>
                    <option value="התקבל">✅ התקבל</option>
                  </select>
                  {!isWorker && <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "#dc2626" }} onClick={() => deleteItem(item.id)}>מחק</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TasksTab({ tasks, employees, isWorker, workerName, onRefresh }: { tasks: any[]; employees: any[]; isWorker: boolean; workerName: string; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assigned_to: "all", priority: "רגילה", due_date: "" });
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [assignMode, setAssignMode] = useState<"all" | "specific">("all");

  async function addTask() {
    if (!form.title) return;
    setSaving(true);
    const assignedTo = isWorker ? workerName : (assignMode === "all" ? "all" : selectedWorkers.join(","));
    await supabase.from("ngs_tasks").insert({
      title: form.title,
      description: form.description,
      assigned_to: assignedTo,
      priority: form.priority,
      due_date: form.due_date || null,
      status: "פתוח",
      created_by: workerName || "מנהל",
    });
    setForm({ title: "", description: "", assigned_to: "all", priority: "רגילה", due_date: "" });
    setSelectedWorkers([]);
    setAssignMode("all");
    setShowForm(false);
    onRefresh();
    setSaving(false);
  }

  async function updateTaskStatus(id: string, status: string) {
    await supabase.from("ngs_tasks").update({ status }).eq("id", id);
    onRefresh();
  }

  async function deleteTask(id: string) {
    if (!confirm("למחוק את המשימה?")) return;
    await supabase.from("ngs_tasks").delete().eq("id", id);
    onRefresh();
  }

  const open = tasks.filter(t => t.status === "פתוח");
  const done = tasks.filter(t => t.status === "הושלם");
  const priorityColor: Record<string, string> = { "דחופה": "#dc2626", "גבוהה": "#f59e0b", "רגילה": "#3b82f6", "נמוכה": "#94a3b8" };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <div className="section-top">
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>✅ {isWorker ? "המשימות שלי" : "משימות"}</h3>
            <div className="muted" style={{ marginTop: 4 }}>{isWorker ? "משימות שהוקצו לך + משימות שפתחת לעצמך" : "ניהול משימות לעובדים"}</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ {isWorker ? "משימה חדשה" : "משימה חדשה"}</button>
        </div>

        {showForm && (
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 16, display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label>כותרת משימה *</label><input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="תאר את המשימה..." /></div>
              {!isWorker && (
                <div className="field" style={{ gridColumn: "span 2" }}>
                  <label>שייך למי?</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, marginTop: 6 }}>
                    <button type="button" onClick={() => { setAssignMode("all"); setSelectedWorkers([]); }}
                      style={{ padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: assignMode === "all" ? "2px solid #c9a227" : "1px solid #e2e8f0", background: assignMode === "all" ? "#fef9ec" : "#f8fafc", color: assignMode === "all" ? "#92710d" : "#475569" }}>
                      👥 כל העובדים
                    </button>
                    <button type="button" onClick={() => setAssignMode("specific")}
                      style={{ padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: assignMode === "specific" ? "2px solid #c9a227" : "1px solid #e2e8f0", background: assignMode === "specific" ? "#fef9ec" : "#f8fafc", color: assignMode === "specific" ? "#92710d" : "#475569" }}>
                      👤 עובדים ספציפיים
                    </button>
                  </div>
                  {assignMode === "specific" && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {employees.filter(e => e.status === "פעיל").map(e => {
                        const selected = selectedWorkers.includes(e.name);
                        return (
                          <button key={e.id} type="button"
                            onClick={() => setSelectedWorkers(selected ? selectedWorkers.filter(n => n !== e.name) : [...selectedWorkers, e.name])}
                            style={{ padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: selected ? "2px solid #3b82f6" : "1px solid #e2e8f0", background: selected ? "#eff6ff" : "#f8fafc", color: selected ? "#1d4ed8" : "#475569" }}>
                            {selected ? "✓ " : ""}{e.name}
                          </button>
                        );
                      })}
                      {selectedWorkers.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8", padding: "6px 0" }}>בחר עובד אחד או יותר</div>}
                    </div>
                  )}
                </div>
              )}
              <div className="field">
                <label>עדיפות</label>
                <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  <option>דחופה</option><option>גבוהה</option><option>רגילה</option><option>נמוכה</option>
                </select>
              </div>
              <div className="field"><label>תאריך יעד</label><input className="input" type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
              <div className="field" style={{ gridColumn: "span 2" }}><label>תיאור</label><textarea className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ minHeight: 70, resize: "vertical" }} placeholder="פרטים נוספים..." /></div>
            </div>
            {isWorker && <div style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", borderRadius: 10, padding: "8px 12px" }}>💡 המשימה תיווצר על שמך — המנהל יוכל לראות אותה</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={addTask} disabled={saving}>{saving ? "שומר..." : "➕ צור משימה"}</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#0f172a" }}>📋 פתוחות ({open.length})</div>
          {open.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 12 }}>אין משימות פתוחות 🎉</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {open.map(t => (
                <div key={t.id} style={{ borderRight: `4px solid ${priorityColor[t.priority] || "#e2e8f0"}`, borderRadius: 14, padding: 16, background: "#fff", border: `1px solid #e8eef6`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{t.title}</span>
                      <span style={{ background: `${priorityColor[t.priority]}20`, color: priorityColor[t.priority], borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{t.priority}</span>
                      {t.assigned_to === "all" ? <span style={{ fontSize: 12, color: "#64748b" }}>👥 כולם</span> : <span style={{ fontSize: 12, color: "#64748b" }}>👤 {t.assigned_to?.split(",").map((s: string) => s.trim()).join(", ")}</span>}
                      {t.created_by && t.created_by !== "מנהל" && <span style={{ fontSize: 11, color: "#94a3b8" }}>נפתח ע"י: {t.created_by}</span>}
                    </div>
                    {t.description && <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{t.description}</div>}
                    {t.due_date && <div style={{ fontSize: 12, color: new Date(t.due_date) < new Date() ? "#dc2626" : "#64748b" }}>📅 יעד: {new Date(t.due_date).toLocaleDateString("he-IL")}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button className="btn btn-primary" style={{ fontSize: 12, padding: "5px 14px" }} onClick={() => updateTaskStatus(t.id, "הושלם")}>✅ סיימתי</button>
                    {!isWorker && <button className="btn btn-outline" style={{ fontSize: 12, padding: "5px 10px", color: "#dc2626" }} onClick={() => deleteTask(t.id)}>מחק</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {done.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#16a34a" }}>✅ הושלמו ({done.length})</div>
            <div style={{ display: "grid", gap: 8 }}>
              {done.map(t => (
                <div key={t.id} style={{ border: "1px solid #dcfce7", borderRadius: 14, padding: 14, background: "#f0fdf4", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.8 }}>
                  <div>
                    <span style={{ fontWeight: 700, textDecoration: "line-through", color: "#64748b" }}>{t.title}</span>
                    {t.assigned_to !== "all" && <span style={{ fontSize: 12, color: "#94a3b8", marginRight: 10 }}>👤 {t.assigned_to}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {!isWorker && <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => updateTaskStatus(t.id, "פתוח")}>פתח מחדש</button>}
                    {!isWorker && <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "#dc2626" }} onClick={() => deleteTask(t.id)}>מחק</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
