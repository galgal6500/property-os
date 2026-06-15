"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


function badgeClass(value: string) {
  if (["מושכר", "פעיל", "נסגרה"].includes(value)) return "badge badge-success";
  if (["פנוי", "חדשה", "בינונית"].includes(value)) return "badge badge-warning";
  if (["גבוהה"].includes(value)) return "badge badge-danger";
  if (["דחוף מאוד"].includes(value)) return "badge" + " " + "badge-urgent";
  return "badge badge-default";
}

function Badge({ value }: { value: string }) {
  return <span className={badgeClass(value)}>{value}</span>;
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

export function NGSDashboard({ userProfile, userRole }: { userProfile?: any; userRole?: string }) {
  const isWorker = userRole === "ngs_worker";
  const workerName = userProfile?.full_name || "";

  const [tab, setTab] = useState(isWorker ? "worklogs" : "overview");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [serviceCalls, setServiceCalls] = useState<any[]>([]);
  const [workLogs, setWorkLogs] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingVehicleId, setUploadingVehicleId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedWorkLog, setSelectedWorkLog] = useState<any>(null);
  const [editingWorkLog, setEditingWorkLog] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedServiceCall, setSelectedServiceCall] = useState<any>(null);
  const [workLogFilter, setWorkLogFilter] = useState("לא טופל");
  const [serviceCallFilter, setServiceCallFilter] = useState("חדשה");
  const [vehicleForm, setVehicleForm] = useState({ license_plate: "", model: "", year: "", status: "פעיל", test_date: "", next_test_date: "", driver: "", notes: "" });
  const [employeeForm, setEmployeeForm] = useState({ name: "", phone: "", role: "", status: "פעיל" });
  const [clientForm, setClientForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [projectForm, setProjectForm] = useState({ client_name: "", name: "", status: "פעיל", start_date: "", end_date: "", description: "" });
  const [serviceCallForm, setServiceCallForm] = useState({ client_name: "", issue: "", urgency: "בינונית", status: "חדשה", assigned_to: "", location: "", description: "", notes: "", contact_name: "", contact_phone: "" });
  const [workLogForm, setWorkLogForm] = useState({ filled_by: isWorker ? workerName : "", employee_name: isWorker ? workerName : "", workers: "", branch: "", date: "", hours: "", project_name: "", client_notes: "", performa: "לא טופל", line1: "", line2: "", line3: "", line4: "", line5: "", line6: "", line7: "", line8: "", line9: "", line10: "" });

  async function load() {
    setLoading(true);
    const [v, e, c, p, s, w, t, inv] = await Promise.all([
      supabase.from("ngs_vehicles").select("*").order("created_at", { ascending: false }),
      supabase.from("ngs_employees").select("*").order("name"),
      supabase.from("ngs_clients").select("*").order("name"),
      supabase.from("ngs_projects").select("*").order("created_at", { ascending: false }),
      supabase.from("ngs_service_calls").select("*").order("created_at", { ascending: false }),
      supabase.from("ngs_work_logs").select("*").order("date", { ascending: false }),
      supabase.from("ngs_tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("ngs_inventory").select("*").order("created_at", { ascending: false }),
    ]);

    // סינון לפי עובד
    const allVehicles = v.data || [];
    const allWorkLogs = w.data || [];
    const allTasks = t.data || [];

    if (isWorker && workerName) {
      setVehicles(allVehicles.filter((v: any) => v.driver === workerName));
      setWorkLogs(allWorkLogs.filter((l: any) =>
        l.employee_name?.split(",").map((s: string) => s.trim()).some((n: string) => n === workerName) ||
        l.filled_by?.trim() === workerName?.trim() ||
        l.workers?.split(",").map((s: string) => s.trim()).some((n: string) => n === workerName)
      ));
      setTasks(allTasks.filter((t: any) => t.assigned_to === "all" || t.assigned_to?.split(",").map((s: string) => s.trim()).includes(workerName)));
    } else {
      setVehicles(allVehicles);
      setWorkLogs(allWorkLogs);
      setTasks(allTasks);
    }

    setEmployees(e.data || []); setClients(c.data || []);
    setProjects(p.data || []); setServiceCalls(s.data || []);
    setInventoryItems(inv.data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveVehicle() {
    if (!vehicleForm.license_plate) return; setSaving(true);
    await supabase.from("ngs_vehicles").insert({ ...vehicleForm, test_date: vehicleForm.test_date || null, next_test_date: vehicleForm.next_test_date || null });
    setVehicleForm({ license_plate: "", model: "", year: "", status: "פעיל", test_date: "", next_test_date: "", driver: "", notes: "" });
    setShowForm(false); await load(); setSaving(false);
  }
  async function updateVehicle() {
    if (!editingVehicle) return; setSaving(true);
    await supabase.from("ngs_vehicles").update({ license_plate: editingVehicle.license_plate, model: editingVehicle.model, year: editingVehicle.year, status: editingVehicle.status, test_date: editingVehicle.test_date || null, next_test_date: editingVehicle.next_test_date || null, notes: editingVehicle.notes, driver: editingVehicle.driver || null }).eq("id", editingVehicle.id);
    setEditingVehicle(null); await load(); setSaving(false);
  }
  async function uploadGarageDoc(vehicleId: string, file: File) {
    setUploadingVehicleId(vehicleId);
    const ext = file.name.split(".").pop();
    const { error } = await supabase.storage.from("documents").upload(`garage-docs/${vehicleId}-${Date.now()}.${ext}`, file, { upsert: true });
    if (!error) {
      const { data: u } = supabase.storage.from("documents").getPublicUrl(`garage-docs/${vehicleId}-${Date.now()}.${ext}`);
      await supabase.from("ngs_vehicles").update({ garage_doc_url: u.publicUrl }).eq("id", vehicleId);
      await load();
    }
    setUploadingVehicleId(null);
  }
  async function saveEmployee() {
    if (!employeeForm.name) return; setSaving(true);
    await supabase.from("ngs_employees").insert(employeeForm);
    setEmployeeForm({ name: "", phone: "", role: "", status: "פעיל" }); setShowForm(false); await load(); setSaving(false);
  }
  async function saveClient() {
    if (!clientForm.name) return; setSaving(true);
    await supabase.from("ngs_clients").insert(clientForm);
    setClientForm({ name: "", phone: "", email: "", address: "", notes: "" }); setShowForm(false); await load(); setSaving(false);
  }
  async function saveProject() {
    if (!projectForm.name) return; setSaving(true);
    await supabase.from("ngs_projects").insert({ ...projectForm, start_date: projectForm.start_date || null, end_date: projectForm.end_date || null });
    setProjectForm({ client_name: "", name: "", status: "פעיל", start_date: "", end_date: "", description: "" }); setShowForm(false); await load(); setSaving(false);
  }
  async function saveServiceCall() {
    if (!serviceCallForm.issue) return; setSaving(true);
    await supabase.from("ngs_service_calls").insert(serviceCallForm);
    // שליחת מייל התראה
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "new_ngs_service_call",
        data: serviceCallForm
      })
    }).catch(() => {});
    setServiceCallForm({ client_name: "", issue: "", urgency: "בינונית", status: "חדשה", assigned_to: "", location: "", description: "", notes: "", contact_name: "", contact_phone: "" }); setShowForm(false); await load(); setSaving(false);
  }
  async function saveEditWorkLog() {
    if (!editingWorkLog) return;
    setSavingEdit(true);
    await supabase.from("ngs_work_logs").update({
      branch: editingWorkLog.branch || "",
      project_name: editingWorkLog.project_name || "",
      date: editingWorkLog.date || null,
      hours: parseFloat(editingWorkLog.hours) || 0,
      client_notes: editingWorkLog.client_notes || "",
      line1: editingWorkLog.line1 || "",
      line2: editingWorkLog.line2 || "",
      line3: editingWorkLog.line3 || "",
      line4: editingWorkLog.line4 || "",
      line5: editingWorkLog.line5 || "",
      line6: editingWorkLog.line6 || "",
      line7: editingWorkLog.line7 || "",
      line8: editingWorkLog.line8 || "",
      line9: editingWorkLog.line9 || "",
      line10: editingWorkLog.line10 || "",
    }).eq("id", editingWorkLog.id);
    setEditingWorkLog(null);
    await load();
    setSavingEdit(false);
  }

  async function saveWorkLog() {
    if (!workLogForm.employee_name && !workLogForm.filled_by) return; setSaving(true);
    await supabase.from("ngs_work_logs").insert({ ...workLogForm, hours: parseFloat(workLogForm.hours) || 0 });
    setWorkLogForm({ filled_by: isWorker ? workerName : "", employee_name: isWorker ? workerName : "", workers: "", branch: "", date: "", hours: "", project_name: "", client_notes: "", performa: "לא טופל", line1: "", line2: "", line3: "", line4: "", line5: "", line6: "", line7: "", line8: "", line9: "", line10: "" });
    setShowForm(false); await load(); setSaving(false);
  }
  async function updateServiceCallStatus(id: string, status: string, completedBy?: string) {
    const updateData: any = { status };
    if (status === "הושלם" && completedBy) updateData.completed_by = completedBy;
    await supabase.from("ngs_service_calls").update(updateData).eq("id", id);
    if (status === "הושלם") {
      const { data: ngsCall } = await supabase.from("ngs_service_calls").select("source_request_id").eq("id", id).single();
      if (ngsCall?.source_request_id) {
        await supabase.from("service_requests").update({ status: "הושלם" }).eq("id", ngsCall.source_request_id);
      }
    }
    await load();
  }
  async function deleteItem(table: string, id: string) {
    if (!confirm("למחוק?")) return;
    await supabase.from(table).delete().eq("id", id); await load();
  }

  const tabs = isWorker ? [
    { key: "overview", label: "🏠 סקירה" },
    { key: "worklogs", label: "📋 יומני עבודה" },
    { key: "service", label: "🔧 קריאות שירות" },
    { key: "vehicles", label: "🚗 הרכב שלי" },
    { key: "tasks", label: "✅ המשימות שלי" },
    { key: "inventory", label: "🛒 ציוד חסר" },
  ] : [
    { key: "overview", label: "📊 סקירה" },
    { key: "vehicles", label: "🚗 רכבים" },
    { key: "employees", label: "👷 עובדים" },
    { key: "clients", label: "🤝 לקוחות" },
    { key: "projects", label: "📁 פרויקטים" },
    { key: "service", label: "🔧 קריאות שירות" },
    { key: "worklogs", label: "📋 יומני עבודה" },
    { key: "tasks", label: "✅ משימות" },
    { key: "inventory", label: "🛒 ציוד חסר" },
  ];
  const openServiceCalls = serviceCalls.filter(s => s.status !== "הושלם");
  const activeProjects = projects.filter(p => p.status === "פעיל");

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {selectedVehicle && <VehicleServicesModal vehicleId={selectedVehicle.id} licensePlate={selectedVehicle.license_plate} onClose={() => setSelectedVehicle(null)} />}

      {selectedServiceCall && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 540, maxHeight: "85vh", overflow: "auto" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>🔧 {selectedServiceCall.issue}</h3>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{selectedServiceCall.client_name || "-"}</div>
              </div>
              <button onClick={() => setSelectedServiceCall(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}>×</button>
            </div>
            <div style={{ padding: "20px 24px", display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>סטטוס</div>
                  <Badge value={selectedServiceCall.status} />
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>דחיפות</div>
                  <Badge value={selectedServiceCall.urgency} />
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>אחראי</div>
                  <div style={{ fontWeight: 700 }}>{selectedServiceCall.assigned_to || "-"}</div>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>תאריך פתיחה</div>
                  <div style={{ fontWeight: 700 }}>{selectedServiceCall.created_at ? new Date(selectedServiceCall.created_at).toLocaleDateString("he-IL") : "-"}</div>
                </div>
                {selectedServiceCall.location && (
                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, gridColumn: "span 2" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>📍 מיקום</div>
                    <div style={{ fontWeight: 700 }}>{selectedServiceCall.location}</div>
                  </div>
                )}
                {selectedServiceCall.contact_name && (
                  <div style={{ background: "#eff6ff", borderRadius: 12, padding: 14, gridColumn: "span 2", border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: 11, color: "#1d4ed8", marginBottom: 8, fontWeight: 700 }}>👤 איש קשר</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{selectedServiceCall.contact_name}</div>
                      {selectedServiceCall.contact_phone && (
                        <a href={`tel:${selectedServiceCall.contact_phone}`} className="btn btn-primary" style={{ fontSize: 13, padding: "6px 16px", textDecoration: "none" }}>
                          📞 {selectedServiceCall.contact_phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {selectedServiceCall.completed_by && (
                  <div style={{ background: "#dcfce7", borderRadius: 12, padding: 14, gridColumn: "span 2" }}>
                    <div style={{ fontSize: 11, color: "#166534", marginBottom: 4 }}>✅ טופל ע"י</div>
                    <div style={{ fontWeight: 700, color: "#166534" }}>{selectedServiceCall.completed_by}</div>
                  </div>
                )}
              </div>
              {(selectedServiceCall.description || selectedServiceCall.notes) && (
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>תיאור / הערות</div>
                  <div style={{ fontSize: 14, lineHeight: 1.7 }}>{selectedServiceCall.description || selectedServiceCall.notes}</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                {!isWorker && (
                  <select value={selectedServiceCall.status} onChange={async e => { await updateServiceCallStatus(selectedServiceCall.id, e.target.value); setSelectedServiceCall({...selectedServiceCall, status: e.target.value}); }} style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", fontSize: 14 }}>
                    <option>חדשה</option><option>בטיפול</option><option>הושלם</option>
                  </select>
                )}
                <button className="btn btn-outline" onClick={() => setSelectedServiceCall(null)}>סגור</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingWorkLog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 660, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>✏️ עריכת יומן #{formatSerial(editingWorkLog.serial_number)}</h3>
              <button onClick={() => setEditingWorkLog(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, color: "#64748b" }}>×</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div className="field">
                  <label>לקוח</label>
                  <select className="input" value={editingWorkLog.project_name || ""} onChange={e => setEditingWorkLog({...editingWorkLog, project_name: e.target.value})}>
                    <option value="">בחר לקוח</option>
                    {clients.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    <option value="אחר">✏️ אחר</option>
                  </select>
                </div>
                <div className="field"><label>סניף / אתר</label><input className="input" value={editingWorkLog.branch || ""} onChange={e => setEditingWorkLog({...editingWorkLog, branch: e.target.value})} /></div>
                <div className="field"><label>תאריך</label><input className="input" type="date" value={editingWorkLog.date || ""} onChange={e => setEditingWorkLog({...editingWorkLog, date: e.target.value})} /></div>
                <div className="field"><label>שעות עבודה</label><input className="input" type="number" value={editingWorkLog.hours || ""} onChange={e => setEditingWorkLog({...editingWorkLog, hours: e.target.value})} step="0.5" /></div>
              </div>
              <div className="field"><label>📝 הערות ללקוח</label><textarea className="input" value={editingWorkLog.client_notes || ""} onChange={e => setEditingWorkLog({...editingWorkLog, client_notes: e.target.value})} style={{ minHeight: 70, resize: "vertical" }} /></div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#475569" }}>📝 פירוט העבודה:</div>
              <div style={{ display: "grid", gap: 8 }}>
                {([1,2,3,4,5,6,7,8,9,10] as number[]).map(n => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 700, minWidth: 24 }}>{n}.</span>
                    <input className="input" style={{ flex: 1 }} value={(editingWorkLog as any)[`line${n}`] || ""} onChange={e => setEditingWorkLog({...editingWorkLog, [`line${n}`]: e.target.value})} placeholder={`שורה ${n}...`} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={saveEditWorkLog} disabled={savingEdit}>{savingEdit ? "שומר..." : "💾 שמור שינויים"}</button>
              <button className="btn btn-outline" onClick={() => setEditingWorkLog(null)}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {selectedWorkLog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 660, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>📋 #{formatSerial(selectedWorkLog.serial_number)} · {selectedWorkLog.date ? new Date(selectedWorkLog.date).toLocaleDateString("he-IL") : "-"}</div>
                <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                  {selectedWorkLog.branch && <span>📍 {selectedWorkLog.branch} · </span>}
                  {selectedWorkLog.project_name && <span>🤝 {selectedWorkLog.project_name} · </span>}
                  {selectedWorkLog.filled_by && <span>ממלא: {selectedWorkLog.filled_by}</span>}
                </div>
              </div>
              <button onClick={() => setSelectedWorkLog(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, color: "#64748b" }}>×</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
              {selectedWorkLog.client_notes && (
                <div style={{ marginBottom: 16, padding: 12, background: "#fffbeb", borderRadius: 12, border: "1px solid #fde68a" }}>
                  <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, marginBottom: 4 }}>📝 הערות ללקוח</div>
                  <div style={{ fontSize: 14, color: "#78350f" }}>{selectedWorkLog.client_notes}</div>
                </div>
              )}
              <div style={{ fontWeight: 700, marginBottom: 12 }}>פירוט העבודה:</div>
              <div style={{ display: "grid", gap: 6 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => {
                  const line = selectedWorkLog[`line${n}`];
                  if (!line) return null;
                  return <div key={n} style={{ display: "flex", gap: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 10 }}><span style={{ color: "#94a3b8", fontWeight: 700, minWidth: 22 }}>{n}.</span><span style={{ fontSize: 14 }}>{line}</span></div>;
                })}
              </div>
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ background: selectedWorkLog.performa === "יצאה פרפורמה" ? "#dcfce7" : "#fee2e2", color: selectedWorkLog.performa === "יצאה פרפורמה" ? "#16a34a" : "#dc2626", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 700 }}>
                {selectedWorkLog.performa === "יצאה פרפורמה" ? "✅ יצאה פרפורמה" : "❌ לא טופל"}
              </span>
              <button className="btn btn-outline" onClick={() => setSelectedWorkLog(null)}>סגור</button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#fff", border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>מחלקת חברה</div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>🏗 נ.ג.ש מור הנדסה</h2>
            <div style={{ color: "#94a3b8", marginTop: 4, fontSize: 14 }}>ניהול רכבים, עובדים, לקוחות ופרויקטים</div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 900, color: "#d5b57a" }}>{employees.filter(e => e.status === "פעיל").length}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>עובדים</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 900, color: "#d5b57a" }}>{vehicles.length}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>רכבים</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 900, color: openServiceCalls.length > 0 ? "#dc2626" : "#16a34a" }}>{openServiceCalls.length}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>קריאות פתוחות</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 900, color: workLogs.filter(w => w.performa !== "יצאה פרפורמה").length > 0 ? "#f59e0b" : "#16a34a" }}>{workLogs.filter(w => w.performa !== "יצאה פרפורמה").length}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>יומנים לא מטופלים</div></div>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        {tabs.map(t => <button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => { setTab(t.key); setShowForm(false); }}>{t.label}</button>)}
      </div>

      {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>טוען...</div>}

      {!loading && tab === "overview" && !isWorker && (
        <div style={{ display: "grid", gap: 16 }}>

          {/* כותרת */}
          <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: 24, padding: "28px", color: "#fff" }}>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 6 }}>שלום 👋</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4 }}>נ.ג.ש מור הנדסה</div>
            <div style={{ fontSize: 14, color: "#64748b" }}>{new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
          </div>

          {/* 4 כרטיסים גדולים וברורים */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            {/* קריאות שירות */}
            <button onClick={() => setTab("service")} style={{ background: "#fff", border: `3px solid ${openServiceCalls.filter(s => s.urgency === "דחוף מאוד").length > 0 ? "#dc2626" : "#e2e8f0"}`, borderRadius: 20, padding: "20px 16px", cursor: "pointer", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔧</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: openServiceCalls.length > 0 ? "#dc2626" : "#16a34a" }}>{openServiceCalls.length}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#475569", marginTop: 4 }}>קריאות שירות</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>פתוחות</div>
            </button>

            {/* יומני עבודה */}
            <button onClick={() => setTab("worklogs")} style={{ background: "#fff", border: "3px solid #e2e8f0", borderRadius: 20, padding: "20px 16px", cursor: "pointer", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a" }}>{workLogs.filter(w => w.performa !== "יצאה פרפורמה").length}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#475569", marginTop: 4 }}>יומני עבודה</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>לא טופלו</div>
            </button>

            {/* משימות */}
            <button onClick={() => setTab("tasks")} style={{ background: "#fff", border: `3px solid ${tasks.filter(t => t.status === "פתוח").length > 0 ? "#f59e0b" : "#e2e8f0"}`, borderRadius: 20, padding: "20px 16px", cursor: "pointer", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: tasks.filter(t => t.status === "פתוח").length > 0 ? "#d97706" : "#16a34a" }}>{tasks.filter(t => t.status === "פתוח").length}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#475569", marginTop: 4 }}>משימות</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>פתוחות</div>
            </button>

            {/* ציוד חסר */}
            <button onClick={() => setTab("inventory")} style={{ background: "#fff", border: `3px solid ${inventoryItems.filter((i: any) => i.status === "חסר").length > 0 ? "#a855f7" : "#e2e8f0"}`, borderRadius: 20, padding: "20px 16px", cursor: "pointer", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#7c3aed" }}>{inventoryItems.filter((i: any) => i.status === "חסר").length}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#475569", marginTop: 4 }}>ציוד חסר</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>למחסן</div>
            </button>
          </div>

          {/* קריאות דחופות */}
          {openServiceCalls.filter(s => s.urgency === "דחוף מאוד" || s.urgency === "גבוהה").length > 0 && (
            <div style={{ background: "#fef2f2", borderRadius: 20, padding: 18, border: "2px solid #fca5a5" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#dc2626", marginBottom: 14 }}>🚨 דורש טיפול מיידי</div>
              {openServiceCalls.filter(s => s.urgency === "דחוף מאוד" || s.urgency === "גבוהה").slice(0, 3).map(s => (
                <div key={s.id} onClick={() => setSelectedServiceCall(s)} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer", borderRight: "5px solid #dc2626" }}>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{s.issue}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{s.client_name || "-"} {s.location ? `· 📍 ${s.location}` : ""}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <Badge value={s.urgency} />
                    {s.assigned_to && <span style={{ fontSize: 12, color: "#475569", background: "#f1f5f9", borderRadius: 999, padding: "2px 10px" }}>👷 {s.assigned_to}</span>}
                    {s.contact_phone && (
                      <a href={`tel:${s.contact_phone}`} onClick={e => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#16a34a", borderRadius: 999, padding: "4px 12px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>📞 {s.contact_phone}</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* פעולות מהירות */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 18, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>⚡ פעולה מהירה</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button className="btn btn-primary" style={{ height: 56, fontSize: 15, borderRadius: 16 }} onClick={() => { setTab("service"); setShowForm(true); }}>+ קריאת שירות</button>
              <button className="btn btn-dark" style={{ height: 56, fontSize: 15, borderRadius: 16 }} onClick={() => { setTab("worklogs"); setShowForm(true); }}>+ יומן עבודה</button>
              <button className="btn btn-outline" style={{ height: 56, fontSize: 15, borderRadius: 16 }} onClick={() => { setTab("tasks"); }}>+ משימה</button>
              <button className="btn btn-outline" style={{ height: 56, fontSize: 15, borderRadius: 16 }} onClick={() => setTab("employees")}>👷 עובדים</button>
            </div>
          </div>

          {/* רשימת עובדים */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 className="card-title" style={{ margin: 0 }}>👷 הצוות שלי</h3>
              <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => setTab("employees")}>הכל</button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {employees.filter(e => e.status === "פעיל").slice(0, 5).map(e => {
                const empCalls = openServiceCalls.filter(s => s.assigned_to === e.name).length;
                const empLogs = workLogs.filter(w => w.employee_name?.includes(e.name) || w.filled_by === e.name).length;
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "#f8fafc", borderRadius: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1e293b", color: "#d5b57a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, flexShrink: 0 }}>{e.name?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{e.name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{e.role || "עובד"} {e.phone ? `· ${e.phone}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {empCalls > 0 && <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{empCalls} קריאות</span>}
                      {empLogs > 0 && <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{empLogs} יומנים</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!loading && tab === "overview" && isWorker && (
        <div style={{ display: "grid", gap: 14 }}>
          {/* כרטיס ברוך הבא */}
          <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: 24, padding: "24px 24px 20px", color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, left: -40, width: 200, height: 200, background: "rgba(213,181,122,0.08)", borderRadius: "50%" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>שלום 👋</div>
              <h1 style={{ margin: "4px 0 2px", fontSize: 28, fontWeight: 900 }}>{workerName}</h1>
              <div style={{ color: "#64748b", fontSize: 13 }}>{new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}</div>
            </div>
          </div>

          {/* כרטיסי פעולה מהירה */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={() => setTab("service")} style={{ background: serviceCalls.filter(s => s.status !== "הושלם").length > 0 ? "#fef2f2" : "#f0fdf4", border: `2px solid ${serviceCalls.filter(s => s.status !== "הושלם").length > 0 ? "#fca5a5" : "#86efac"}`, borderRadius: 18, padding: "18px 16px", cursor: "pointer", textAlign: "right" }}>
              <div style={{ fontSize: 28 }}>🔧</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: serviceCalls.filter(s => s.status !== "הושלם").length > 0 ? "#dc2626" : "#16a34a", marginTop: 6 }}>{serviceCalls.filter(s => s.status !== "הושלם").length}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginTop: 2 }}>קריאות פתוחות</div>
            </button>

            <button onClick={() => setTab("tasks")} style={{ background: tasks.filter(t => t.status === "פתוח").length > 0 ? "#fffbeb" : "#f0fdf4", border: `2px solid ${tasks.filter(t => t.status === "פתוח").length > 0 ? "#fcd34d" : "#86efac"}`, borderRadius: 18, padding: "18px 16px", cursor: "pointer", textAlign: "right" }}>
              <div style={{ fontSize: 28 }}>✅</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: tasks.filter(t => t.status === "פתוח").length > 0 ? "#d97706" : "#16a34a", marginTop: 6 }}>{tasks.filter(t => t.status === "פתוח").length}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginTop: 2 }}>משימות פתוחות</div>
            </button>

            <button onClick={() => setTab("worklogs")} style={{ background: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: 18, padding: "18px 16px", cursor: "pointer", textAlign: "right" }}>
              <div style={{ fontSize: 28 }}>📋</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", marginTop: 6 }}>{workLogs.length}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginTop: 2 }}>יומני עבודה</div>
            </button>

            <button onClick={() => setTab("inventory")} style={{ background: "#faf5ff", border: "2px solid #d8b4fe", borderRadius: 18, padding: "18px 16px", cursor: "pointer", textAlign: "right" }}>
              <div style={{ fontSize: 28 }}>🛒</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#7c3aed", marginTop: 6 }}>{inventoryItems?.filter((i: any) => i.status === "חסר").length || 0}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginTop: 2 }}>ציוד חסר</div>
            </button>
          </div>

          {/* כפתורי פעולה מהירה */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>⚡ פעולה מהירה</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button className="btn btn-primary" style={{ height: 52, fontSize: 14, borderRadius: 14 }} onClick={() => { setTab("worklogs"); setShowForm(true); }}>+ יומן עבודה</button>
              <button className="btn btn-outline" style={{ height: 52, fontSize: 14, borderRadius: 14 }} onClick={() => { setTab("service"); setShowForm(true); }}>+ קריאת שירות</button>
            </div>
          </div>

          {/* קריאות דחופות */}
          {serviceCalls.filter(s => s.status !== "הושלם" && (s.urgency === "דחוף מאוד" || s.urgency === "גבוהה")).length > 0 && (
            <div style={{ background: "#fef2f2", borderRadius: 20, padding: 16, border: "1px solid #fca5a5" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#dc2626", marginBottom: 12 }}>🚨 קריאות דחופות</div>
              {serviceCalls.filter(s => s.status !== "הושלם" && (s.urgency === "דחוף מאוד" || s.urgency === "גבוהה")).slice(0, 3).map(s => (
                <div key={s.id} onClick={() => { setSelectedServiceCall(s); }} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer", borderRight: "4px solid #dc2626" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{s.issue}</span>
                    <Badge value={s.urgency} />
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.client_name || "-"} {s.location ? `· ${s.location}` : ""}</div>
                  {s.contact_phone && (
                    <a href={`tel:${s.contact_phone}`} onClick={e => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, background: "#dcfce7", color: "#16a34a", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>📞 {s.contact_phone}</a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* משימות דחופות */}
          {tasks.filter(t => t.status === "פתוח" && (t.priority === "דחופה" || t.priority === "גבוהה")).length > 0 && (
            <div style={{ background: "#fffbeb", borderRadius: 20, padding: 16, border: "1px solid #fcd34d" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#d97706", marginBottom: 12 }}>⚠️ משימות דחופות</div>
              {tasks.filter(t => t.status === "פתוח" && (t.priority === "דחופה" || t.priority === "גבוהה")).slice(0, 3).map(t => (
                <div key={t.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, borderRight: "4px solid #f59e0b" }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{t.title}</div>
                  {t.due_date && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>📅 {new Date(t.due_date).toLocaleDateString("he-IL")}</div>}
                </div>
              ))}
            </div>
          )}

          {/* הרכב שלי */}
          {vehicles.length > 0 && (
            <div style={{ background: "#eff6ff", borderRadius: 20, padding: 16, border: "1px solid #bfdbfe", cursor: "pointer" }} onClick={() => setTab("vehicles")}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", marginBottom: 10 }}>🚗 הרכב שלי</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#1e40af" }}>{vehicles[0]?.license_plate}</div>
                  <div style={{ fontSize: 13, color: "#3b82f6" }}>{vehicles[0]?.model} {vehicles[0]?.year}</div>
                </div>
                {vehicles[0]?.next_test_date && (
                  <div style={{ textAlign: "center", background: "#fff", borderRadius: 12, padding: "8px 14px" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>טסט הבא</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1e40af" }}>{new Date(vehicles[0].next_test_date).toLocaleDateString("he-IL")}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && tab === "vehicles" && (
        <div className="card">
          <div className="section-top"><h3 className="card-title" style={{ margin: 0 }}>🚗 רכבים</h3><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף רכב</button></div>
          {showForm && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div className="field"><label>לוחית רישוי *</label><input className="input" value={vehicleForm.license_plate} onChange={e => setVehicleForm({...vehicleForm, license_plate: e.target.value})} placeholder="12-345-67" /></div>
                <div className="field"><label>דגם</label><input className="input" value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} /></div>
                <div className="field"><label>שנה</label><input className="input" value={vehicleForm.year} onChange={e => setVehicleForm({...vehicleForm, year: e.target.value})} /></div>
                <div className="field"><label>סטטוס</label><select className="input" value={vehicleForm.status} onChange={e => setVehicleForm({...vehicleForm, status: e.target.value})}><option>פעיל</option><option>בתיקון</option><option>מושבת</option></select></div>
                <div className="field"><label>טסט אחרון</label><input className="input" type="date" value={vehicleForm.test_date} onChange={e => setVehicleForm({...vehicleForm, test_date: e.target.value})} /></div>
                <div className="field"><label>טסט הבא</label><input className="input" type="date" value={vehicleForm.next_test_date} onChange={e => setVehicleForm({...vehicleForm, next_test_date: e.target.value})} /></div>
                <div className="field"><label>👤 נהג</label><select className="input" value={vehicleForm.driver} onChange={e => setVehicleForm({...vehicleForm, driver: e.target.value})}><option value="">-- בחר נהג --</option>{employees.filter(e => e.status === "פעיל").map(e => <option key={e.id} value={e.name}>{e.name}</option>)}</select></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button className="btn btn-primary" onClick={saveVehicle} disabled={saving}>{saving ? "שומר..." : "שמור"}</button><button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button></div>
            </div>
          )}
          {vehicles.length === 0 ? <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}><div style={{ fontSize: 40 }}>🚗</div><div style={{ fontWeight: 700, marginTop: 8 }}>אין רכבים עדיין</div></div>
          : (
            <div style={{ display: "grid", gap: 12 }}>
              {vehicles.map(v => {
                const nextTest = v.next_test_date ? new Date(v.next_test_date) : null;
                const daysToTest = nextTest ? Math.ceil((nextTest.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                const testAlert = daysToTest !== null && daysToTest <= 30;
                return (
                  <div key={v.id} style={{ border: `1px solid ${testAlert ? "#fca5a5" : "#e8eef6"}`, borderRadius: 16, padding: 16, background: testAlert ? "#fff7f7" : "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 18, fontWeight: 900 }}>🚗 {v.license_plate}</span>
                          <Badge value={v.status} />
                          {testAlert && <span style={{ background: "#dc2626", color: "#fff", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>⚠️ טסט בקרוב!</span>}
                        </div>
                        <div style={{ fontSize: 14, color: "#64748b" }}>{v.model || "-"} · {v.year || "-"}{v.driver ? ` · 👤 ${v.driver}` : ""}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => setSelectedVehicle(v)}>🔧 טיפולים</button>
                        <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setEditingVehicle({...v, test_date: v.test_date || "", next_test_date: v.next_test_date || "", notes: v.notes || "", driver: v.driver || ""})}>✏️ עריכה</button>
                        <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "#dc2626" }} onClick={() => deleteItem("ngs_vehicles", v.id)}>מחק</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 24, marginTop: 12, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                      <div><div style={{ fontSize: 11, color: "#94a3b8" }}>טסט אחרון</div><div style={{ fontSize: 14, fontWeight: 700 }}>{v.test_date ? new Date(v.test_date).toLocaleDateString("he-IL") : "-"}</div></div>
                      <div><div style={{ fontSize: 11, color: "#94a3b8" }}>טסט הבא</div><div style={{ fontSize: 14, fontWeight: 700, color: testAlert ? "#dc2626" : "#0f172a" }}>{nextTest ? `${new Date(v.next_test_date).toLocaleDateString("he-IL")} (${(daysToTest || 0) <= 0 ? "⚠️ עבר!" : (daysToTest || 0) + " ימים"})` : "-"}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {editingVehicle && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 520, width: "100%" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 900 }}>✏️ עריכת רכב — {editingVehicle.license_plate}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="field"><label>לוחית רישוי</label><input className="input" value={editingVehicle.license_plate} onChange={e => setEditingVehicle({...editingVehicle, license_plate: e.target.value})} /></div>
                  <div className="field"><label>דגם</label><input className="input" value={editingVehicle.model} onChange={e => setEditingVehicle({...editingVehicle, model: e.target.value})} /></div>
                  <div className="field"><label>שנה</label><input className="input" value={editingVehicle.year} onChange={e => setEditingVehicle({...editingVehicle, year: e.target.value})} /></div>
                  <div className="field"><label>סטטוס</label><select className="input" value={editingVehicle.status} onChange={e => setEditingVehicle({...editingVehicle, status: e.target.value})}><option>פעיל</option><option>בתיקון</option><option>מושבת</option></select></div>
                  <div className="field"><label>טסט אחרון</label><input className="input" type="date" value={editingVehicle.test_date} onChange={e => setEditingVehicle({...editingVehicle, test_date: e.target.value})} /></div>
                  <div className="field"><label>טסט הבא</label><input className="input" type="date" value={editingVehicle.next_test_date} onChange={e => setEditingVehicle({...editingVehicle, next_test_date: e.target.value})} /></div>
                  <div className="field"><label>👤 נהג</label><select className="input" value={editingVehicle.driver || ""} onChange={e => setEditingVehicle({...editingVehicle, driver: e.target.value})}><option value="">-- בחר נהג --</option>{employees.filter(e => e.status === "פעיל").map(e => <option key={e.id} value={e.name}>{e.name}</option>)}</select></div>
                  <div className="field" style={{ gridColumn: "span 2" }}><label>הערות</label><input className="input" value={editingVehicle.notes} onChange={e => setEditingVehicle({...editingVehicle, notes: e.target.value})} /></div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button className="btn btn-primary" onClick={updateVehicle} disabled={saving}>{saving ? "שומר..." : "💾 שמור"}</button>
                  <button className="btn btn-outline" onClick={() => setEditingVehicle(null)}>ביטול</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && tab === "employees" && (
        <div className="card">
          <div className="section-top"><h3 className="card-title" style={{ margin: 0 }}>👷 עובדים</h3><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף עובד</button></div>
          {showForm && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                <div className="field"><label>שם *</label><input className="input" value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} /></div>
                <div className="field"><label>טלפון</label><input className="input" value={employeeForm.phone} onChange={e => setEmployeeForm({...employeeForm, phone: e.target.value})} /></div>
                <div className="field"><label>תפקיד</label><input className="input" value={employeeForm.role} onChange={e => setEmployeeForm({...employeeForm, role: e.target.value})} /></div>
                <div className="field"><label>סטטוס</label><select className="input" value={employeeForm.status} onChange={e => setEmployeeForm({...employeeForm, status: e.target.value})}><option>פעיל</option><option>חופשה</option><option>לא פעיל</option></select></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button className="btn btn-primary" onClick={saveEmployee} disabled={saving}>{saving ? "שומר..." : "שמור"}</button><button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button></div>
            </div>
          )}
          {employees.length === 0 ? <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}><div style={{ fontSize: 40 }}>👷</div><div style={{ fontWeight: 700, marginTop: 8 }}>אין עובדים עדיין</div></div>
          : <div className="table-wrap"><table><thead><tr><th>שם</th><th>טלפון</th><th>תפקיד</th><th>סטטוס</th><th>פעולות</th></tr></thead><tbody>{employees.map(e => (<tr key={e.id}><td style={{ fontWeight: 800 }}>{e.name}</td><td>{e.phone || "-"}</td><td>{e.role || "-"}</td><td><Badge value={e.status} /></td><td><button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "#dc2626" }} onClick={() => deleteItem("ngs_employees", e.id)}>מחק</button></td></tr>))}</tbody></table></div>}
        </div>
      )}

      {!loading && tab === "clients" && (
        <div className="card">
          <div className="section-top"><h3 className="card-title" style={{ margin: 0 }}>🤝 לקוחות</h3><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף לקוח</button></div>
          {showForm && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div className="field"><label>שם *</label><input className="input" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} /></div>
                <div className="field"><label>טלפון</label><input className="input" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} /></div>
                <div className="field"><label>אימייל</label><input className="input" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} /></div>
                <div className="field"><label>כתובת</label><input className="input" value={clientForm.address} onChange={e => setClientForm({...clientForm, address: e.target.value})} /></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button className="btn btn-primary" onClick={saveClient} disabled={saving}>{saving ? "שומר..." : "שמור"}</button><button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button></div>
            </div>
          )}
          {clients.length === 0 ? <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}><div style={{ fontSize: 40 }}>🤝</div><div style={{ fontWeight: 700, marginTop: 8 }}>אין לקוחות עדיין</div></div>
          : <div className="table-wrap"><table><thead><tr><th>שם</th><th>טלפון</th><th>אימייל</th><th>כתובת</th><th>פעולות</th></tr></thead><tbody>{clients.map(c => (<tr key={c.id}><td style={{ fontWeight: 800 }}>{c.name}</td><td>{c.phone || "-"}</td><td>{c.email || "-"}</td><td>{c.address || "-"}</td><td><button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "#dc2626" }} onClick={() => deleteItem("ngs_clients", c.id)}>מחק</button></td></tr>))}</tbody></table></div>}
        </div>
      )}

      {!loading && tab === "projects" && (
        <div className="card">
          <div className="section-top"><h3 className="card-title" style={{ margin: 0 }}>📁 פרויקטים</h3><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ פרויקט חדש</button></div>
          {showForm && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div className="field"><label>שם פרויקט *</label><input className="input" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} /></div>
                <div className="field"><label>לקוח</label><select className="input" value={projectForm.client_name} onChange={e => setProjectForm({...projectForm, client_name: e.target.value})}><option value="">בחר לקוח</option>{clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}<option value="אחר">✏️ אחר</option></select></div>
                <div className="field"><label>סטטוס</label><select className="input" value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value})}><option>פעיל</option><option>הושלם</option><option>מושהה</option></select></div>
                <div className="field"><label>התחלה</label><input className="input" type="date" value={projectForm.start_date} onChange={e => setProjectForm({...projectForm, start_date: e.target.value})} /></div>
                <div className="field"><label>סיום</label><input className="input" type="date" value={projectForm.end_date} onChange={e => setProjectForm({...projectForm, end_date: e.target.value})} /></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button className="btn btn-primary" onClick={saveProject} disabled={saving}>{saving ? "שומר..." : "שמור"}</button><button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button></div>
            </div>
          )}
          {projects.length === 0 ? <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}><div style={{ fontSize: 40 }}>📁</div><div style={{ fontWeight: 700, marginTop: 8 }}>אין פרויקטים עדיין</div></div>
          : <div className="table-wrap"><table><thead><tr><th>שם פרויקט</th><th>לקוח</th><th>התחלה</th><th>סיום</th><th>סטטוס</th><th>פעולות</th></tr></thead><tbody>{projects.map(p => (<tr key={p.id}><td style={{ fontWeight: 800 }}>{p.name}</td><td>{p.client_name || "-"}</td><td>{p.start_date ? new Date(p.start_date).toLocaleDateString("he-IL") : "-"}</td><td>{p.end_date ? new Date(p.end_date).toLocaleDateString("he-IL") : "-"}</td><td><Badge value={p.status} /></td><td><button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "#dc2626" }} onClick={() => deleteItem("ngs_projects", p.id)}>מחק</button></td></tr>))}</tbody></table></div>}
        </div>
      )}

      {!loading && tab === "service" && (
        <div className="card">
          <div className="section-top">
            <h3 className="card-title" style={{ margin: 0 }}>🔧 קריאות שירות</h3>
            {!isWorker && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ קריאה חדשה</button>}
          </div>
          <div className="chips" style={{ marginBottom: 12, marginTop: 8 }}>
            {["הכל", "חדשה", "בטיפול", "הושלם"].map(f => (<button key={f} className={`btn ${serviceCallFilter === f ? "btn-dark" : "btn-outline"}`} onClick={() => setServiceCallFilter(f)}>{f}</button>))}
          </div>
          {!isWorker && showForm && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div className="field"><label>לקוח</label><select className="input" value={serviceCallForm.client_name} onChange={e => setServiceCallForm({...serviceCallForm, client_name: e.target.value})}><option value="">בחר לקוח</option>{clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
                <div className="field"><label>נושא *</label><input className="input" value={serviceCallForm.issue} onChange={e => setServiceCallForm({...serviceCallForm, issue: e.target.value})} /></div>
                <div className="field"><label>דחיפות</label><select className="input" value={serviceCallForm.urgency} onChange={e => setServiceCallForm({...serviceCallForm, urgency: e.target.value})}><option>נמוכה</option><option>בינונית</option><option>גבוהה</option><option>דחוף מאוד</option></select></div>
                <div className="field"><label>אחראי</label><select className="input" value={serviceCallForm.assigned_to} onChange={e => setServiceCallForm({...serviceCallForm, assigned_to: e.target.value})}><option value="">בחר עובד</option>{employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}</select></div>
                <div className="field"><label>📍 מיקום</label><input className="input" value={serviceCallForm.location} onChange={e => setServiceCallForm({...serviceCallForm, location: e.target.value})} placeholder="כתובת / אתר..." /></div>
                <div className="field"><label>👤 איש קשר</label><input className="input" value={serviceCallForm.contact_name} onChange={e => setServiceCallForm({...serviceCallForm, contact_name: e.target.value})} placeholder="שם איש הקשר" /></div>
                <div className="field"><label>📞 טלפון איש קשר</label><input className="input" value={serviceCallForm.contact_phone} onChange={e => setServiceCallForm({...serviceCallForm, contact_phone: e.target.value})} placeholder="050-0000000" /></div>
              </div>
              <div className="field" style={{ marginTop: 10 }}><label>📝 תיאור</label><textarea className="input" value={serviceCallForm.description} onChange={e => setServiceCallForm({...serviceCallForm, description: e.target.value})} style={{ minHeight: 70, resize: "vertical" }} /></div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button className="btn btn-primary" onClick={saveServiceCall} disabled={saving}>{saving ? "שומר..." : "שמור"}</button><button className="btn btn-outline" onClick={() => setShowForm(false)}>ביטול</button></div>
            </div>
          )}
          {serviceCalls.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16, background: "#1e293b", borderRadius: 16, padding: "14px 20px" }}>
              {[
                { label: "סה״כ", value: serviceCalls.length, color: "#d5b57a" },
                { label: "חדשות", value: serviceCalls.filter(s => s.status === "חדשה").length, color: "#60a5fa" },
                { label: "בטיפול", value: serviceCalls.filter(s => s.status === "בטיפול").length, color: "#fbbf24" },
                { label: "הושלמו", value: serviceCalls.filter(s => s.status === "הושלם").length, color: "#34d399" },
              ].map(item => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}
          {serviceCalls.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}><div style={{ fontSize: 40 }}>🔧</div><div style={{ fontWeight: 700, marginTop: 8 }}>אין קריאות שירות</div></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>תאריך</th><th>לקוח</th><th>נושא</th><th>דחיפות</th><th>אחראי</th><th>סטטוס</th>{!isWorker && <th>טופל ע"י</th>}<th>פעולות</th></tr></thead>
                <tbody>
                  {serviceCalls.filter(s => serviceCallFilter === "הכל" ? true : s.status === serviceCallFilter).map(s => (
                    <tr key={s.id}>
                      <td>{s.created_at ? new Date(s.created_at).toLocaleDateString("he-IL") : "-"}</td>
                      <td>{s.client_name || "-"}</td>
                      <td style={{ fontWeight: 700 }}>{s.issue}</td>
                      <td><Badge value={s.urgency} /></td>
                      <td>{s.assigned_to || "-"}</td>
                      <td>
                        {isWorker ? (
                          <button
                            className="btn btn-outline"
                            style={{ fontSize: 12, padding: "4px 12px", background: s.status === "הושלם" ? "#dcfce7" : "", color: s.status === "הושלם" ? "#16a34a" : "" }}
                            onClick={() => s.status !== "הושלם" && updateServiceCallStatus(s.id, "הושלם", workerName)}
                            disabled={s.status === "הושלם"}>
                            {s.status === "הושלם" ? "✅ טופל" : "סמן טופל"}
                          </button>
                        ) : (
                          <select value={s.status} onChange={e => updateServiceCallStatus(s.id, e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 8px", fontSize: 13 }}>
                            <option>חדשה</option><option>בטיפול</option><option>הושלם</option>
                          </select>
                        )}
                      </td>
                      {!isWorker && <td style={{ fontSize: 13, color: s.completed_by ? "#16a34a" : "#94a3b8", fontWeight: s.completed_by ? 700 : 400 }}>{s.completed_by || "-"}</td>}
                      <td style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-primary" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setSelectedServiceCall(s)}>👁 צפייה</button>
                        {!isWorker && <button className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "#dc2626" }} onClick={() => deleteItem("ngs_service_calls", s.id)}>מחק</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && tab === "tasks" && (
        <TasksTab tasks={tasks} employees={employees} isWorker={isWorker} workerName={workerName} onRefresh={load} />
      )}

      {tab === "inventory" && (
        <InventoryTab isWorker={isWorker} workerName={workerName} />
      )}

      {!loading && tab === "worklogs" && (
        <div className="card">
          <div className="section-top"><h3 className="card-title" style={{ margin: 0 }}>📋 יומני עבודה</h3><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ יומן חדש</button></div>
          <div className="chips" style={{ marginBottom: 12, marginTop: 8 }}>
            {!isWorker && ["הכל", "לא טופל", "יצאה פרפורמה"].map(f => (<button key={f} className={`btn ${workLogFilter === f ? "btn-dark" : "btn-outline"}`} onClick={() => setWorkLogFilter(f)}>{f}</button>))}
          </div>
          {showForm && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, marginBottom: 16, display: "grid", gap: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15, borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>📋 יומן עבודה חדש</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div className="field"><label>ממלא היומן</label><input className="input" value={workLogForm.filled_by} onChange={e => !isWorker && setWorkLogForm({...workLogForm, filled_by: e.target.value})} placeholder="שם הממלא" readOnly={isWorker} style={isWorker ? { background: "#f1f5f9", color: "#64748b" } : {}} /></div>
                <div className="field"><label>לקוח</label><select className="input" value={workLogForm.project_name} onChange={e => setWorkLogForm({...workLogForm, project_name: e.target.value})}><option value="">בחר לקוח</option>{clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}<option value="אחר">✏️ אחר</option></select></div>
                <div className="field"><label>סניף / אתר</label><input className="input" value={workLogForm.branch} onChange={e => setWorkLogForm({...workLogForm, branch: e.target.value})} placeholder="שם הסניף" /></div>
                <div className="field"><label>שעות עבודה</label><input className="input" type="number" value={workLogForm.hours} onChange={e => setWorkLogForm({...workLogForm, hours: e.target.value})} step="0.5" /></div>
                <div className="field"><label>תאריך</label><input className="input" type="date" value={workLogForm.date} onChange={e => setWorkLogForm({...workLogForm, date: e.target.value})} /></div>
              </div>
              <div className="field"><label>📝 הערות ללקוח</label><textarea className="input" value={workLogForm.client_notes} onChange={e => setWorkLogForm({...workLogForm, client_notes: e.target.value})} style={{ minHeight: 70, resize: "vertical" }} /></div>
              <div>
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
