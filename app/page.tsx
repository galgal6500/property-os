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

function Dashboard({ openApartment, openBuilding }: { openApartment: (id: number) => void; openBuilding: (id: number) => void }) {
  const vacant = apartments.filter((a) => a.status === "פנוי");
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="kpi-grid">
        <KPI title="בעלי נכסים" value="12" subtitle="לקוחות פעילים" />
        <KPI title="מבנים" value="5" subtitle="מבנים מנוהלים" />
        <KPI title="דירות" value="47" subtitle='סה״כ במערכת' />
        <KPI title="דירות פנויות" value="4" subtitle="דורש שיווק" />
        <KPI title="קריאות פתוחות" value="6" subtitle="לטיפול" />
        <KPI title="חוזים קרובים לסיום" value="3" subtitle="30 יום קדימה" />
        <KPI title="הכנסה חודשית" value={currency(totalMonthlyIncome())} subtitle="הכנסה צפויה מניהול" />
      </div>

      <div className="grid-2-1">
        <div className="card">
          <h3 className="card-title">קריאות שירות שדורשות טיפול</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>דירה</th><th>תקלה</th><th>דחיפות</th><th>סטטוס</th></tr></thead>
              <tbody>
                {serviceRequests.map((item) => (
                  <tr key={item.id}>
                    <td>{item.apartment}</td>
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
            <button className="btn btn-primary">הוסף בעל נכס</button>
            <button className="btn btn-secondary">הוסף דירה</button>
            <button className="btn btn-secondary">הוסף חוזה</button>
            <button className="btn btn-secondary">פתח קריאת שירות</button>
          </div>
        </div>
      </div>

      <div className="grid-1-1">
        <div className="card">
          <h3 className="card-title">חוזים שמסתיימים בקרוב</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>דירה</th><th>דייר</th><th>בעל נכס</th><th>תאריך סיום</th></tr></thead>
              <tbody>
                {leasesEndingSoon.map((item) => (
                  <tr key={item.id}><td>{item.apartment}</td><td>{item.tenant}</td><td>{item.owner}</td><td>{item.endDate}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">דירות שצריך לקדם</h3>
          <div className="vacant-list">
            {vacant.map((item) => (
              <div key={item.id} className="vacant-item" onClick={() => openApartment(item.id)}>
                <div style={{ fontWeight: 800 }}>{item.building} / דירה {item.apartmentNumber}</div>
                <div className="muted" style={{ marginTop: 6 }}>בעל נכס: {item.owner}</div>
                <div className="muted" style={{ marginTop: 6 }}>הכנסה צפויה: {currency(item.monthlyIncome)}</div>
                <div style={{ marginTop: 12 }}><Badge value={item.status} /></div>
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
  return (
    <div className="card">
      <div className="section-top">
        <div>
          <h2 className="card-title" style={{ marginBottom: 6 }}>בעלי נכסים</h2>
          <div className="muted">רשימת הלקוחות שלך במערכת כולל רווחיות והוצאות</div>
        </div>
        <button className="btn btn-primary">הוסף בעל נכס</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>שם</th><th>טלפון</th><th>אימייל</th><th>הכנסות חודשיות</th><th>הוצאות חודשיות</th><th>רווח נטו</th><th>פעולות</th></tr></thead>
          <tbody>
            {owners.map((owner) => {
              const ownerUnits = apartments.filter((a) => a.owner === owner.name);
              const income = ownerUnits.reduce((sum, u) => sum + (u.rentAmount || 0), 0);
              const expenses = ownerExpenses.filter((e) => e.ownerName === owner.name && e.paidBy === "בעל נכס").reduce((sum, e) => sum + e.amount, 0);
              return (
                <tr key={owner.id}>
                  <td style={{ fontWeight: 800 }}>{owner.name}</td>
                  <td>{owner.phone}</td>
                  <td>{owner.email}</td>
                  <td>{currency(income)}</td>
                  <td>{currency(expenses)}</td>
                  <td>{currency(income - expenses)}</td>
                  <td><button className="btn btn-outline" onClick={() => openOwner(owner.id)}>צפייה</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

function Buildings({ openBuilding }: { openBuilding: (id: number) => void }) {
  return (
    <div className="card">
      <div className="section-top">
        <div><h2 className="card-title">מבנים</h2><div className="muted">ניהול הבניינים שבהם יש לך יחידות</div></div>
        <button className="btn btn-primary">הוסף מבנה</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>מבנה</th><th>עיר</th><th>מספר יחידות</th><th>קומות פעילות</th><th>יחידות מושכרות</th><th>הכנסה חודשית</th><th>פעולות</th></tr></thead>
          <tbody>
            {buildings.map((b) => {
              const units = apartments.filter((a) => a.buildingId === b.id);
              const rented = units.filter((u) => u.status === "מושכר").length;
              const income = units.reduce((sum, u) => sum + (u.monthlyIncome || 0), 0);
              const floors = Array.from(new Set(units.map((u) => u.floor))).sort((a, z) => a - z).join(", ");
              return (
                <tr key={b.id}>
                  <td style={{ fontWeight: 800 }}>{b.name}</td><td>{b.city}</td><td>{units.length}</td>
                  <td>{floors}</td><td>{rented}</td><td>{currency(income)}</td>
                  <td><button className="btn btn-outline" onClick={() => openBuilding(b.id)}>צפייה</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BuildingDetails({ buildingId, back, openApartment }: { buildingId: number; back: () => void; openApartment: (id: number) => void }) {
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

function Apartments({ openApartment }: { openApartment: (id: number) => void }) {
  const [filter, setFilter] = useState("הכל");
  const [query, setQuery] = useState("");

  const filtered = apartments.filter((item) => {
    const q = !query || item.building.includes(query) || item.owner.includes(query) || item.tenant.includes(query) || item.apartmentNumber.includes(query);
    const s = filter === "הכל" ? true : item.status === filter;
    return q && s;
  });

  return (
    <div className="card">
      <div className="section-top">
        <div><h2 className="card-title" style={{ marginBottom: 6 }}>דירות</h2><div className="muted">ניהול כל הדירות, הדיירים, החוזים וההכנסה שלך במקום אחד</div></div>
        <button className="btn btn-primary">הוסף דירה</button>
      </div>
      <div className="filter-row">
        <input className="search" style={{ width: "100%" }} placeholder="חיפוש לפי מבנה, דייר, בעל נכס או מספר דירה" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="chips">
          {["הכל", "מושכר", "פנוי"].map((f) => (
            <button key={f} className={`btn ${filter === f ? "btn-dark" : "btn-outline"}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>מבנה</th><th>דירה</th><th>קומה</th><th>בעל נכס</th><th>דייר</th><th>טלפון</th><th>חוזה עד</th><th>הכנסה חודשית</th><th>סטטוס</th><th>פעולות</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.building}</td><td>{item.apartmentNumber}</td><td>{item.floor}</td>
                <td>{item.owner}</td><td>{item.tenant}</td><td>{item.phone}</td>
                <td>{item.leaseEnd}</td><td>{currency(item.monthlyIncome)}</td>
                <td><Badge value={item.status} /></td>
                <td><button className="btn btn-outline" onClick={() => openApartment(item.id)}>צפייה</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApartmentDetails({ apartmentId, back }: { apartmentId: number; back: () => void }) {
  const [tab, setTab] = useState("summary");
  const apartment = apartments.find((a) => a.id === apartmentId) || apartments[0];

  const tabs = [
    { key: "summary", label: "סיכום" }, { key: "tenant", label: "דייר" }, { key: "lease", label: "חוזה" },
    { key: "requests", label: "קריאות שירות" }, { key: "documents", label: "מסמכים" }, { key: "history", label: "היסטוריה" },
  ];

  return (
    <div>
      <div className="detail-top">
        <div>
          <button className="back-link" onClick={back}>← חזרה לרשימת דירות</button>
          <h2 style={{ margin: "8px 0", fontSize: 34 }}>{apartment.building} / דירה {apartment.apartmentNumber}</h2>
          <div className="muted"><Badge value={apartment.status} /><span style={{ marginRight: 8 }}>{apartment.city} · קומה {apartment.floor}</span></div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary">הוספת דייר</button>
          <button className="btn btn-secondary">הוספת חוזה</button>
          <button className="btn btn-outline">פתיחת קריאת שירות</button>
        </div>
      </div>

      <div className="detail-kpis">
        <KPI title="בעל נכס" value={apartment.owner} subtitle="לקוח משויך" />
        <KPI title="דייר נוכחי" value={apartment.tenant} subtitle="דייר פעיל" />
        <KPI title="חוזה עד" value={apartment.leaseEnd} subtitle="מועד סיום" />
        <KPI title="קריאות פתוחות" value={String(apartment.openRequests)} subtitle="לטיפול" />

      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`btn ${tab === t.key ? "btn-dark" : "btn-outline"}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="card">
          <h3 className="card-title">פרטי דירה</h3>
          <div className="info-grid">
            <InfoBox label="מבנה" value={apartment.building} />
            <InfoBox label="עיר" value={apartment.city} />
            <InfoBox label="מספר דירה" value={apartment.apartmentNumber} />
            <InfoBox label="קומה" value={apartment.floor} />
            <InfoBox label="מספר חדרים" value={apartment.rooms} />
            <InfoBox label="סטטוס" value={apartment.status} />
            <InfoBox label="שכר דירה" value={currency(apartment.rentAmount)} />
            <InfoBox label="הכנסה חודשית" value={currency(apartment.monthlyIncome)} />
          </div>
          <div className="note">{apartment.notes}</div>
        </div>
      )}

      {tab === "tenant" && (
        <div className="card">
          <h3 className="card-title">פרטי דייר</h3>
          <div className="split-2">
            <div className="mini-user">
              <div className="avatar">{apartment.tenant === "-" ? "—" : apartment.tenant[0]}</div>
              <div><div style={{ fontWeight: 800, fontSize: 20 }}>{apartment.tenant}</div><div className="muted">דייר פעיל</div></div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div className="line-item">טלפון: {apartment.phone}</div>
              <div className="line-item">אימייל: dani@example.com</div>
              <div className="line-item">מספר נפשות: 3</div>
            </div>
          </div>
        </div>
      )}

      {tab === "lease" && (
        <div className="card">
          <h3 className="card-title">חוזה פעיל</h3>
          <div className="info-grid">
            <InfoBox label="תאריך התחלה" value="15/04/2025" />
            <InfoBox label="תאריך סיום" value={apartment.leaseEnd} />
            <InfoBox label="שכר דירה" value={currency(apartment.rentAmount)} />
            <InfoBox label="סטטוס" value="פעיל" />
            <InfoBox label="סוג עמלה" value={apartment.feeType === "percent" ? "אחוז" : "סכום קבוע"} />
            <InfoBox label="גובה עמלה" value={apartment.feeType === "percent" ? apartment.feeValue + "%" : currency(apartment.feeValue)} />
            <InfoBox label="הכנסה חודשית שלך" value={currency(apartment.monthlyIncome)} />
            <InfoBox label="בעל נכס" value={apartment.owner} />
          </div>
          <div className="note">קובץ מצורף: חוזה שכירות 2025.pdf</div>
        </div>
      )}

      {tab === "requests" && (
        <div className="card">
          <h3 className="card-title">קריאות שירות</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>תקלה</th><th>דחיפות</th><th>סטטוס</th><th>עלות</th></tr></thead>
              <tbody>
                {serviceRequests.map((item) => (
                  <tr key={item.id}><td>{item.issue}</td><td><Badge value={item.urgency} /></td><td><Badge value={item.status} /></td><td>{item.cost}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "documents" && (
        <div className="card">
          <h3 className="card-title">מסמכים</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {documents.map((doc) => (
              <div key={doc.id} className="doc-row">
                <div><div style={{ fontWeight: 800 }}>{doc.name}</div><div className="muted" style={{ marginTop: 6 }}>{doc.type} · {doc.date}</div></div>
                <button className="btn btn-outline">פתח</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="split-2">
          <div className="card">
            <h3 className="card-title">היסטוריית דיירים</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>דייר</th><th>כניסה</th><th>יציאה</th></tr></thead>
                <tbody>{tenantHistory.map((item) => (<tr key={item.id}><td>{item.name}</td><td>{item.from}</td><td>{item.to}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">היסטוריית חוזים</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>התחלה</th><th>סיום</th><th>שכירות</th><th>סטטוס</th></tr></thead>
                <tbody>{leaseHistory.map((item) => (<tr key={item.id}><td>{item.from}</td><td>{item.to}</td><td>{item.rent}</td><td><Badge value={item.status} /></td></tr>))}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TenantPortal() {
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
  const [email, setEmail] = useState("admin@property.com");
  const [password, setPassword] = useState("123456");
  const [userRole, setUserRole] = useState("admin");

  async function handleLogin() {
    setLoginLoading(true);
    setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError("אימייל או סיסמה שגויים");
    } else {
      // Determine role from email (can be replaced with DB lookup later)
      const userEmail = data.user?.email || "";
      let role = "admin";
      if (userEmail.includes("tenant") || userEmail.includes("dayer")) role = "tenant";
      else if (userEmail.includes("owner") || userEmail.includes("baal")) role = "owner";
      setUserRole(role);
      if (role === "tenant") setActivePage("tenantPortal");
      else setActivePage("dashboard");
      setLoggedIn(true);
    }
    setLoginLoading(false);
  }
  const [selectedApartmentId, setSelectedApartmentId] = useState(1);
  const [selectedBuildingId, setSelectedBuildingId] = useState(1);
  const [selectedOwnerId, setSelectedOwnerId] = useState(1);

  function openApartment(id: number) { setSelectedApartmentId(id); setActivePage("apartmentDetails"); }
  function openBuilding(id: number) { setSelectedBuildingId(id); setActivePage("buildingDetails"); }
  function openOwner(id: number) { setSelectedOwnerId(id); setActivePage("ownerDetails"); }

  function renderContent() {
    // Tenant view
    if (userRole === "tenant") {
      switch (activePage) {
        case "tenantPortal": return <TenantPortal />;
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
        default: return <TenantPortal />;
      }
    }

    // Owner view
    if (userRole === "owner") {
      const ownerName = "יוסי כהן"; // will be dynamic later
      const ownerUnits = apartments.filter(a => a.owner === ownerName);
      const endingSoon = leasesEndingSoon.filter(l => ownerUnits.some(u => l.apartment.includes(u.building)));

      switch (activePage) {
        case "dashboard": return (() => {
          const totalRent = ownerUnits.reduce((s,u) => s + u.rentAmount, 0);
          const totalFees = ownerUnits.reduce((s,u) => s + u.monthlyIncome, 0);
          const serviceExpenses = 450; // dynamic later
          const totalExpenses = totalFees + serviceExpenses;
          return (
          <div style={{ display: "grid", gap: 18 }}>
            <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
              <KPI title="הדירות שלי" value={String(ownerUnits.length)} subtitle="דירות משויכות" />
              <KPI title="הכנסות החודש" value={currency(totalRent)} subtitle="שכירות מכל הדירות" />
              <KPI title="חוזים קרובים לסיום" value={String(endingSoon.length)} subtitle="30 יום קדימה" />
            </div>

            <div className="grid-1-1">
              <div className="card">
                <h3 className="card-title">💰 הכנסות — שכירות לפי דירה</h3>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>מבנה</th><th>דירה</th><th>דייר</th><th>שכירות חודשית</th><th>סטטוס</th></tr></thead>
                    <tbody>
                      {ownerUnits.filter(u => u.rentAmount > 0).map(u => (
                        <tr key={u.id}>
                          <td>{u.building}</td>
                          <td>{u.apartmentNumber}</td>
                          <td>{u.tenant}</td>
                          <td style={{fontWeight:700, color:"#16a34a"}}>{currency(u.rentAmount)}</td>
                          <td><span className={badgeClass(u.status)}>{u.status}</span></td>
                        </tr>
                      ))}
                      <tr style={{borderTop:"2px solid #e2e8f0"}}>
                        <td colSpan={3} style={{fontWeight:700}}>סה״כ הכנסות</td>
                        <td style={{fontWeight:800, color:"#16a34a"}}>{currency(totalRent)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">📋 הוצאות החודש</h3>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>תיאור</th><th>דירה</th><th>סכום</th></tr></thead>
                    <tbody>
                      {ownerUnits.filter(u => u.monthlyIncome > 0).map(u => (
                        <tr key={u.id}>
                          <td>עמלת ניהול ({u.feeType === "percent" ? u.feeValue + "%" : "קבועה"})</td>
                          <td>{u.building} / {u.apartmentNumber}</td>
                          <td style={{fontWeight:700, color:"#dc2626"}}>{currency(u.monthlyIncome)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td>תיקון אינסטלטור</td>
                        <td>הרצל 10 / 3</td>
                        <td style={{fontWeight:700, color:"#dc2626"}}>{currency(450)}</td>
                      </tr>
                      <tr style={{borderTop:"2px solid #e2e8f0"}}>
                        <td colSpan={2} style={{fontWeight:700}}>סה״כ הוצאות</td>
                        <td style={{fontWeight:800, color:"#dc2626"}}>{currency(totalExpenses)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {endingSoon.length > 0 && (
              <div className="card">
                <h3 className="card-title">⚠️ חוזים שמסתיימים בקרוב</h3>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>דירה</th><th>דייר</th><th>תאריך סיום</th></tr></thead>
                    <tbody>
                      {endingSoon.map(item => (
                        <tr key={item.id}><td>{item.apartment}</td><td>{item.tenant}</td><td style={{color:"#dc2626", fontWeight:800}}>{item.endDate}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          );
        })();
        case "apartments": return <Apartments openApartment={openApartment} />;
        case "apartmentDetails": return <ApartmentDetails apartmentId={selectedApartmentId} back={() => setActivePage("apartments")} />;
        case "leases": return (
          <div className="card">
            <h3 className="card-title">החוזים שלי</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>דירה</th><th>דייר</th><th>תאריך סיום</th><th>שכירות</th><th>סטטוס</th></tr></thead>
                <tbody>
                  {ownerUnits.map(u => (
                    <tr key={u.id}><td>{u.building} / {u.apartmentNumber}</td><td>{u.tenant}</td><td>{u.leaseEnd}</td><td>{currency(u.rentAmount)}</td><td><span className={badgeClass(u.status)}>{u.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        default: return null;
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
      case "requests": return <Placeholder title="קריאות שירות" text="כאן יהיה בהמשך מסך מלא לניהול קריאות, עם פילטרים, סטטוסים, עלויות, בעלי מקצוע ותיעוד מלא." />;
      case "leases": return <Placeholder title="חוזים" text="כאן ייכנס מסך ניהול החוזים, כולל תאריכי התחלה וסיום, קבצים, תזכורות על סיום חוזה, סכומי שכירות וגם ההכנסה שלך." />;
      case "documents": return <Placeholder title="מסמכים" text="כאן ירוכזו חוזים, תמונות, הצעות מחיר, הסכמי ניהול וכל מסמך שקשור לבעל נכס, דירה או חוזה." />;
      case "tenantPortal": return <TenantPortal />;
      case "settings": return <Placeholder title="הגדרות" text="כאן יהיו בהמשך פרטי העסק, סוגי תקלות, התראות, הרשאות משתמשים והגדרות מערכת נוספות." />;
      default: return null;
    }
  }

  if (!loggedIn) {
    return (
      <section className="login-shell">
        <div className="login-wrap">
          <div className="login-left">
            <div>
              <div className="eyebrow"><span className="dot" />Property OS · מערכת ניהול נכסים</div>
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
              <h1>כניסה למערכת</h1>
              <p>גרסת דמו מלאה למערכת ניהול הנכסים שלך.</p>
              <div className="field"><label>אימייל</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="field"><label>סיסמה</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              {loginError && <div style={{color:"#dc2626", marginBottom:10, fontSize:14}}>{loginError}</div>}
              <button className="btn btn-primary" style={{ width: "100%", height: 52 }} onClick={handleLogin} disabled={loginLoading}>{loginLoading ? "מתחבר..." : "התחבר"}</button>
              <div style={{ marginTop: 16, textAlign: "center" }}><button className="btn-link">שכחתי סיסמה</button></div>
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
          <div><small>PROPERTY OS</small><strong>ניהול נכסים</strong></div>
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
