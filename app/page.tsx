"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { NGSDashboard } from "./NGSDashboard";
import { Owners, OwnerDetails, Buildings, Settings, OwnerDashboard, TenantPortal, Apartments, ApartmentDetails, ServiceRequests, Leases, PaymentsTracker, WorkContracts, ActivityLog, UsersManagement, Placeholder } from "./PropertyDashboard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

                <div style={{ fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: 8 }}>👷 עובדים:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {employees.filter(e => e.status === "פעיל").map(e => {
                    const selected = workLogForm.employee_name.split(",").map((s: string) => s.trim()).includes(e.name);
                    return (
                      <button key={e.id} type="button"
                        style={{ padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: selected ? "2px solid #c9a227" : "1px solid #e2e8f0", background: selected ? "#fef9ec" : "#f8fafc", color: selected ? "#92710d" : "#475569" }}
                        onClick={() => {
                          const current = workLogForm.employee_name ? workLogForm.employee_name.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
                          const updated = selected ? current.filter((n: string) => n !== e.name) : [...current, e.name];
                          setWorkLogForm({...workLogForm, employee_name: updated.join(", ")});
                        }}>{selected ? "✓ " : ""}{e.name}</button>
                    );
                  })}
                </div>
                <input className="input" value={workLogForm.workers} onChange={e => setWorkLogForm({...workLogForm, workers: e.target.value})} placeholder="הוסף עובד ידנית..." />
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#475569" }}>📝 פירוט העבודה (עד 10 שורות):</div>
              <div style={{ display: "grid", gap: 8 }}>
                {([1,2,3,4,5,6,7,8,9,10] as number[]).map(n => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 700, minWidth: 24 }}>{n}.</span>
                    <input className="input" style={{ flex: 1 }} value={(workLogForm as any)[`line${n}`]} onChange={e => setWorkLogForm({...workLogForm, [`line${n}`]: e.target.value})} placeholder={`שורה ${n}...`} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={saveWorkLog} disabled={saving}>{saving ? "שומר..." : "💾 שמור יומן"}</button>
                <button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button>
              </div>
            </div>
          )}
          {workLogs.length === 0 ? <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}><div style={{ fontSize: 40 }}>📋</div><div style={{ fontWeight: 700, marginTop: 8 }}>אין יומני עבודה</div></div>
          : (
            <div style={{ display: "grid", gap: 10 }}>
              {workLogs.filter(w => workLogFilter === "הכל" ? true : workLogFilter === "לא טופל" ? w.performa !== "יצאה פרפורמה" : w.performa === "יצאה פרפורמה").map(w => (
                <div key={w.id} style={{ border: "1px solid #e8eef6", borderRadius: 16, padding: "14px 18px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, background: "#1e293b", color: "#d5b57a", borderRadius: 999, padding: "2px 10px" }}>#{formatSerial(w.serial_number)}</span>
                        <span style={{ fontSize: 18, fontWeight: 900 }}>{w.date ? new Date(w.date).toLocaleDateString("he-IL") : "-"}</span>
                      </div>
                      <div style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>{w.branch ? `📍 ${w.branch}` : ""}{w.project_name ? ` · 🤝 ${w.project_name}` : ""}</div>
                      {w.filled_by && <div style={{ fontSize: 13, color: "#94a3b8" }}>ממלא: {w.filled_by}</div>}
                    </div>
                    {!isWorker && (
                      <span style={{ background: w.performa === "יצאה פרפורמה" ? "#dcfce7" : "#fee2e2", color: w.performa === "יצאה פרפורמה" ? "#16a34a" : "#dc2626", borderRadius: 999, padding: "3px 14px", fontSize: 12, fontWeight: 700 }}>
                        {w.performa === "יצאה פרפורמה" ? "✅ פרפורמה" : "❌ לא טופל"}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="btn btn-primary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => setSelectedWorkLog(w)}>📄 פתח יומן</button>
                    {(isWorker ? (w.filled_by === workerName || w.employee_name?.includes(workerName)) : true) && (
                      <button className="btn btn-outline" style={{ fontSize: 13, padding: "6px 14px" }} onClick={() => setEditingWorkLog({...w})}>✏️ עריכה</button>
                    )}
                    <button className="btn btn-outline" style={{ fontSize: 13, padding: "6px 14px" }} onClick={() => {
                      const lines = [1,2,3,4,5,6,7,8,9,10].map(n => w[`line${n}`]).filter(Boolean);
                      const workers = [w.employee_name, w.workers].filter(Boolean).join(", ");
                      const win = window.open("", "_blank");
                      if (win) {
                        win.document.write(`<html dir="rtl"><head><title>יומן עבודה #${formatSerial(w.serial_number)}</title><style>body{font-family:Arial,sans-serif;padding:32px;direction:rtl}h2{font-size:22px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f1f5f9}@media print{button{display:none}}</style></head><body>`);
                        win.document.write(`<h2>📋 יומן עבודה #${formatSerial(w.serial_number)}</h2>`);
                        win.document.write(`<p>תאריך: ${w.date ? new Date(w.date).toLocaleDateString("he-IL") : "-"} | לקוח: ${w.project_name || "-"} | סניף: ${w.branch || "-"}</p>`);
                        win.document.write(`<p>עובדים: ${workers || "-"} | שעות: ${w.hours || "-"} | ממלא: ${w.filled_by || "-"}</p>`);
                        win.document.write(`<table><thead><tr><th>#</th><th>פירוט עבודה</th></tr></thead><tbody>`);
                        lines.forEach((l, i) => win.document.write(`<tr><td>${i+1}</td><td>${l}</td></tr>`));
                        win.document.write(`</tbody></table>`);
                        if (w.client_notes) win.document.write(`<p><strong>הערות ללקוח:</strong> ${w.client_notes}</p>`);
                        win.document.write(`<br/><button onclick="window.print()">🖨️ הדפס</button></body></html>`);
                        win.document.close();
                      }
                    }}>🖨️ הדפס</button>
                    {!isWorker && (
                      <select value={w.performa || "לא טופל"} onChange={async e => { await supabase.from("ngs_work_logs").update({ performa: e.target.value }).eq("id", w.id); await load(); }} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 8px", fontSize: 12, background: w.performa === "יצאה פרפורמה" ? "#dcfce7" : "#fee2e2" }}>
                        <option value="לא טופל">❌ לא טופל</option>
                        <option value="יצאה פרפורמה">✅ יצאה פרפורמה</option>
                      </select>
                    )}
                    {!isWorker && <button className="btn btn-outline" style={{ fontSize: 12, padding: "6px 10px", color: "#dc2626" }} onClick={() => deleteItem("ngs_work_logs", w.id)}>מחק</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SidebarNav({ activePage, setActivePage, isActive, userRole }: { activePage: string; setActivePage: (p: string) => void; isActive: (k: string) => boolean; userRole: string }) {
  const [openGroup, setOpenGroup] = useState<string | null>("property");
  if (userRole === "tenant") return (<>{[{ key: "tenantPortal", label: "🏠 הבית שלי" }, { key: "requests", label: "🔧 קריאות שירות" }].map(item => (<button key={item.key} className={`nav-btn ${isActive(item.key) ? "active" : ""}`} onClick={() => setActivePage(item.key)}>{item.label}</button>))}</>);
  if (userRole === "owner") return (<>{[{ key: "dashboard", label: "🏠 סיכום" }, { key: "apartments", label: "🚪 הדירות שלי" }, { key: "leases", label: "📋 חוזים" }].map(item => (<button key={item.key} className={`nav-btn ${isActive(item.key) ? "active" : ""}`} onClick={() => setActivePage(item.key)}>{item.label}</button>))}</>);
  if (userRole === "ngs_worker") return <button className={`nav-btn ${isActive("ngs") ? "active" : ""}`} onClick={() => setActivePage("ngs")}>🏗 נ.ג.ש מור</button>;
  const propertyItems = [
    { key: "owners", label: "👤 בעלי נכסים" }, { key: "buildings", label: "🏢 מבנים" },
    { key: "apartments", label: "🚪 דירות" }, { key: "requests", label: "🔧 קריאות שירות" },
    { key: "leases", label: "📋 חוזים" }, { key: "payments", label: "💰 תשלומים" }, { key: "workcontracts", label: "📝 חוזי עבודה" },
    { key: "documents", label: "📄 מסמכים" },
  ];
  const isPropertyActive = propertyItems.some(i => isActive(i.key));
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div>
        <button className={`nav-btn ${isActive("dashboard") ? "active" : ""}`} onClick={() => setActivePage("dashboard")}>🏠 דשבורד</button>
        <div style={{ marginTop: 4 }}>
          <button onClick={() => setOpenGroup(openGroup === "property" ? null : "property")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: isPropertyActive ? "rgba(213,181,122,0.15)" : openGroup === "property" ? "rgba(255,255,255,0.05)" : "transparent", border: "none", cursor: "pointer", color: isPropertyActive || openGroup === "property" ? "#d5b57a" : "#94a3b8", fontWeight: 700, fontSize: 14, borderRadius: 12, marginBottom: 2 }}>
            <span>🏢 ניהול נכסים</span><span style={{ fontSize: 11, transform: openGroup === "property" ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▾</span>
          </button>
          {openGroup === "property" && (<div style={{ paddingRight: 10, borderRight: "2px solid rgba(213,181,122,0.25)", marginRight: 10, marginBottom: 4 }}>{propertyItems.map(item => (<button key={item.key} className={`nav-btn ${isActive(item.key) ? "active" : ""}`} style={{ fontSize: 13, padding: "8px 12px" }} onClick={() => setActivePage(item.key)}>{item.label}</button>))}</div>)}
        </div>
        <button className={`nav-btn ${isActive("ngs") ? "active" : ""}`} style={{ marginTop: 4 }} onClick={() => setActivePage("ngs")}>🏗 נ.ג.ש מור</button>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, marginTop: 10 }}>
        <button className={`nav-btn ${isActive("users") ? "active" : ""}`} style={{ fontSize: 13 }} onClick={() => setActivePage("users")}>👥 משתמשים</button>
        <button className={`nav-btn ${isActive("activity") ? "active" : ""}`} style={{ fontSize: 13 }} onClick={() => setActivePage("activity")}>👁️ פעילות</button>
        <button className={`nav-btn ${isActive("settings") ? "active" : ""}`} style={{ fontSize: 13 }} onClick={() => setActivePage("settings")}>⚙️ הגדרות</button>
      </div>
    </div>
  );
}

function getNavIcon(key: string) {
  const icons: Record<string, string> = { dashboard: "🏠", owners: "👤", buildings: "🏢", apartments: "🚪", requests: "🔧", leases: "📋", documents: "📄", tenantPortal: "🏠", settings: "⚙️", users: "👥", workcontracts: "📝", ngs: "🏗" };
  return icons[key] || "•";
}

function getNavItemsForRole(role: string) {
  if (role === "tenant") return [{ key: "tenantPortal", label: "הבית שלי" }, { key: "requests", label: "קריאות שירות" }];
  if (role === "owner") return [{ key: "dashboard", label: "סיכום" }, { key: "apartments", label: "הדירות שלי" }, { key: "leases", label: "חוזים" }];
  if (role === "ngs_worker") return [{ key: "ngs", label: "🏗 נ.ג.ש מור" }];
  return navItems;
}

function getRoleLabel(role: string) {
  if (role === "tenant") return "דייר";
  if (role === "owner") return "בעל נכס";
  if (role === "ngs_worker") return 'עובד נג"ש';
  return "מנהל מערכת";
}

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
  const [regForm, setRegForm] = useState({ full_name: "", phone: "", role: "tenant" });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBuildingId, setSelectedBuildingId] = useState<any>("");
  const [selectedOwnerId, setSelectedOwnerId] = useState(1);

  async function handleForgotPassword() {
    if (!resetEmail) return;
    setLoginLoading(true);
    await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: "https://property-os-ten.vercel.app" });
    setResetSent(true);
    setLoginLoading(false);
  }

  async function handleLogin() {
    setLoginLoading(true);
    setLoginError("");
    setPendingApproval(false);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoginError("אימייל או סיסמה שגויים");
      setLoginLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoginError("לא נמצא משתמש");
      setLoginLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      setLoginError(profileError.message);
      setLoginLoading(false);
      return;
    }

    if (!profile) {
      setUserRole("admin");
      setActivePage("dashboard");
      setLoggedIn(true);
      setLoginLoading(false);
      return;
    }

    if (profile.status === "ממתין לאישור") {
      setPendingApproval(true);
      await supabase.auth.signOut();
      setLoginLoading(false);
      return;
    }

    setUserProfile(profile);
    setUserRole(profile.role || "admin");

    // רישום כניסה למערכת
    supabase.from("user_activity").insert({
      user_id: userId,
      user_email: email,
      user_name: profile.full_name || email,
      user_role: profile.role || "admin",
      action: "login",
      session_start: new Date().toISOString(),
    }).then(() => {});

    if (profile.role === "tenant") setActivePage("tenantPortal");
    else if (profile.role === "ngs_worker") setActivePage("ngs");
    else setActivePage("dashboard");

    setLoggedIn(true);
    setLoginLoading(false);
  }

  async function handleRegister() {
    setRegError("");
    if (!email || !password || !regForm.full_name) { setRegError("יש למלא את כל השדות"); return; }
    setLoginLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setRegError(error.message); setLoginLoading(false); return; }
    if (data.user) { await supabase.from("profiles").insert({ id: data.user.id, full_name: regForm.full_name, phone: regForm.phone, role: regForm.role, status: "ממתין לאישור" }); }
    setRegSuccess(true); setLoginLoading(false);
  }

  function openApartment(id: string) { setSelectedApartmentId(id); setActivePage("apartmentDetails"); }
  function openBuilding(id: any) { setSelectedBuildingId(id); setActivePage("buildingDetails"); }
  function openOwner(id: number) { setSelectedOwnerId(id); setActivePage("ownerDetails"); }

  function renderContent() {
    if (userRole === "tenant") {
      if (activePage === "tenantPortal") return <TenantPortal userProfile={userProfile} />;
      return <TenantPortal userProfile={userProfile} />;
    }
    if (userRole === "owner") return <OwnerDashboard userProfile={userProfile} />;
    if (userRole === "ngs_worker") return <div key={refreshKey}><NGSDashboard userProfile={userProfile} userRole={userRole} /></div>;
    switch (activePage) {
      case "dashboard": return <div key={refreshKey}><Dashboard openApartment={openApartment} openBuilding={openBuilding} /></div>;
      case "owners": return <div key={refreshKey}><Owners openOwner={openOwner} /></div>;
      case "ownerDetails": return <div key={refreshKey}><OwnerDetails ownerId={selectedOwnerId} back={() => setActivePage("owners")} /></div>;
      case "buildings": return <div key={refreshKey}><Buildings openBuilding={openBuilding} /></div>;
      case "buildingDetails": return <div key={refreshKey}><BuildingDetails buildingId={selectedBuildingId} back={() => setActivePage("buildings")} openApartment={openApartment} /></div>;
      case "apartments": return <div key={refreshKey}><Apartments openApartment={openApartment} /></div>;
      case "apartmentDetails": return <div key={refreshKey}><ApartmentDetails apartmentId={selectedApartmentId} back={() => setActivePage("apartments")} /></div>;
      case "requests": return <div key={refreshKey}><ServiceRequests /></div>;
      case "leases": return <div key={refreshKey}><Leases /></div>;
      case "payments": return <div key={refreshKey}><PaymentsTracker /></div>;
      case "documents": return <Placeholder title="מסמכים" text="כאן ירוכזו חוזים, תמונות, הצעות מחיר והסכמי ניהול." />;
      case "tenantPortal": return <div key={refreshKey}><TenantPortal userProfile={userProfile} /></div>;
      case "settings": return <div key={refreshKey}><Settings userEmail={email} /></div>;
      case "users": return <div key={refreshKey}><UsersManagement /></div>;
      case "activity": return <div key={refreshKey}><ActivityLog /></div>;
      case "workcontracts": return <div key={refreshKey}><WorkContracts /></div>;
      case "ngs": return <div key={refreshKey}><NGSDashboard userProfile={userProfile} userRole={userRole} /></div>;
      default: return null;
    }
  }

  if (!loggedIn) {
    return (
      <section className="login-shell">
        <div className="login-wrap">
          <div className="login-left">
            <div>
              <div className="eyebrow"><span className="dot" />נ.ג.ש מור הנדסה</div>
              <h1 className="login-title">מערכת ניהול משולבת לנ.ג.ש מור הנדסה</h1>
              <div className="login-sub">פלטפורמה מתקדמת לניהול רכבים, עובדים, לקוחות, פרויקטים, קריאות שירות ויומני עבודה.</div>
              <div className="hero-grid">
                {[["🚗","צי רכבים"],["👷","ניהול עובדים"],["📁","פרויקטים"],["📋","יומני עבודה"]].map(([icon, label]) => (
                  <div key={label} className="hero-stat"><div className="num" style={{fontSize:32}}>{icon}</div><div className="label">{label}</div></div>
                ))}
              </div>
            </div>
          </div>
          <div className="login-right">
            <div className="login-card">
              {pendingApproval ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}><div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div><h2>ממתין לאישור</h2><p style={{ color: "#64748b" }}>הבקשה שלך נשלחה. תקבל הודעה כשתאושר.</p><button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => setPendingApproval(false)}>חזרה להתחברות</button></div>
              ) : regSuccess ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}><div style={{ fontSize: 48, marginBottom: 16 }}>✅</div><h2>הבקשה נשלחה!</h2><button className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => { setRegSuccess(false); setAuthMode("login"); }}>חזרה להתחברות</button></div>
              ) : authMode === "login" ? (
                <>
                  <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:48}}>🏗</div><h2 style={{margin:"8px 0 4px",fontSize:22,fontWeight:900}}>נ.ג.ש מור הנדסה</h2><div style={{fontSize:13,color:"#64748b",marginBottom:16}}>כניסה למערכת הניהול</div></div>
                  <div className="field"><label>אימייל</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>
                  <div className="field"><label>סיסמה</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" /></div>
                  {loginError && <div style={{color:"#dc2626", marginBottom:10, fontSize:14}}>{loginError}</div>}
                  <button className="btn btn-primary" style={{ width: "100%", height: 52 }} onClick={handleLogin} disabled={loginLoading}>{loginLoading ? "מתחבר..." : "התחבר"}</button>
                  <div style={{ marginTop: 12, textAlign: "center" }}><button className="btn-link" style={{ fontSize: 13, color: "#64748b" }} onClick={() => setAuthMode("forgot")}>שכחתי סיסמה</button></div>
                  <div style={{ marginTop: 8, textAlign: "center", color: "#64748b", fontSize: 14 }}>אין לך חשבון? <button className="btn-link" onClick={() => setAuthMode("register")}>הירשם כאן</button></div>
                </>
              ) : authMode === "forgot" ? (
                <>
                  {resetSent ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}><div style={{ fontSize: 48, marginBottom: 16 }}>📧</div><h2>האימייל נשלח!</h2><button className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => { setResetSent(false); setAuthMode("login"); }}>חזרה להתחברות</button></div>
                  ) : (
                    <>
                      <h1>שחזור סיסמה</h1>
                      <div className="field"><label>אימייל</label><input className="input" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="your@email.com" /></div>
                      <button className="btn btn-primary" style={{ width: "100%", height: 52, marginTop: 8 }} onClick={handleForgotPassword} disabled={loginLoading}>{loginLoading ? "שולח..." : "שלח קישור לאיפוס"}</button>
                      <div style={{ marginTop: 16, textAlign: "center" }}><button className="btn-link" style={{ color: "#64748b", fontSize: 14 }} onClick={() => setAuthMode("login")}>חזרה להתחברות</button></div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <h1>הרשמה למערכת</h1>
                  <div className="field"><label>שם מלא *</label><input className="input" value={regForm.full_name} onChange={e => setRegForm({...regForm, full_name: e.target.value})} placeholder="ישראל ישראלי" /></div>
                  <div className="field"><label>אימייל *</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>
                  <div className="field"><label>סיסמה *</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="לפחות 6 תווים" /></div>
                  <div className="field"><label>טלפון</label><input className="input" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="052-1234567" /></div>
                  <div className="field"><label>תפקיד</label><select className="input" value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value})}><option value="tenant">דייר</option><option value="owner">בעל נכס</option></select></div>
                  {regError && <div style={{color:"#dc2626", marginBottom:10, fontSize:14}}>{regError}</div>}
                  <button className="btn btn-primary" style={{ width: "100%", height: 52 }} onClick={handleRegister} disabled={loginLoading}>{loginLoading ? "שולח..." : "שלח בקשת הצטרפות"}</button>
                  <div style={{ marginTop: 16, textAlign: "center", color: "#64748b", fontSize: 14 }}>יש לך כבר חשבון? <button className="btn-link" onClick={() => setAuthMode("login")}>התחבר כאן</button></div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const navItemsForRole = getNavItemsForRole(userRole);
  function isActive(key: string) {
    return activePage === key || (activePage === "apartmentDetails" && key === "apartments") || (activePage === "buildingDetails" && key === "buildings") || (activePage === "ownerDetails" && key === "owners");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon">🏗</div><div><small>נ.ג.ש מור</small><strong>הנדסה</strong></div></div>
        <nav className="nav"><SidebarNav activePage={activePage} setActivePage={setActivePage} isActive={isActive} userRole={userRole} /></nav>
        <div className="side-card">
          <div className="avatar">{email[0]?.toUpperCase()}</div>
          <div style={{ flex: 1 }}><div className="name">{userProfile?.full_name || email}</div><div className="role">{getRoleLabel(userRole)}</div></div>
          <button onClick={async () => { await supabase.auth.signOut(); setLoggedIn(false); setEmail(""); setPassword(""); setUserProfile(null); setUserRole("admin"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18 }} title="התנתק">🚪</button>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div><h1>שלום {userProfile?.full_name?.split(" ")[0] || email.split("@")[0]} 👋</h1><div className="sub">{getRoleLabel(userRole)}</div></div>
          <div className="top-actions">
            <input className="search" placeholder="חיפוש מהיר..." />
            <button className="btn btn-outline" onClick={() => setRefreshKey(k => k + 1)} title="רענן נתונים" style={{ fontSize: 18, padding: "8px 14px" }}>🔄</button>
            <button className="btn btn-outline" onClick={async () => { await supabase.auth.signOut(); setLoggedIn(false); setEmail(""); setPassword(""); setUserProfile(null); setUserRole("admin"); }} style={{ color: "#dc2626", borderColor: "#dc2626" }}>התנתק</button>
          </div>
        </div>
        {renderContent()}
      </main>
      <nav className="mobile-bottom-nav">
        {navItemsForRole.slice(0, 4).map((item) => (
          <button key={item.key} className={`mobile-nav-btn ${isActive(item.key) ? "active" : ""}`} onClick={() => setActivePage(item.key)}>
            <span className="mobile-nav-icon">{getNavIcon(item.key)}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}
        <button className={`mobile-nav-btn ${showMobileMenu ? "active" : ""}`} onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <span className="mobile-nav-icon">☰</span><span className="mobile-nav-label">עוד</span>
        </button>
      </nav>
      {showMobileMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }} onClick={() => setShowMobileMenu(false)}>
          <div style={{ position: "fixed", bottom: 70, left: 0, right: 0, background: "white", borderRadius: "20px 20px 0 0", boxShadow: "0 -4px 30px rgba(0,0,0,0.15)", padding: "12px 0 20px", zIndex: 600 }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: "#e2e8f0", borderRadius: 2, margin: "0 auto 16px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, padding: "0 8px" }}>
              {navItemsForRole.slice(4).map((item) => (
                <button key={item.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 8px", background: isActive(item.key) ? "#fef9ec" : "transparent", border: "none", cursor: "pointer", borderRadius: 12, color: isActive(item.key) ? "#c9a227" : "#475569" }}
                  onClick={() => { setActivePage(item.key); setShowMobileMenu(false); }}>
                  <span style={{ fontSize: 22 }}>{getNavIcon(item.key)}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, textAlign: "center" }}>{item.label}</span>
                </button>
              ))}
              {/* רענון והתנתקות במובייל */}
              <button style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 8px", background: "transparent", border: "none", cursor: "pointer", borderRadius: 12, color: "#475569" }}
                onClick={() => { setShowMobileMenu(false); setRefreshKey(k => k + 1); }}>
                <span style={{ fontSize: 22 }}>🔄</span>
                <span style={{ fontSize: 11, fontWeight: 600 }}>רענון</span>
              </button>
              <button style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 8px", background: "transparent", border: "none", cursor: "pointer", borderRadius: 12, color: "#dc2626" }}
                onClick={async () => { await supabase.auth.signOut(); setLoggedIn(false); setEmail(""); setPassword(""); setUserProfile(null); setUserRole("admin"); setShowMobileMenu(false); }}>
                <span style={{ fontSize: 22 }}>🚪</span>
                <span style={{ fontSize: 11, fontWeight: 600 }}>התנתק</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
