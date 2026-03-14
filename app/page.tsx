"use client";
import { useState } from "react";
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
  { key: "owners", label: "בעלי נכסים" },
  { key: "buildings", label: "מבנים" },
  { key: "apartments", label: "דירות" },
  { key: "requests", label: "קריאות שירות" },
  { key: "leases", label: "חוזים" },
  { key: "documents", label: "מסמכים" },
  { key: "tenantPortal", label: "פורטל דייר" },
  { key: "settings", label: "הגדרות" },
  { key: "users", label: "משתמשים" },
  { key: "workcontracts", label: "חוזי עבודה" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function badgeClass(value: string) {
  if (["מושכר", "פעיל", "נסגרה"].includes(value)) return "badge badge-success";
  if (["פנוי", "חדשה", "בינונית"].includes(value)) return "badge badge-warning";
  if (["גבוהה"].includes(value)) return "badge badge-danger";
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

function Dashboard({ openApartment, openBuilding }: { openApartment: (id: string) => void; openBuilding: (id: any) => void }) {
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
  const [aptForm, setAptForm] = useState({ building_id: "", apartment_number: "", floor: "0", rooms: "3", status: "פנוי", rent_amount: "", owner_name: "", tenant_name: "", tenant_phone: "", lease_end: "", fee_type: "percent", fee_value: "8" });
  const [leaseForm, setLeaseForm] = useState({ apartment_id: "", tenant_name: "", start_date: "", end_date: "", rent_amount: "", deposit: "" });
  const [reqForm, setReqForm] = useState({ apartment_id: "", issue: "", urgency: "בינונית", vendor: "", cost: "" });

  useState(() => {
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
  });

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
    await supabase.from("apartments").insert({ ...aptForm, floor: parseInt(aptForm.floor), rooms: parseFloat(aptForm.rooms), rent_amount: parseFloat(aptForm.rent_amount) || 0, fee_value: parseFloat(aptForm.fee_value) || 8 });
    setAptForm({ building_id: "", apartment_number: "", floor: "0", rooms: "3", status: "פנוי", rent_amount: "", owner_name: "", tenant_name: "", tenant_phone: "", lease_end: "", fee_type: "percent", fee_value: "8" });
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
                  <option>נמוכה</option><option>בינונית</option><option>גבוהה</option>
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

function Owners({ openOwner }: { openOwner: (id: number) => void }) {
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

  useState(() => { load(); });

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

function OwnerDetails({ ownerId, back }: { ownerId: number; back: () => void }) {
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

function Settings({ userEmail }: { userEmail: string }) {
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

function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apts, setApts] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*, apartments(apartment_number, buildings(name))").order("created_at", { ascending: false });
    const { data: ap } = await supabase.from("apartments").select("id, apartment_number, buildings(name)");
    setUsers(data || []);
    setApts(ap || []);
    setLoading(false);
  }

  useState(() => { load(); });

  async function approveUser(id: string, role: string) {
    await supabase.from("profiles").update({ status: "מאושר", role }).eq("id", id);
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

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {pending.length > 0 && (
        <div className="card">
          <h3 className="card-title">⏳ בקשות ממתינות לאישור ({pending.length})</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>שם</th><th>אימייל</th><th>טלפון</th><th>תפקיד מבוקש</th><th>תאריך</th><th>פעולות</th></tr></thead>
              <tbody>
                {pending.map(u => (
                  <tr key={u.id} style={{ background: "#fffbeb" }}>
                    <td style={{ fontWeight: 700 }}>{u.full_name}</td>
                    <td>{u.id}</td>
                    <td>{u.phone || "-"}</td>
                    <td><Badge value={u.role === "tenant" ? "דייר" : u.role === "owner" ? "בעל נכס" : u.role} /></td>
                    <td>{new Date(u.created_at).toLocaleDateString("he-IL")}</td>
                    <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => approveUser(u.id, u.role)}>✅ אשר</button>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px", color: "#dc2626" }} onClick={() => rejectUser(u.id)}>❌ דחה</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">✅ משתמשים מאושרים ({approved.length})</h3>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>טוען...</div>
        ) : approved.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>אין משתמשים מאושרים עדיין</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>שם</th><th>טלפון</th><th>תפקיד</th><th>דירה משויכת</th><th>פעולות</th></tr></thead>
              <tbody>
                {approved.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.full_name}</td>
                    <td>{u.phone || "-"}</td>
                    <td>
                      <select style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 8px", fontSize: 13 }}
                        value={u.role || "tenant"}
                        onChange={e => supabase.from("profiles").update({ role: e.target.value }).eq("id", u.id).then(() => load())}>
                        <option value="tenant">דייר</option>
                        <option value="owner">בעל נכס</option>
                        <option value="admin">מנהל</option>
                      </select>
                    </td>
                    <td>
                      <select style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 8px", fontSize: 13 }}
                        value={u.apartment_id || ""}
                        onChange={e => assignApartment(u.id, e.target.value)}>
                        <option value="">לא משויך</option>
                        {apts.map((a: any) => <option key={a.id} value={a.id}>{a.buildings?.name} / {a.apartment_number}</option>)}
                      </select>
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

function Leases() {
  const [leases, setLeases] = useState<any[]>([]);
  const [apts, setApts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("הכל");
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

  useState(() => { load(); });

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

function ServiceRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("הכל");
  const [form, setForm] = useState({
    apartment_id: "", issue: "", description: "",
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

  useState(() => { load(); });

  async function addRequest() {
    if (!form.issue) return;
    setSaving(true);
    await supabase.from("service_requests").insert({
      apartment_id: form.apartment_id || null,
      issue: form.issue,
      description: form.description,
      urgency: form.urgency,
      status: form.status,
      cost: parseFloat(form.cost) || 0,
      vendor: form.vendor
    });
    setForm({ apartment_id: "", issue: "", description: "", urgency: "בינונית", status: "חדשה", cost: "", vendor: "" });
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

  const filtered = filter === "הכל" ? requests : requests.filter(r => r.status === filter);

  return (
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
                <select className="input" value={form.apartment_id} onChange={e => setForm({...form, apartment_id: e.target.value})}>
                  <option value="">בחר דירה</option>
                  {apartments.map((a: any) => <option key={a.id} value={a.id}>{a.buildings?.name} / {a.apartment_number}</option>)}
                </select>
              </div>
              <div className="field"><label>נושא התקלה</label><input className="input" value={form.issue} onChange={e => setForm({...form, issue: e.target.value})} placeholder="נזילה במקלחת" /></div>
              <div className="field">
                <label>דחיפות</label>
                <select className="input" value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})}>
                  <option>נמוכה</option><option>בינונית</option><option>גבוהה</option>
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
                    <td>{r.apartments?.buildings?.name} / {r.apartments?.apartment_number}</td>
                    <td style={{ fontWeight: 700 }}>{r.issue}</td>
                    <td><Badge value={r.urgency} /></td>
                    <td>{r.vendor || "-"}</td>
                    <td>{r.cost ? currency(r.cost) : "-"}</td>
                    <td>
                      <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 8px", fontSize: 13 }}>
                        <option>חדשה</option><option>בטיפול</option><option>ממתין לבעל מקצוע</option><option>הושלם</option>
                      </select>
                    </td>
                    <td><button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => deleteRequest(r.id)}>מחק</button></td>
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

function Buildings({ openBuilding }: { openBuilding: (id: any) => void }) {
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

  useState(() => { loadBuildings(); });

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
  const building = buildings.find((b) => b.id === buildingId) || buildings[0];
  const units = apartments.filter((a) => a.buildingId === building.id);
  const totalIncome = units.reduce((sum, u) => sum + (u.monthlyIncome || 0), 0);
  const rentedUnits = units.filter((u) => u.status === "מושכר").length;
  const vacantUnits = units.filter((u) => u.status === "פנוי").length;
  const floors = Array.from(new Set(units.map((u) => u.floor))).sort((a, b) => a - b);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="detail-top">
        <div>
          <button className="back-link" onClick={back}>← חזרה לרשימת מבנים</button>
          <h2 style={{ margin: "8px 0", fontSize: 34 }}>{building.name}</h2>
          <div className="muted">{building.city} · בניין עם כמה יחידות בכמה קומות</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary">הוסף יחידה</button>
          <button className="btn btn-secondary">הוסף קריאת שירות</button>
          <button className="btn btn-outline">דוח מבנה</button>
        </div>
      </div>

      <div className="detail-kpis">
        <KPI title="שם המבנה" value={building.name} subtitle="נכס מרכזי" />
        <KPI title='סה״כ יחידות' value={String(units.length)} subtitle="בבניין הזה" />
        <KPI title="יחידות מושכרות" value={String(rentedUnits)} subtitle="פעילות כרגע" />
        <KPI title="יחידות פנויות" value={String(vacantUnits)} subtitle="דורש שיווק" />
        <KPI title="הכנסה חודשית" value={currency(totalIncome)} subtitle="מהבניין הזה" />
      </div>

      <div className="card">
        <h3 className="card-title">יחידות לפי קומה</h3>
        <div className="muted" style={{ marginBottom: 16 }}>תצוגת בניין לפי קומות</div>
        <div style={{ display: "grid", gap: 18 }}>
          {floors.map((floor) => {
            const floorUnits = units.filter((u) => u.floor === floor).sort((a, b) => a.apartmentNumber.localeCompare(b.apartmentNumber, "he"));
            return (
              <div key={floor} style={{ border: "1px solid #e8eef6", borderRadius: 20, padding: 18, background: "#fff" }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>קומה {floor}</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {floorUnits.map((unit) => (
                    <div key={unit.id} style={{ border: "1px solid #e8eef6", borderRadius: 18, padding: 16, display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "center", background: "#fbfcfe" }}>
                      <div><div style={{ fontWeight: 800 }}>יחידה {unit.apartmentNumber}</div><div className="muted" style={{ marginTop: 6 }}>{unit.rooms} חדרים</div></div>
                      <div><div style={{ fontSize: 13, color: "#64748b" }}>דייר</div><div style={{ fontWeight: 700, marginTop: 6 }}>{unit.tenant}</div></div>
                      <div><div style={{ fontSize: 13, color: "#64748b" }}>חוזה עד</div><div style={{ fontWeight: 700, marginTop: 6 }}>{unit.leaseEnd}</div></div>
                      <div><div style={{ fontSize: 13, color: "#64748b" }}>הכנסה</div><div style={{ fontWeight: 700, marginTop: 6 }}>{currency(unit.monthlyIncome)}</div></div>
                      <div><div style={{ fontSize: 13, color: "#64748b" }}>סטטוס</div><div style={{ marginTop: 6 }}><Badge value={unit.status} /></div></div>
                      <div><button className="btn btn-outline" onClick={() => openApartment(unit.id)}>פתח דירה</button></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">לוח תפוסה לבניין</h3>
        <div className="muted" style={{ marginBottom: 16 }}>ירוק = מושכר, צהוב = פנוי, אדום = יש קריאה פתוחה</div>
        <div style={{ display: "grid", gap: 18 }}>
          {[...floors].reverse().map((floor) => {
            const floorUnits = units.filter((u) => u.floor === floor).sort((a, b) => a.apartmentNumber.localeCompare(b.apartmentNumber, "he"));
            return (
              <div key={floor} className="building-floor-card">
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14 }}>קומה {floor}</div>
                <div className="building-board-row">
                  {floorUnits.map((unit) => {
                    const color = unit.openRequests > 0 ? "#dc2626" : unit.status === "פנוי" ? "#eab308" : "#16a34a";
                    return (
                      <div key={unit.id} className="building-unit-box" onClick={() => openApartment(unit.id)} style={{ background: color }}>
                        <div>יחידה {unit.apartmentNumber}</div>
                        <div style={{ fontSize: 12, marginTop: 6 }}>{unit.tenant}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Apartments({ openApartment }: { openApartment: (id: any) => void }) {
  const [filter, setFilter] = useState("הכל");
  const [query, setQuery] = useState("");
  const [dbApartments, setDbApartments] = useState<any[]>([]);
  const [dbBuildings, setDbBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    building_id: "", apartment_number: "", floor: "0", rooms: "3",
    status: "פנוי", rent_amount: "", owner_name: "", tenant_name: "",
    tenant_phone: "", lease_end: "", fee_type: "percent", fee_value: "8", notes: ""
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

  useState(() => { load(); });

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
      fee_value: parseFloat(form.fee_value) || 8,
      notes: form.notes
    });
    setShowForm(false);
    setForm({ building_id: "", apartment_number: "", floor: "0", rooms: "3", status: "פנוי", rent_amount: "", owner_name: "", tenant_name: "", tenant_phone: "", lease_end: "", fee_type: "percent", fee_value: "8", notes: "" });
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

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card">
        <div className="section-top">
          <div><h2 className="card-title" style={{ marginBottom: 6 }}>דירות</h2><div className="muted">ניהול כל הדירות, הדיירים, החוזים וההכנסה שלך במקום אחד</div></div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף דירה</button>
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
              <thead><tr><th>מבנה</th><th>דירה</th><th>קומה</th><th>בעל נכס</th><th>דייר</th><th>טלפון</th><th>חוזה עד</th><th>שכירות</th><th>סטטוס</th><th>פעולות</th></tr></thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{item.buildings?.name}</td>
                    <td>{item.apartment_number}</td>
                    <td>{item.floor}</td>
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
  );
}

function ApartmentDetails({ apartmentId, back }: { apartmentId: string; back: () => void }) {
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

  useState(() => {
    async function load() {
      setLoading(true);
      const { data: a } = await supabase.from("apartments").select("*, buildings(name, city)").eq("id", apartmentId).single();
      setApt(a);
      if (a) setEditForm({
        apartment_number: a.apartment_number || "",
        floor: a.floor !== undefined ? String(a.floor) : "0",
        status: a.status || "פנוי",
        tenant_name: a.tenant_name || "",
        tenant_phone: a.tenant_phone || "",
        owner_name: a.owner_name || "",
        rent_amount: a.rent_amount || "",
        lease_end: a.lease_end || "",
        fee_type: a.fee_type || "percent",
        fee_value: a.fee_value || "8",
        notes: a.notes || "",
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
  });

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
      apartment_number: editForm.apartment_number,
      floor: parseInt(editForm.floor) || 0,
      status: editForm.status,
      owner_name: editForm.owner_name,
      tenant_name: editForm.tenant_name,
      tenant_phone: editForm.tenant_phone,
      rent_amount: parseFloat(editForm.rent_amount) || 0,
      lease_end: editForm.lease_end || null,
      fee_type: editForm.fee_type,
      fee_value: parseFloat(editForm.fee_value) || 8,
      notes: editForm.notes,
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
          <h2 style={{ margin: "8px 0", fontSize: 34 }}>{apt.buildings?.name} / דירה {apt.apartment_number}</h2>
          <div className="muted"><Badge value={apt.status} /><span style={{ marginRight: 8 }}>{apt.buildings?.city} · קומה {apt.floor} · {apt.rooms} חדרים</span></div>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(!editing)}>✏️ עריכה</button>
      </div>

      {editing && (
        <div className="card" style={{ background: "#f8fafc", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>עריכת פרטי דירה</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="field"><label>מספר דירה</label><input className="input" value={editForm.apartment_number} onChange={e => setEditForm({...editForm, apartment_number: e.target.value})} placeholder="3" /></div>
            <div className="field"><label>קומה</label><input className="input" type="number" value={editForm.floor} onChange={e => setEditForm({...editForm, floor: e.target.value})} /></div>
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
              <button className="btn btn-primary" onClick={() => { setEditForm({ apartment_number: apt.apartment_number || "", floor: apt.floor !== undefined ? String(apt.floor) : "0", status: apt.status, owner_name: apt.owner_name || "", tenant_name: apt.tenant_name || "", tenant_phone: apt.tenant_phone || "", rent_amount: apt.rent_amount || "", lease_end: apt.lease_end || "", fee_type: apt.fee_type || "percent", fee_value: apt.fee_value || 8, notes: apt.notes || "" }); setEditing(true); }}>✏️ עריכה</button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={saveEdit} disabled={savingEdit}>{savingEdit ? "שומר..." : "💾 שמור"}</button>
                <button className="btn btn-outline" onClick={() => setEditing(false)}>ביטול</button>
              </div>
            )}
          </div>

          {!editing ? (
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
              <InfoBox label="הערות" value={apt.notes || "-"} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="field"><label>מספר דירה</label><input className="input" value={editForm.apartment_number} onChange={e => setEditForm({...editForm, apartment_number: e.target.value})} placeholder="3" /></div>
              <div className="field"><label>קומה</label><input className="input" type="number" value={editForm.floor} onChange={e => setEditForm({...editForm, floor: e.target.value})} /></div>
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


function WorkContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [form, setForm] = useState({ owner_id: "", owner_name: "", start_date: "", end_date: "", fee_type: "percent", fee_value: "8", status: "פעיל", notes: "" });

  async function load() {
    setLoading(true);
    const { data: cs } = await supabase.from("work_contracts").select("*").order("created_at", { ascending: false });
    const { data: os } = await supabase.from("owners").select("*").order("name");
    setContracts(cs || []);
    setOwners(os || []);
    setLoading(false);
  }

  useState(() => { load(); });

  async function addContract() {
    if (!form.owner_name) return;
    setSaving(true);
    await supabase.from("work_contracts").insert({ owner_id: form.owner_id || null, owner_name: form.owner_name, start_date: form.start_date || null, end_date: form.end_date || null, fee_type: form.fee_type, fee_value: parseFloat(form.fee_value) || 8, status: form.status, notes: form.notes });
    setForm({ owner_id: "", owner_name: "", start_date: "", end_date: "", fee_type: "percent", fee_value: "8", status: "פעיל", notes: "" });
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

function OwnerDashboard({ userProfile }: { userProfile: any }) {
  const [ownerApts, setOwnerApts] = useState<any[]>([]);
  const [ownerLeases, setOwnerLeases] = useState<any[]>([]);
  const [ownerWorkContracts, setOwnerWorkContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
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
  });

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

function TenantPortal({ userProfile }: { userProfile: any }) {
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

function Placeholder({ title, text }: { title: string; text: string }) {
  return (
    <div className="card placeholder">
      <div className="placeholder-box">
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}

// ─── Role helpers ────────────────────────────────────────────────────────────

function getNavItemsForRole(role: string) {
  if (role === "tenant") {
    return [
      { key: "tenantPortal", label: "הבית שלי" },
      { key: "requests", label: "קריאות שירות" },
    ];
  }
  if (role === "owner") {
    return [
      { key: "dashboard", label: "סיכום" },
      { key: "apartments", label: "הדירות שלי" },
      { key: "leases", label: "חוזים" },
    ];
  }
  return navItems;
}

function getRoleLabel(role: string) {
  if (role === "tenant") return "דייר";
  if (role === "owner") return "בעל נכס";
  return "מנהל מערכת";
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("admin");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  async function handleForgotPassword() {
    if (!resetEmail) return;
    setLoginLoading(true);
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: "https://property-os-ten.vercel.app"
    });
    setResetSent(true);
    setLoginLoading(false);
  }
  const [regForm, setRegForm] = useState({ full_name: "", phone: "", role: "tenant" });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);


  async function handleLogin() {
    setLoginLoading(true);
    setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError("אימייל או סיסמה שגויים");
      setLoginLoading(false);
      return;
    }
    // Load profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
    if (profile) {
      if (profile.status === "ממתין לאישור") {
        setPendingApproval(true);
        await supabase.auth.signOut();
        setLoginLoading(false);
        return;
      }
      setUserProfile(profile);
      setUserRole(profile.role || "admin");
      if (profile.role === "tenant") setActivePage("tenantPortal");
      else setActivePage("dashboard");
    } else {
      // Admin user - no profile needed
      setUserRole("admin");
      setActivePage("dashboard");
    }
    setLoggedIn(true);
    setLoginLoading(false);
  }

  async function handleRegister() {
    setRegError("");
    if (!email || !password || !regForm.full_name) {
      setRegError("יש למלא את כל השדות");
      return;
    }
    setLoginLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setRegError(error.message);
      setLoginLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: regForm.full_name,
        phone: regForm.phone,
        role: regForm.role,
        status: "ממתין לאישור"
      });
    }
    setRegSuccess(true);
    setLoginLoading(false);
  }
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<any>("");
  const [selectedOwnerId, setSelectedOwnerId] = useState(1);

  function openApartment(id: string) { setSelectedApartmentId(id); setActivePage("apartmentDetails"); }
  function openBuilding(id: any) { setSelectedBuildingId(id); setActivePage("buildingDetails"); }
  function openOwner(id: number) { setSelectedOwnerId(id); setActivePage("ownerDetails"); }

  function renderContent() {
    // Tenant view
    if (userRole === "tenant") {
      switch (activePage) {
        case "tenantPortal": return <TenantPortal userProfile={userProfile} />;
        case "requests": return (
          <div style={{ display: "grid", gap: 18 }}>
            <div className="card">
              <h3 className="card-title">הקריאות שלי</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>תאריך</th><th>תקלה</th><th>סטטוס</th></tr></thead>
                  <tbody>
                    {serviceRequests.map(item => (
                      <tr key={item.id}><td>{item.apartment}</td><td>{item.issue}</td><td><span className={badgeClass(item.status)}>{item.status}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <h3 className="card-title">פתיחת קריאה חדשה</h3>
              <div style={{ display: "grid", gap: 12, maxWidth: 620 }}>
                <input className="search" style={{ width: "100%" }} placeholder="נושא התקלה" />
                <textarea placeholder="תיאור התקלה" style={{ width: "100%", minHeight: 120, border: "1px solid #dbe3ee", borderRadius: 16, padding: 14, resize: "vertical", fontFamily: "inherit" }} />
                <button className="btn btn-primary" style={{ width: "fit-content" }}>שלח קריאה</button>
              </div>
            </div>
          </div>
        );
        default: return <TenantPortal userProfile={userProfile} />;
      }
    }

    // Owner view
    if (userRole === "owner") {
      switch (activePage) {
        case "dashboard": return <OwnerDashboard userProfile={userProfile} />;
        default: return <OwnerDashboard userProfile={userProfile} />;
      }
    }

    // Admin view
    switch (activePage) {
      case "dashboard": return <Dashboard openApartment={openApartment} openBuilding={openBuilding} />;
      case "owners": return <Owners openOwner={openOwner} />;
      case "ownerDetails": return <OwnerDetails ownerId={selectedOwnerId} back={() => setActivePage("owners")} />;
      case "buildings": return <Buildings openBuilding={openBuilding} />;
      case "buildingDetails": return <BuildingDetails buildingId={selectedBuildingId} back={() => setActivePage("buildings")} openApartment={openApartment} />;
      case "apartments": return <Apartments openApartment={openApartment} />;
      case "apartmentDetails": return <ApartmentDetails apartmentId={selectedApartmentId} back={() => setActivePage("apartments")} />;
      case "requests": return <ServiceRequests />;
      case "leases": return <Leases />;
      case "documents": return <Placeholder title="מסמכים" text="כאן ירוכזו חוזים, תמונות, הצעות מחיר, הסכמי ניהול וכל מסמך שקשור לבעל נכס, דירה או חוזה." />;
      case "tenantPortal": return <TenantPortal userProfile={userProfile} />;
      case "settings": return <Settings userEmail={email} />;
      case "users": return <UsersManagement />;
      case "workcontracts": return <WorkContracts />;
      default: return null;
    }
  }

  if (!loggedIn) {
    return (
      <section className="login-shell">
        <div className="login-wrap">
          <div className="login-left">
            <div>
              <div className="eyebrow"><span className="dot" />GM · ניהול נכסים</div>
              <h1 className="login-title">שליטה מלאה על המבנים, היחידות, הקריאות וההכנסות שלך</h1>
              <div className="login-sub">מערכת יוקרתית לניהול נכסים שמתאימה במיוחד לעבודה שלך: כמה יחידות באותו בניין, בכמה קומות שונות, עם מעקב על תפוסה, חוזים, קריאות שירות, ההכנסה האישית שלך וגם רווחיות לבעלי הנכסים.</div>
              <div className="hero-grid">
                {[["47","יחידות במערכת"],["6","קריאות פתוחות"],["12","בעלי נכסים פעילים"],["6,840 ₪","הכנסה חודשית"]].map(([num, label]) => (
                  <div key={label} className="hero-stat"><div className="num">{num}</div><div className="label">{label}</div></div>
                ))}
              </div>
            </div>
          </div>
          <div className="login-right">
            <div className="login-card">
              {pendingApproval ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                  <h2 style={{ marginBottom: 8 }}>ממתין לאישור</h2>
                  <p style={{ color: "#64748b" }}>הבקשה שלך נשלחה למנהל המערכת. תקבל הודעה כשתאושר.</p>
                  <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => setPendingApproval(false)}>חזרה להתחברות</button>
                </div>
              ) : regSuccess ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h2 style={{ marginBottom: 8 }}>הבקשה נשלחה!</h2>
                  <p style={{ color: "#64748b" }}>המנהל יאשר את הבקשה שלך בקרוב.</p>
                  <button className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => { setRegSuccess(false); setAuthMode("login"); }}>חזרה להתחברות</button>
                </div>
              ) : authMode === "login" ? (
                <>
                  <h1>כניסה למערכת</h1>
                  <p>התחבר עם האימייל והסיסמה שלך</p>
                  <div className="field"><label>אימייל</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>
                  <div className="field"><label>סיסמה</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" /></div>
                  {loginError && <div style={{color:"#dc2626", marginBottom:10, fontSize:14}}>{loginError}</div>}
                  <button className="btn btn-primary" style={{ width: "100%", height: 52 }} onClick={handleLogin} disabled={loginLoading}>{loginLoading ? "מתחבר..." : "התחבר"}</button>
                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <button className="btn-link" style={{ fontSize: 13, color: "#64748b" }} onClick={() => setAuthMode("forgot")}>שכחתי סיסמה</button>
                  </div>
                  <div style={{ marginTop: 8, textAlign: "center", color: "#64748b", fontSize: 14 }}>
                    אין לך חשבון?{" "}
                    <button className="btn-link" onClick={() => setAuthMode("register")}>הירשם כאן</button>
                  </div>
                </>
              ) : authMode === "forgot" ? (
                <>
                  {resetSent ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
                      <h2 style={{ marginBottom: 8 }}>האימייל נשלח!</h2>
                      <p style={{ color: "#64748b" }}>בדוק את תיבת הדואר שלך ולחץ על הקישור לאיפוס הסיסמה.</p>
                      <button className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => { setResetSent(false); setAuthMode("login"); }}>חזרה להתחברות</button>
                    </div>
                  ) : (
                    <>
                      <h1>שחזור סיסמה</h1>
                      <p style={{ color: "#64748b" }}>הזן את האימייל שלך ונשלח לך קישור לאיפוס הסיסמה</p>
                      <div className="field"><label>אימייל</label><input className="input" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="your@email.com" /></div>
                      <button className="btn btn-primary" style={{ width: "100%", height: 52, marginTop: 8 }} onClick={handleForgotPassword} disabled={loginLoading}>{loginLoading ? "שולח..." : "שלח קישור לאיפוס"}</button>
                      <div style={{ marginTop: 16, textAlign: "center" }}>
                        <button className="btn-link" style={{ color: "#64748b", fontSize: 14 }} onClick={() => setAuthMode("login")}>חזרה להתחברות</button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <h1>הרשמה למערכת</h1>
                  <p>מלא את הפרטים ומנהל יאשר את הגישה שלך</p>
                  <div className="field"><label>שם מלא *</label><input className="input" value={regForm.full_name} onChange={e => setRegForm({...regForm, full_name: e.target.value})} placeholder="ישראל ישראלי" /></div>
                  <div className="field"><label>אימייל *</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>
                  <div className="field"><label>סיסמה *</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="לפחות 6 תווים" /></div>
                  <div className="field"><label>טלפון</label><input className="input" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="052-1234567" /></div>
                  <div className="field">
                    <label>תפקיד</label>
                    <select className="input" value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value})}>
                      <option value="tenant">דייר</option>
                      <option value="owner">בעל נכס</option>
                    </select>
                  </div>
                  {regError && <div style={{color:"#dc2626", marginBottom:10, fontSize:14}}>{regError}</div>}
                  <button className="btn btn-primary" style={{ width: "100%", height: 52 }} onClick={handleRegister} disabled={loginLoading}>{loginLoading ? "שולח..." : "שלח בקשת הצטרפות"}</button>
                  <div style={{ marginTop: 16, textAlign: "center", color: "#64748b", fontSize: 14 }}>
                    יש לך כבר חשבון?{" "}
                    <button className="btn-link" onClick={() => setAuthMode("login")}>התחבר כאן</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🏢</div>
          <div><small>GM</small><strong>ניהול נכסים</strong></div>
        </div>
        <nav className="nav">
          {getNavItemsForRole(userRole).map((item) => (
            <button key={item.key} className={`nav-btn ${activePage === item.key || (activePage === "apartmentDetails" && item.key === "apartments") || (activePage === "buildingDetails" && item.key === "buildings") || (activePage === "ownerDetails" && item.key === "owners") ? "active" : ""}`} onClick={() => setActivePage(item.key)}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="side-card">
          <div className="avatar">{email[0]?.toUpperCase()}</div>
          <div>
            <div className="name">{email}</div>
            <div className="role">{getRoleLabel(userRole)}</div>
          </div>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div><h1>שלום מנהל מערכת</h1><div className="sub">תצוגה מוקדמת מלאה של המערכת</div></div>
          <div className="top-actions">
            <input className="search" placeholder="חיפוש מהיר..." />
            <button className="btn btn-dark">הוספה מהירה</button>
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
