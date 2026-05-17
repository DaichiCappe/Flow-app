import { useState } from "react";

const STATUTS = ["Todo", "En cours", "Bloqué", "Fait"];
const STATUT_COLORS = { "Todo": "#6b7280", "En cours": "#6EE7B7", "Bloqué": "#F87171", "Fait": "#A5B4FC" };
const STATUT_ICONS = { "Todo": "○", "En cours": "◑", "Bloqué": "⊘", "Fait": "●" };
const TAG_COLORS = { "Pro": "#FCD34D", "Perso": "#A5B4FC", "Urgent": "#F87171" };
const CAT_COLORS = { Alimentation: "#6EE7B7", Sorties: "#A5B4FC", Transport: "#FCD34D", Santé: "#F87171", Shopping: "#FB923C", Autre: "#6b7280" };
const MOMENTS = ["Matin", "Midi", "Après-midi", "Soir", "Nuit"];
const DAYS_IN_MONTH = 31;
const TODAY_DAY = 17;
const DAYS_LEFT = DAYS_IN_MONTH - TODAY_DAY + 1;

const INIT = {
  health: { bodyBattery: 74, hrv: 52, restingHR: 48, spo2: 97, stress: 28, vo2max: 54, recovery: 18,
    sleep: { quality: 78, duration: 7.2, bedtime: "23:20", wake: "06:35", deep: 1.4, rem: 1.8, light: 4.0 },
    steps: 8420, calories: 2340, lastActivity: "Course 45min · Zone 3" },
  habits: { cigarettes: { total: 6, moments: { Matin: 1, Midi: 1, "Après-midi": 2, Soir: 2, Nuit: 0 } }, detente: 1, sport: true, stress: 3, mood: 4 },
  finance: {
    salaire: 3200, soldeCompte: 1840,
    recurring: [
      { id: 1, label: "Loyer", amount: 850, icon: "🏠" }, { id: 2, label: "Électricité", amount: 65, icon: "⚡" },
      { id: 3, label: "Internet", amount: 30, icon: "📡" }, { id: 4, label: "Abonnements", amount: 45, icon: "📱" },
    ],
    expenses: [
      { id: 1, label: "Courses", amount: 67.50, cat: "Alimentation", icon: "🛒", date: "17/05" },
      { id: 2, label: "Restaurant", amount: 24.00, cat: "Sorties", icon: "🍽️", date: "16/05" },
      { id: 3, label: "Essence", amount: 55.00, cat: "Transport", icon: "⛽", date: "15/05" },
    ],
    portfolio: [
      { id: 1, ticker: "AAPL", name: "Apple", shares: 5, buyPrice: 165.20, currentPrice: 189.30, currency: "USD" },
      { id: 2, ticker: "MSCI World", name: "ETF MSCI World", shares: 12, buyPrice: 78.40, currentPrice: 84.10, currency: "EUR" },
      { id: 3, ticker: "NVDA", name: "Nvidia", shares: 3, buyPrice: 420.00, currentPrice: 875.40, currency: "USD" },
    ],
  },
  projects: [
    { id: 1, name: "Lancement produit", tag: "Pro", color: "#FCD34D", emoji: "🚀", description: "Préparer et lancer la nouvelle offre",
      tasks: [
        { id: 101, label: "Définir le pricing", statut: "Fait", need: "", today: false },
        { id: 102, label: "Créer la landing page", statut: "En cours", need: "Accès Figma de Sophie", today: true },
        { id: 103, label: "Deck investisseurs", statut: "Todo", need: "", today: true },
        { id: 104, label: "Campagne email", statut: "Bloqué", need: "Validation direction", today: false },
      ]},
    { id: 2, name: "Rénovation appart", tag: "Perso", color: "#A5B4FC", emoji: "🏠", description: "Travaux salon et cuisine",
      tasks: [
        { id: 201, label: "Devis peinture", statut: "Fait", need: "", today: false },
        { id: 202, label: "Choisir carrelage", statut: "En cours", need: "", today: true },
        { id: 203, label: "Contacter plombier", statut: "Todo", need: "Contact voisins", today: false },
      ]},
    { id: 3, name: "Course trail 50km", tag: "Perso", color: "#FB923C", emoji: "🏔️", description: "Objectif trail septembre",
      tasks: [
        { id: 301, label: "Plan entraînement", statut: "Fait", need: "", today: false },
        { id: 302, label: "Sortie longue weekend", statut: "Todo", need: "", today: true },
        { id: 303, label: "Inscription course", statut: "Bloqué", need: "Ouverture 1er juin", today: false },
      ]},
  ],
};

function fmt(n, d = 0) { return n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }); }
function calcFormScore(h) { return Math.round((h.bodyBattery/100)*30 + Math.min(h.hrv/70,1)*25 + (h.sleep.quality/100)*25 + (1-h.stress/100)*20); }
function scoreColor(s) { return s >= 80 ? "#6EE7B7" : s >= 60 ? "#FCD34D" : s >= 40 ? "#FB923C" : "#F87171"; }
function scoreLabel(s) { return s >= 80 ? "Excellente" : s >= 60 ? "Bonne forme" : s >= 40 ? "Correcte" : "Repos"; }
function projectProgress(tasks) { if (!tasks.length) return 0; return Math.round(tasks.filter(t => t.statut === "Fait").length / tasks.length * 100); }

function Tag({ color, children }) {
  return <span style={{ fontSize: 9, color, background: `${color}20`, padding: "2px 7px", borderRadius: 99, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>{children}</span>;
}

function Ring({ value, color, size = 48, stroke = 5, label }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${(value/100)*circ} ${circ}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}66)`, transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: size > 60 ? 13 : 9, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>{value}%</span>
        </div>
      </div>
      {label && <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "center" }}>{label}</div>}
    </div>
  );
}

function ST({ children, color = "#6b7280" }) {
  return <div style={{ fontSize: 11, color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;
}

function StatutBadge({ statut, onClick }) {
  const color = STATUT_COLORS[statut];
  return <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 4, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 99, padding: "3px 8px", cursor: onClick ? "pointer" : "default", flexShrink: 0 }}>
    <span style={{ fontSize: 10, color }}>{STATUT_ICONS[statut]}</span>
    <span style={{ fontSize: 10, color, fontWeight: 600 }}>{statut}</span>
  </div>;
}

function Tabs({ tabs, active, onChange }) {
  return <div style={{ display: "flex", gap: 6, background: "#0d1117", borderRadius: 12, padding: 4, border: "1px solid #1f2937", marginBottom: 14 }}>
    {tabs.map(t => <div key={t.id} onClick={() => onChange(t.id)} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 9, fontSize: 11, fontWeight: active === t.id ? 600 : 400, background: active === t.id ? "#1f2937" : "transparent", color: active === t.id ? "#f9fafb" : "#6b7280", cursor: "pointer" }}>{t.label}</div>)}
  </div>;
}

// ── SANTÉ ────────────────────────────────────────────────────────────────────
function HealthModule({ health, habits, onUpdateHabits }) {
  const [tab, setTab] = useState("today");
  const [editMode, setEditMode] = useState(false);
  const [cigs, setCigs] = useState(habits.cigarettes);
  const [detente, setDetente] = useState(habits.detente);
  const [sport, setSport] = useState(habits.sport);
  const [stress, setStress] = useState(habits.stress);
  const [mood, setMood] = useState(habits.mood);
  const [saved, setSaved] = useState(false);
  const formScore = calcFormScore(health);
  const sc = scoreColor(formScore);
  const totalCigs = Object.values(cigs.moments).reduce((a, b) => a + b, 0);

  function addCig(m) { setCigs(p => ({ ...p, total: p.total + 1, moments: { ...p.moments, [m]: (p.moments[m]||0)+1 } })); }
  function remCig(m) { if (!(cigs.moments[m]||0)) return; setCigs(p => ({ ...p, total: p.total-1, moments: { ...p.moments, [m]: p.moments[m]-1 } })); }
  function save() { onUpdateHabits({ ...habits, cigarettes: cigs, detente, sport, stress, mood }); setSaved(true); setEditMode(false); setTimeout(() => setSaved(false), 2000); }

  return <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ background: `linear-gradient(135deg,${sc}0d,#0d1117)`, border: `1px solid ${sc}33`, borderRadius: 24, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Ring value={formScore} color={sc} size={80} stroke={8} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Score du jour</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: sc, marginTop: 2 }}>{scoreLabel(formScore)}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <Tag color="#A5B4FC">💤 {health.sleep.duration}h</Tag>
            <Tag color="#6EE7B7">⚡ {health.bodyBattery}</Tag>
            <Tag color="#F87171">❤️ {health.restingHR}bpm</Tag>
          </div>
        </div>
      </div>
    </div>

    <Tabs tabs={[{id:"today",label:"Forme"},{id:"habits",label:"Habitudes"},{id:"connect",label:"Sync"}]} active={tab} onChange={setTab} />

    {tab === "today" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 18, display: "flex", justifyContent: "space-around" }}>
        <Ring value={health.bodyBattery} color="#6EE7B7" size={76} stroke={7} label="Body Battery" />
        <Ring value={health.sleep.quality} color="#A5B4FC" size={76} stroke={7} label="Sommeil" />
        <Ring value={100-health.stress} color="#FCD34D" size={76} stroke={7} label="Calme" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[{icon:"❤️",label:"FC repos",value:health.restingHR,unit:"bpm",color:"#F87171",detail:"Excellent"},
          {icon:"🫀",label:"HRV",value:health.hrv,unit:"ms",color:"#A5B4FC",detail:"Bon"},
          {icon:"🫁",label:"SpO2",value:health.spo2,unit:"%",color:"#6EE7B7",detail:"Normal"},
          {icon:"🏃",label:"VO2 max",value:health.vo2max,unit:"",color:"#FCD34D",detail:"Athlète"}].map(m => (
          <div key={m.label} style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 18 }}>{m.icon}</span><Tag color={m.color}>{m.detail}</Tag></div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Syne',sans-serif", color: m.color }}>{m.value}<span style={{ fontSize: 12, color: "#6b7280" }}>{m.unit}</span></div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 18, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>🌙 Sommeil</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "#A5B4FC" }}>{health.sleep.duration}h</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[{label:"Coucher",value:health.sleep.bedtime,color:"#6366F1"},{label:"Lever",value:health.sleep.wake,color:"#FCD34D"},{label:"Sieste",value:"40min",color:"#FB923C"}].map(s => (
            <div key={s.label} style={{ background: "#111827", borderRadius: 10, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {[{label:"Profond",value:health.sleep.deep,color:"#6366F1"},{label:"REM",value:health.sleep.rem,color:"#A5B4FC"},{label:"Léger",value:health.sleep.light,color:"#c7d2fe"}].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
            <div style={{ fontSize: 11, color: "#9ca3af", width: 44 }}>{s.label}</div>
            <div style={{ flex: 1, background: "#1a1a2e", borderRadius: 99, height: 5, overflow: "hidden" }}>
              <div style={{ width: `${(s.value/health.sleep.duration)*100}%`, height: "100%", background: s.color, borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "'DM Mono',monospace" }}>{s.value}h</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[{icon:"👟",label:"Pas",value:health.steps.toLocaleString("fr-FR"),max:10000,current:health.steps,color:"#6EE7B7",goal:"10 000"},
          {icon:"🔥",label:"Calories",value:health.calories.toString(),max:3000,current:health.calories,color:"#FB923C",goal:"3 000"}].map(s => (
          <div key={s.label} style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Syne',sans-serif", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
            <div style={{ background: "#1a1a2e", borderRadius: 99, height: 4, overflow: "hidden", marginTop: 8 }}>
              <div style={{ width: `${Math.min((s.current/s.max)*100,100)}%`, height: "100%", background: s.color, borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 9, color: "#4b5563", marginTop: 3 }}>Objectif {s.goal}</div>
          </div>
        ))}
      </div>
    </div>}

    {tab === "habits" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: "12px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>📋 Saisie du jour</div>
        <div style={{ display: "flex", gap: 8 }}>
          {saved && <div style={{ fontSize: 11, color: "#6EE7B7" }}>✓ Sauvegardé</div>}
          <div onClick={() => editMode ? save() : setEditMode(true)} style={{ fontSize: 12, fontWeight: 600, color: editMode ? "#080b14" : "#6EE7B7", background: editMode ? "#6EE7B7" : "#6EE7B718", border: "1px solid #6EE7B744", padding: "6px 14px", borderRadius: 99, cursor: "pointer" }}>
            {editMode ? "Sauvegarder" : "Modifier"}
          </div>
        </div>
      </div>
      <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <ST>🚬 Cigarettes</ST>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: totalCigs > 10 ? "#F87171" : totalCigs > 5 ? "#FB923C" : "#6EE7B7" }}>{totalCigs}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 52 }}>
          {MOMENTS.map(m => {
            const v = cigs.moments[m]||0, maxV = Math.max(...Object.values(cigs.moments),1);
            return <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 10, color: "#F87171" }}>{v > 0 ? v : ""}</div>
              <div style={{ width: "100%", height: Math.max((v/maxV)*40,4), borderRadius: "4px 4px 0 0", background: v > 0 ? "#F87171" : "#1f2937" }} />
              <div style={{ fontSize: 8, color: "#4b5563" }}>{m.substring(0,4)}</div>
            </div>;
          })}
        </div>
        {editMode && <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {MOMENTS.map(m => <div key={m} style={{ display: "flex", alignItems: "center", gap: 4, background: "#111827", borderRadius: 10, padding: "6px 10px" }}>
            <div onClick={() => remCig(m)} style={{ color: "#F87171", cursor: "pointer", fontSize: 14 }}>−</div>
            <div style={{ fontSize: 11, color: "#9ca3af", minWidth: 28, textAlign: "center" }}>{m.substring(0,4)}</div>
            <div onClick={() => addCig(m)} style={{ color: "#6EE7B7", cursor: "pointer", fontSize: 14 }}>+</div>
          </div>)}
        </div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>🌿 Détente</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0,1,2,3].map(v => <div key={v} onClick={() => editMode && setDetente(v)} style={{ flex: 1, height: 28, borderRadius: 8, background: v <= detente ? "#6EE7B7" : "#1f2937", opacity: v <= detente ? 0.4+v*0.2 : 0.3, cursor: editMode ? "pointer" : "default", border: v === detente ? "1px solid #6EE7B788" : "1px solid transparent" }} />)}
          </div>
          <div style={{ fontSize: 10, color: "#4b5563", marginTop: 6 }}>{["Aucune","Légère","Modérée","Intense"][detente]}</div>
        </div>
        <div onClick={() => editMode && setSport(!sport)} style={{ background: "#0d1117", border: `1px solid ${sport ? "#6EE7B733" : "#1f2937"}`, borderRadius: 16, padding: 14, cursor: editMode ? "pointer" : "default" }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>🏃 Activité</div>
          <div style={{ fontSize: 20, marginBottom: 4 }}>{sport ? "✅" : "⬜"}</div>
          <div style={{ fontSize: 12, color: sport ? "#6EE7B7" : "#4b5563", fontWeight: 600 }}>{sport ? "Actif" : "Repos"}</div>
        </div>
        <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>🧠 Stress</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1,2,3,4,5].map(v => <div key={v} onClick={() => editMode && setStress(v)} style={{ flex: 1, height: 24, borderRadius: 6, background: v <= stress ? "#FB923C" : "#1f2937", cursor: editMode ? "pointer" : "default" }} />)}
          </div>
          <div style={{ fontSize: 12, marginTop: 6 }}>{["","😌","🙂","😐","😟","😰"][stress]} {["","Zen","Calme","Moyen","Stressé","Très stressé"][stress]}</div>
        </div>
        <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>💭 Humeur</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1,2,3,4,5].map(v => <div key={v} onClick={() => editMode && setMood(v)} style={{ flex: 1, height: 24, borderRadius: 6, background: v <= mood ? "#A5B4FC" : "#1f2937", cursor: editMode ? "pointer" : "default" }} />)}
          </div>
          <div style={{ fontSize: 12, marginTop: 6 }}>{["","😞","😐","🙂","😊","😄"][mood]} {["","Difficile","Bof","Correct","Bien","Super"][mood]}</div>
        </div>
      </div>
      <div style={{ background: "#0d1117", border: "1px solid #A5B4FC33", borderRadius: 20, padding: 18 }}>
        <ST color="#A5B4FC">📊 Insights · 7 jours</ST>
        {[{icon:"🏃",color:"#6EE7B7",text:"Nuits après sport : +17pts de qualité de sommeil en moyenne."},
          {icon:"🚬",color:"#F87171",text:"Au-dessus de 8 cig/jour : qualité sommeil -22pts en moyenne."},
          {icon:"🌿",color:"#6EE7B7",text:"Avec 🌿 : stress moyen 2.8/5 vs 3.9/5 sans. Impact visible."},
          {icon:"⏰",color:"#FCD34D",text:"Coucher avant minuit → meilleure qualité de sommeil."}].map((ins,i) => (
          <div key={i} style={{ background: `${ins.color}0d`, border: `1px solid ${ins.color}22`, borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", gap: 10 }}>
            <div style={{ fontSize: 16 }}>{ins.icon}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>{ins.text}</div>
          </div>
        ))}
      </div>
    </div>}

    {tab === "connect" && <div style={{ background: "#0d1117", border: "1px solid #6EE7B733", borderRadius: 20, padding: 18 }}>
      <ST color="#6EE7B7">✅ Chaîne de sync</ST>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>Fenix 8 → Garmin Connect → Apple Santé → Raccourcis → Flow</div>
      {[{label:"Fenix 8",status:"Connectée",ok:true},{label:"Garmin Connect",status:"Synchronisé",ok:true},{label:"Apple Santé",status:"À vérifier",ok:null},{label:"Raccourci auto",status:"À configurer",ok:false}].map((s,i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "10px 12px", background: "#111827", borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: "#d1d5db" }}>{s.label}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: s.ok === true ? "#6EE7B7" : s.ok === null ? "#FCD34D" : "#F87171" }}>{s.status}</div>
        </div>
      ))}
    </div>}
  </div>;
}

// ── FINANCES ─────────────────────────────────────────────────────────────────
function FinanceModule({ finance, onUpdate }) {
  const [tab, setTab] = useState("budget");
  const [showAddExp, setShowAddExp] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [newExp, setNewExp] = useState({ label: "", amount: "", cat: "Alimentation", icon: "🛒" });
  const totalRec = finance.recurring.reduce((a, b) => a + b.amount, 0);
  const dispo = finance.salaire - totalRec;
  const totalSpent = finance.expenses.reduce((a, b) => a + b.amount, 0);
  const bjr = (dispo - totalSpent) / DAYS_LEFT;
  const bj = dispo / DAYS_IN_MONTH;
  const accent = bjr < 0 ? "#F87171" : bjr < bj * 0.5 ? "#FB923C" : "#FCD34D";
  const totalInv = finance.portfolio.reduce((a, s) => a + s.shares * s.buyPrice, 0);
  const totalNow = finance.portfolio.reduce((a, s) => a + s.shares * s.currentPrice, 0);
  const gain = totalNow - totalInv;
  const pos = gain >= 0;
  const bycat = Object.entries(finance.expenses.reduce((acc, e) => { acc[e.cat] = (acc[e.cat]||0) + e.amount; return acc; }, {})).sort((a,b) => b[1]-a[1]);

  function addExp() {
    if (!newExp.label || !newExp.amount) return;
    onUpdate({ ...finance, expenses: [{ id: Date.now(), ...newExp, amount: parseFloat(newExp.amount), date: `${TODAY_DAY}/05` }, ...finance.expenses] });
    setNewExp({ label: "", amount: "", cat: "Alimentation", icon: "🛒" }); setShowAddExp(false);
  }

  return <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <Tabs tabs={[{id:"budget",label:"💰 Budget"},{id:"depenses",label:"💸 Dépenses"},{id:"invest",label:"📈 Invest."}]} active={tab} onChange={setTab} />

    {tab === "budget" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: `linear-gradient(135deg,${accent}12,#0d1117)`, border: `1px solid ${accent}33`, borderRadius: 24, padding: 22 }}>
        <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Budget restant aujourd'hui</div>
        <div style={{ fontSize: 44, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: accent, letterSpacing: "-0.04em", lineHeight: 1.1, marginTop: 4 }}>{fmt(bjr,2)}<span style={{ fontSize: 18, color: "#6b7280" }}>€/j</span></div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Base : {fmt(bj,2)}€/j · {DAYS_LEFT} jours restants</div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Dépensé ce mois</div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: accent }}>{fmt(totalSpent,2)}€ / {fmt(dispo,0)}€</div>
          </div>
          <div style={{ background: "#1a1a2e", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${Math.min((totalSpent/dispo)*100,100)}%`, height: "100%", background: `linear-gradient(90deg,${accent}88,${accent})`, borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ marginTop: 14, background: "#0d1117aa", borderRadius: 12, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>💳 Solde compte</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "#d1d5db" }}>{fmt(finance.soldeCompte - totalSpent, 2)}€</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div onClick={() => setShowAddExp(!showAddExp)} style={{ flex: 1, background: "#FCD34D18", border: "1px solid #FCD34D44", borderRadius: 14, padding: 12, textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 18 }}>➕</div><div style={{ fontSize: 11, color: "#FCD34D", marginTop: 4, fontWeight: 600 }}>Dépense</div>
        </div>
        <div onClick={() => setShowSetup(!showSetup)} style={{ flex: 1, background: "#A5B4FC18", border: "1px solid #A5B4FC44", borderRadius: 14, padding: 12, textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 18 }}>⚙️</div><div style={{ fontSize: 11, color: "#A5B4FC", marginTop: 4, fontWeight: 600 }}>Config</div>
        </div>
      </div>
      {showAddExp && <div style={{ background: "#0d1117", border: "1px solid #FCD34D33", borderRadius: 16, padding: 16 }}>
        <input placeholder="Libellé" value={newExp.label} onChange={e => setNewExp(p => ({...p,label:e.target.value}))} style={{ width: "100%", background: "#1f2937", border: "none", borderRadius: 10, color: "#f9fafb", padding: "10px 12px", fontSize: 13, outline: "none", marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input placeholder="Montant €" type="number" value={newExp.amount} onChange={e => setNewExp(p => ({...p,amount:e.target.value}))} style={{ flex: 1, background: "#1f2937", border: "none", borderRadius: 10, color: "#FCD34D", fontFamily: "'DM Mono',monospace", padding: "10px 12px", fontSize: 14, outline: "none" }} />
          <select value={newExp.cat} onChange={e => setNewExp(p => ({...p,cat:e.target.value}))} style={{ flex: 1, background: "#1f2937", border: "none", borderRadius: 10, color: "#9ca3af", padding: "10px 12px", fontSize: 12, outline: "none" }}>
            {Object.keys(CAT_COLORS).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div onClick={addExp} style={{ background: "#FCD34D", color: "#080b14", borderRadius: 12, padding: 11, textAlign: "center", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Ajouter</div>
      </div>}
      {showSetup && <div style={{ background: "#0d1117", border: "1px solid #A5B4FC33", borderRadius: 16, padding: 16 }}>
        <ST>Configuration</ST>
        {[{label:"Salaire net",key:"salaire"},{label:"Solde compte",key:"soldeCompte"}].map(f => (
          <div key={f.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1f2937" }}>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>{f.label}</div>
            <input type="number" value={finance[f.key]} onChange={e => onUpdate({...finance,[f.key]:parseFloat(e.target.value)||0})} style={{ background: "#1f2937", border: "none", borderRadius: 8, color: "#FCD34D", fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 700, width: 100, textAlign: "right", padding: "4px 8px", outline: "none" }} />
          </div>
        ))}
        <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Récurrentes</div>
        {finance.recurring.map(r => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 14 }}>{r.icon}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", flex: 1 }}>{r.label}</div>
            <input type="number" value={r.amount} onChange={e => onUpdate({...finance,recurring:finance.recurring.map(x => x.id===r.id?{...x,amount:parseFloat(e.target.value)||0}:x)})} style={{ background: "#1f2937", border: "none", borderRadius: 8, color: "#FCD34D", fontFamily: "'DM Mono',monospace", fontSize: 13, width: 80, textAlign: "right", padding: "4px 8px", outline: "none" }} />
            <span style={{ fontSize: 11, color: "#4b5563" }}>€</span>
          </div>
        ))}
        <div style={{ marginTop: 10, padding: "10px 12px", background: "#111827", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Disponible libre</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "#FCD34D", fontWeight: 700 }}>{fmt(dispo,0)}€ → {fmt(bj,2)}€/j</div>
        </div>
      </div>}
      <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 18 }}>
        <ST>📅 Récap du mois</ST>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[{label:"Salaire",value:"+"+fmt(finance.salaire,0)+"€",color:"#6EE7B7"},{label:"Récurrentes",value:"-"+fmt(totalRec,0)+"€",color:"#F87171"},{label:"Dépensé",value:"-"+fmt(totalSpent,0)+"€",color:"#FB923C"}].map(s => (
            <div key={s.label} style={{ background: "#111827", borderRadius: 12, padding: 10, textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#4b5563", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>}

    {tab === "depenses" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 18 }}>
        <ST>💸 Où va mon argent</ST>
        {bycat.map(([cat,amt]) => {
          const color = CAT_COLORS[cat]||"#6b7280", pct = (amt/totalSpent*100).toFixed(0);
          return <div key={cat} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ fontSize: 12, color: "#d1d5db" }}>{cat}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Tag color={color}>{pct}%</Tag><div style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color }}>{fmt(amt,2)}€</div></div>
            </div>
            <div style={{ background: "#1a1a2e", borderRadius: 99, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99 }} />
            </div>
          </div>;
        })}
      </div>
      {finance.expenses.map(e => {
        const color = CAT_COLORS[e.cat]||"#6b7280";
        return <div key={e.id} style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{e.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>{e.label}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 3 }}><Tag color={color}>{e.cat}</Tag><div style={{ fontSize: 10, color: "#4b5563" }}>{e.date}</div></div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "#FB923C" }}>-{fmt(e.amount,2)}€</div>
        </div>;
      })}
    </div>}

    {tab === "invest" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: `linear-gradient(135deg,${pos?"#6EE7B7":"#F87171"}0d,#0d1117)`, border: `1px solid ${pos?"#6EE7B7":"#F87171"}33`, borderRadius: 24, padding: 22 }}>
        <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Portefeuille total</div>
        <div style={{ fontSize: 34, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "#f9fafb", letterSpacing: "-0.03em", marginTop: 4 }}>{fmt(totalNow,0)}<span style={{ fontSize: 16, color: "#6b7280" }}>€</span></div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <Tag color={pos?"#6EE7B7":"#F87171"}>{pos?"+":""}{fmt(gain,0)}€</Tag>
          <Tag color={pos?"#6EE7B7":"#F87171"}>{pos?"+":""}{((gain/totalInv)*100).toFixed(1)}%</Tag>
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: "#4b5563" }}>Investi : {fmt(totalInv,0)}€ · Cours simulés</div>
      </div>
      {finance.portfolio.map(s => {
        const g = (s.currentPrice-s.buyPrice)*s.shares, gp = ((s.currentPrice-s.buyPrice)/s.buyPrice*100).toFixed(1), p = g >= 0, pc = p?"#6EE7B7":"#F87171", w = ((s.shares*s.currentPrice)/totalNow*100).toFixed(0);
        return <div key={s.id} style={{ background: "#0d1117", border: `1px solid ${p?"#6EE7B722":"#F8717122"}`, borderRadius: 16, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: pc }}>{s.ticker}</div>
                <Tag color="#6b7280">{s.currency}</Tag><Tag color="#A5B4FC">{w}%</Tag>
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.name} · {s.shares} titres</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "#f9fafb" }}>{fmt(s.currentPrice,2)}</div>
              <div style={{ fontSize: 11, color: pc, fontFamily: "'DM Mono',monospace" }}>{p?"+":""}{gp}%</div>
            </div>
          </div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, color: "#4b5563" }}>Achat : {fmt(s.buyPrice,2)} · Valeur : {fmt(s.shares*s.currentPrice,0)}€</div>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: pc }}>{p?"+":""}{fmt(g,0)}€</div>
          </div>
        </div>;
      })}
    </div>}
  </div>;
}

// ── PROJETS ──────────────────────────────────────────────────────────────────
function ProjectsModule({ projects, onUpdate }) {
  const [view, setView] = useState("dashboard");
  const [selId, setSelId] = useState(null);
  const [pview, setPview] = useState("list");
  const [showAdd, setShowAdd] = useState(false);
  const [np, setNp] = useState({ name: "", description: "", tag: "Pro", emoji: "📌", color: "#6EE7B7" });
  const current = projects.find(p => p.id === selId);
  const todayTasks = projects.flatMap(p => p.tasks.filter(t => t.today && t.statut !== "Fait").map(t => ({...t,project:p})));
  const blocked = projects.flatMap(p => p.tasks.filter(t => t.statut === "Bloqué").map(t => ({...t,project:p})));

  function updTasks(pid, tasks) { onUpdate(projects.map(p => p.id===pid?{...p,tasks}:p)); }
  function cycleS(pid, tid) { const p = projects.find(x => x.id===pid); updTasks(pid, p.tasks.map(t => { if(t.id!==tid)return t; const i=STATUTS.indexOf(t.statut); return {...t,statut:STATUTS[(i+1)%STATUTS.length]}; })); }
  function togToday(pid, tid) { const p = projects.find(x => x.id===pid); updTasks(pid, p.tasks.map(t => t.id===tid?{...t,today:!t.today}:t)); }
  function addP() { if(!np.name)return; onUpdate([...projects,{id:Date.now(),...np,tasks:[]}]); setNp({name:"",description:"",tag:"Pro",emoji:"📌",color:"#6EE7B7"}); setShowAdd(false); }

  return <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {view === "project" ? <div onClick={() => setView("dashboard")} style={{ fontSize: 12, color: "#6b7280", cursor: "pointer" }}>← Retour</div> : <div style={{ fontSize: 11, color: "#6b7280" }}>Vue d'ensemble</div>}
      {view === "project" ? (
        <div style={{ display: "flex", gap: 8 }}>
          {["list","mindmap"].map(v => <div key={v} onClick={() => setPview(v)} style={{ padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: pview===v?"#1f2937":"transparent", color: pview===v?"#f9fafb":"#6b7280", border: "1px solid #1f2937", cursor: "pointer" }}>{v==="list"?"☰ Liste":"◎ Map"}</div>)}
        </div>
      ) : (
        <div onClick={() => setShowAdd(!showAdd)} style={{ background: "#6EE7B718", border: "1px solid #6EE7B744", borderRadius: 12, padding: "8px 14px", fontSize: 12, color: "#6EE7B7", fontWeight: 600, cursor: "pointer" }}>+ Projet</div>
      )}
    </div>

    {showAdd && <div style={{ background: "#0d1117", border: "1px solid #6EE7B733", borderRadius: 16, padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input placeholder="🌟" value={np.emoji} onChange={e => setNp(p=>({...p,emoji:e.target.value}))} style={{ width: 50, background: "#1f2937", border: "none", borderRadius: 10, color: "#f9fafb", padding: "10px 8px", fontSize: 18, textAlign: "center", outline: "none" }} />
        <input placeholder="Nom du projet" value={np.name} onChange={e => setNp(p=>({...p,name:e.target.value}))} style={{ flex: 1, background: "#1f2937", border: "none", borderRadius: 10, color: "#f9fafb", padding: "10px 12px", fontSize: 13, outline: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select value={np.tag} onChange={e => setNp(p=>({...p,tag:e.target.value}))} style={{ flex: 1, background: "#1f2937", border: "none", borderRadius: 10, color: "#9ca3af", padding: "10px 12px", fontSize: 12, outline: "none" }}>
          {["Pro","Perso","Urgent"].map(t => <option key={t}>{t}</option>)}
        </select>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flex: 1, background: "#1f2937", borderRadius: 10, padding: "0 12px" }}>
          {["#6EE7B7","#FCD34D","#A5B4FC","#FB923C","#F87171"].map(c => <div key={c} onClick={() => setNp(p=>({...p,color:c}))} style={{ width: 18, height: 18, borderRadius: "50%", background: c, cursor: "pointer", border: np.color===c?"2px solid white":"2px solid transparent" }} />)}
        </div>
      </div>
      <div onClick={addP} style={{ background: np.color, color: "#080b14", borderRadius: 12, padding: 11, textAlign: "center", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Créer</div>
    </div>}

    {view === "dashboard" && <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[{label:"À faire",value:todayTasks.length,color:"#6EE7B7",icon:"◎"},{label:"Bloqués",value:blocked.length,color:"#F87171",icon:"⊘"},{label:"Projets",value:projects.length,color:"#FCD34D",icon:"◈"}].map(s => (
          <div key={s.label} style={{ background: "#0d1117", border: `1px solid ${s.color}22`, borderRadius: 16, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#0d1117", border: "1px solid #6EE7B733", borderRadius: 20, padding: 18 }}>
        <ST color="#6EE7B7">⚡ Focus aujourd'hui</ST>
        {todayTasks.length === 0 && <div style={{ fontSize: 13, color: "#4b5563", textAlign: "center", padding: "12px 0" }}>Rien de prévu</div>}
        {todayTasks.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #111827" }}>
            <div style={{ width: 3, height: 36, borderRadius: 99, background: t.project.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#d1d5db", fontWeight: 500 }}>{t.label}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 3 }}><span style={{ fontSize: 10 }}>{t.project.emoji}</span><span style={{ fontSize: 10, color: "#6b7280" }}>{t.project.name}</span></div>
            </div>
            <div onClick={() => cycleS(t.project.id, t.id)} style={{ display: "flex", alignItems: "center", gap: 4, background: `${STATUT_COLORS[t.statut]}18`, border: `1px solid ${STATUT_COLORS[t.statut]}44`, borderRadius: 99, padding: "3px 8px", cursor: "pointer" }}>
              <span style={{ fontSize: 10, color: STATUT_COLORS[t.statut] }}>{STATUT_ICONS[t.statut]}</span>
              <span style={{ fontSize: 10, color: STATUT_COLORS[t.statut], fontWeight: 600 }}>{t.statut}</span>
            </div>
          </div>
        ))}
      </div>
      {blocked.length > 0 && <div style={{ background: "#0d1117", border: "1px solid #F8717133", borderRadius: 20, padding: 18 }}>
        <ST color="#F87171">⊘ Points bloqués</ST>
        {blocked.map(t => (
          <div key={t.id} style={{ padding: "8px 0", borderBottom: "1px solid #1f2937" }}>
            <div style={{ display: "flex", gap: 8 }}><span>{t.project.emoji}</span>
              <div><div style={{ fontSize: 12, color: "#d1d5db" }}>{t.label}</div>{t.need&&<div style={{ fontSize: 11, color: "#FB923C", marginTop: 2 }}>→ {t.need}</div>}</div>
            </div>
          </div>
        ))}
      </div>}
      <ST>Tous les projets</ST>
      {projects.map(p => {
        const prog = projectProgress(p.tasks), next = p.tasks.find(t=>t.statut==="En cours")||p.tasks.find(t=>t.statut==="Todo");
        return <div key={p.id} onClick={() => { setSelId(p.id); setView("project"); }} style={{ background: "#0d1117", border: `1px solid ${p.color}22`, borderRadius: 18, padding: "14px 16px", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Ring value={prog} color={p.color} size={44} stroke={4} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 14 }}>{p.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb" }}>{p.name}</span>
                <Tag color={TAG_COLORS[p.tag]}>{p.tag}</Tag>
              </div>
              {next && <div style={{ fontSize: 11, color: "#6b7280" }}><span style={{ color: STATUT_COLORS[next.statut] }}>{STATUT_ICONS[next.statut]}</span> {next.label}</div>}
            </div>
            <div style={{ fontSize: 16, color: "#374151" }}>›</div>
          </div>
        </div>;
      })}
    </div>}

    {view === "project" && current && <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: `linear-gradient(135deg,${current.color}12,#0d1117)`, border: `1px solid ${current.color}33`, borderRadius: 20, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 28 }}>{current.emoji}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f9fafb", marginTop: 4 }}>{current.name}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{current.description}</div>
          </div>
          <Ring value={projectProgress(current.tasks)} color={current.color} size={54} stroke={5} />
        </div>
      </div>

      {pview === "list" && STATUTS.map(s => {
        const tasks = current.tasks.filter(t => t.statut===s);
        if(!tasks.length)return null;
        const color = STATUT_COLORS[s];
        return <div key={s} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{STATUT_ICONS[s]} {s} ({tasks.length})</div>
          {tasks.map(t => <div key={t.id} style={{ background: "#0d1117", border: `1px solid ${t.today?current.color+"44":"#1f2937"}`, borderRadius: 14, padding: "12px 14px", marginBottom: 6, opacity: s==="Fait"?0.6:1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#d1d5db", textDecoration: s==="Fait"?"line-through":"none" }}>{t.label}</div>
                {t.need && <div style={{ fontSize: 11, color: "#FB923C", marginTop: 4 }}>→ {t.need}</div>}
                <div onClick={() => togToday(current.id, t.id)} style={{ display: "inline-block", marginTop: 6, fontSize: 10, color: t.today?"#6EE7B7":"#374151", background: t.today?"#6EE7B718":"#111827", padding: "2px 8px", borderRadius: 99, cursor: "pointer" }}>⚡ {t.today?"Aujourd'hui":"Pas aujourd'hui"}</div>
              </div>
              <div onClick={() => cycleS(current.id, t.id)} style={{ display: "flex", alignItems: "center", gap: 4, background: `${STATUT_COLORS[t.statut]}18`, border: `1px solid ${STATUT_COLORS[t.statut]}44`, borderRadius: 99, padding: "3px 8px", cursor: "pointer", flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: STATUT_COLORS[t.statut] }}>{STATUT_ICONS[t.statut]}</span>
                <span style={{ fontSize: 10, color: STATUT_COLORS[t.statut], fontWeight: 600 }}>{t.statut}</span>
              </div>
            </div>
          </div>)}
        </div>;
      })}

      {pview === "mindmap" && <div style={{ background: "#0d1117", border: `1px solid ${current.color}33`, borderRadius: 20, overflow: "hidden" }}>
        <svg width="100%" viewBox="0 0 380 260" style={{ display: "block" }}>
          {current.tasks.map((t,i) => {
            const a=(i/current.tasks.length)*2*Math.PI-Math.PI/2, nx=190+100*Math.cos(a), ny=130+100*Math.sin(a), color=STATUT_COLORS[t.statut];
            return <line key={t.id} x1={190} y1={130} x2={nx} y2={ny} stroke={color} strokeWidth={1} strokeOpacity={0.4} strokeDasharray={t.statut==="Bloqué"?"4 3":"none"} />;
          })}
          <circle cx={190} cy={130} r={28} fill="#111827" stroke={current.color} strokeWidth={2} />
          <text x={190} y={124} textAnchor="middle" fontSize={16} fill={current.color}>{current.emoji}</text>
          <text x={190} y={140} textAnchor="middle" fontSize={8} fill={current.color} fontFamily="sans-serif">{projectProgress(current.tasks)}%</text>
          {current.tasks.map((t,i) => {
            const a=(i/current.tasks.length)*2*Math.PI-Math.PI/2, nx=190+100*Math.cos(a), ny=130+100*Math.sin(a), color=STATUT_COLORS[t.statut], words=t.label.split(" ");
            return <g key={t.id} onClick={() => cycleS(current.id, t.id)} style={{ cursor: "pointer" }}>
              <circle cx={nx} cy={ny} r={10} fill="#111827" stroke={color} strokeWidth={1.5} />
              <text x={nx} y={ny+4} textAnchor="middle" fontSize={10} fill={color} fontFamily="sans-serif">{STATUT_ICONS[t.statut]}</text>
              <text x={190+135*Math.cos(a)} y={130+135*Math.sin(a)-4} textAnchor="middle" fontSize={7} fill="#9ca3af" fontFamily="sans-serif">{words.slice(0,2).join(" ")}</text>
              {words.length>2&&<text x={190+135*Math.cos(a)} y={130+135*Math.sin(a)+6} textAnchor="middle" fontSize={7} fill="#9ca3af" fontFamily="sans-serif">{words.slice(2,4).join(" ")}</text>}
            </g>;
          })}
        </svg>
        <div style={{ padding: "0 16px 14px", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {STATUTS.map(s => <div key={s} style={{ display: "flex", gap: 4, alignItems: "center" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUT_COLORS[s] }} /><div style={{ fontSize: 9, color: "#6b7280" }}>{s}</div></div>)}
        </div>
      </div>}
    </div>}
  </div>;
}

// ── WIDGET ───────────────────────────────────────────────────────────────────
function WidgetView({ health, finance, habits, projects, onUpdateHabits, onUpdateFinance }) {
  const [qe, setQe] = useState(null);
  const [cigM, setCigM] = useState("Soir");
  const [detVal, setDetVal] = useState(habits.detente);
  const [depAmt, setDepAmt] = useState("");
  const [depLbl, setDepLbl] = useState("");
  const [saved, setSaved] = useState(false);
  const fs = calcFormScore(health), sc = scoreColor(fs);
  const totalRec = finance.recurring.reduce((a,b)=>a+b.amount,0), dispo = finance.salaire-totalRec;
  const totalSpent = finance.expenses.reduce((a,b)=>a+b.amount,0), bjr = (dispo-totalSpent)/DAYS_LEFT;
  const totalInv = finance.portfolio.reduce((a,s)=>a+s.shares*s.buyPrice,0), totalNow = finance.portfolio.reduce((a,s)=>a+s.shares*s.currentPrice,0);
  const gain = totalNow-totalInv, pos = gain>=0;
  const todayT = projects.flatMap(p=>p.tasks.filter(t=>t.today&&t.statut!=="Fait"));

  function save() {
    if(qe==="cig"){const u={...habits.cigarettes,total:habits.cigarettes.total+1,moments:{...habits.cigarettes.moments,[cigM]:(habits.cigarettes.moments[cigM]||0)+1}};onUpdateHabits({...habits,cigarettes:u});}
    else if(qe==="detente"){onUpdateHabits({...habits,detente:detVal});}
    else if(qe==="depense"&&depAmt){onUpdateFinance({...finance,expenses:[{id:Date.now(),label:depLbl||"Dépense",amount:parseFloat(depAmt),cat:"Autre",icon:"💸",date:`${TODAY_DAY}/05`},...finance.expenses]});}
    setSaved(true); setTimeout(()=>{setSaved(false);setQe(null);},1500);
  }

  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ background: "linear-gradient(135deg,#0d1117,#111827)", border: "1px solid #1f2937", borderRadius: 22, padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#6b7280" }}>Dim 17 mai · Vue rapide</div>
        <div style={{ fontSize: 10, color: "#374151" }}>Flow 🌻</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#0d1117", borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>Forme</div>
          <Ring value={fs} color={sc} size={44} stroke={4} />
          <div style={{ fontSize: 9, color: sc, marginTop: 5, fontWeight: 600 }}>{scoreLabel(fs)}</div>
        </div>
        <div style={{ background: "#0d1117", borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>Budget/j</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: bjr>30?"#FCD34D":"#F87171", lineHeight: 1 }}>{fmt(bjr,0)}</div>
          <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2 }}>€ restants</div>
        </div>
        <div style={{ background: "#0d1117", borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>Invest.</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: pos?"#6EE7B7":"#F87171", lineHeight: 1 }}>{pos?"+":""}{fmt(gain,0)}€</div>
          <div style={{ fontSize: 9, color: pos?"#6EE7B7":"#F87171", marginTop: 2 }}>{pos?"▲":"▼"} {Math.abs(((gain/totalInv)*100).toFixed(1))}%</div>
        </div>
      </div>
      <div style={{ background: "#0d1117", borderRadius: 12, padding: "8px 12px", marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>⚡ {todayT.length} tâche{todayT.length>1?"s":""} aujourd'hui</div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {todayT.slice(0,4).map(t => { const proj=projects.find(p=>p.tasks.some(x=>x.id===t.id)); return <div key={t.id} style={{ flexShrink: 0, background: `${proj?.color||"#6b7280"}15`, border: `1px solid ${proj?.color||"#6b7280"}33`, borderRadius: 8, padding: "5px 8px", fontSize: 9, color: "#d1d5db", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{proj?.emoji} {t.label}</div>; })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ fontSize: 9, color: "#6b7280", alignSelf: "center", flexShrink: 0 }}>Saisie :</div>
        {[{key:"cig",icon:"🚬",label:habits.cigarettes.total.toString(),color:"#F87171"},{key:"detente",icon:"🌿",label:["—","·","··","···"][habits.detente]||"—",color:"#6EE7B7"},{key:"depense",icon:"💸",label:"Dép.",color:"#FCD34D"}].map(btn => (
          <div key={btn.key} onClick={() => setQe(qe===btn.key?null:btn.key)} style={{ flex: 1, background: qe===btn.key?`${btn.color}20`:"#0d1117", border: `1px solid ${qe===btn.key?btn.color:"#1f2937"}`, borderRadius: 10, padding: "7px 6px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 14 }}>{btn.icon}</div>
            <div style={{ fontSize: 9, color: btn.color, marginTop: 2, fontFamily: "'DM Mono',monospace" }}>{btn.label}</div>
          </div>
        ))}
      </div>
    </div>
    {qe && <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 18, padding: 18 }}>
      {saved ? <div style={{ textAlign: "center", color: "#6EE7B7", fontSize: 14, padding: "8px 0" }}>✓ Enregistré !</div> : <>
        {qe==="cig"&&<div>
          <div style={{ fontSize: 12, color: "#F87171", marginBottom: 12, fontWeight: 600 }}>🚬 Ajouter</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {MOMENTS.map(m=><div key={m} onClick={()=>setCigM(m)} style={{ flex:1, minWidth:60, padding:"8px 4px", borderRadius:10, textAlign:"center", cursor:"pointer", background:cigM===m?"#F8717120":"#111827", border:`1px solid ${cigM===m?"#F87171":"transparent"}`, fontSize:11, color:cigM===m?"#F87171":"#6b7280" }}>{m}</div>)}
          </div>
        </div>}
        {qe==="detente"&&<div>
          <div style={{ fontSize: 12, color: "#6EE7B7", marginBottom: 12, fontWeight: 600 }}>🌿 Détente</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[0,1,2,3].map(v=><div key={v} onClick={()=>setDetVal(v)} style={{ flex:1, height:40, borderRadius:10, cursor:"pointer", background:v<=detVal?"#6EE7B7":"#111827", opacity:v<=detVal?0.4+v*0.2:0.3 }} />)}
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "#6EE7B7", marginBottom: 10 }}>{["Aucune","Légère","Modérée","Intense"][detVal]}</div>
        </div>}
        {qe==="depense"&&<div>
          <div style={{ fontSize: 12, color: "#FCD34D", marginBottom: 12, fontWeight: 600 }}>💸 Dépense</div>
          <input placeholder="Libellé" value={depLbl} onChange={e=>setDepLbl(e.target.value)} style={{ width:"100%", background:"#1f2937", border:"none", borderRadius:10, color:"#f9fafb", padding:"10px 12px", fontSize:13, outline:"none", marginBottom:8 }} />
          <input placeholder="Montant €" type="number" value={depAmt} onChange={e=>setDepAmt(e.target.value)} style={{ width:"100%", background:"#1f2937", border:"none", borderRadius:10, color:"#FCD34D", fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:700, padding:"10px 12px", outline:"none", marginBottom:8 }} />
        </div>}
        <div onClick={save} style={{ background:qe==="cig"?"#F87171":qe==="detente"?"#6EE7B7":"#FCD34D", color:"#080b14", borderRadius:12, padding:11, textAlign:"center", fontWeight:700, fontSize:13, cursor:"pointer" }}>Enregistrer</div>
      </>}
    </div>}
  </div>;
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardHome({ health, finance, habits, projects, onNavigate, synced }) {
  const fs = calcFormScore(health), sc = scoreColor(fs);
  const totalRec = finance.recurring.reduce((a,b)=>a+b.amount,0), dispo = finance.salaire-totalRec;
  const totalSpent = finance.expenses.reduce((a,b)=>a+b.amount,0), bjr = (dispo-totalSpent)/DAYS_LEFT;
  const totalNow = finance.portfolio.reduce((a,s)=>a+s.shares*s.currentPrice,0), totalInv = finance.portfolio.reduce((a,s)=>a+s.shares*s.buyPrice,0);
  const gain = totalNow-totalInv, pos = gain>=0;
  const todayT = projects.flatMap(p=>p.tasks.filter(t=>t.today&&t.statut!=="Fait"));
  const blockedC = projects.flatMap(p=>p.tasks.filter(t=>t.statut==="Bloqué")).length;

  return <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>Dimanche 17 mai</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>Bonjour 👋</div>
        {synced && <div style={{ fontSize: 10, color: "#6EE7B7", marginTop: 2 }}>🔗 Garmin synchronisé</div>}
      </div>
      <div onClick={() => onNavigate("widget")} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 14, padding: "8px 12px", cursor: "pointer", textAlign: "center" }}>
        <div style={{ fontSize: 16 }}>⊟</div>
        <div style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>Widget</div>
      </div>
    </div>

    <div onClick={() => onNavigate("health")} style={{ background: `linear-gradient(135deg,${sc}0d,#0d1117)`, border: `1px solid ${sc}33`, borderRadius: 22, padding: 20, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
      <Ring value={fs} color={sc} size={64} stroke={6} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Score de forme</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: sc, marginTop: 2 }}>{scoreLabel(fs)}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
          <Tag color="#A5B4FC">💤 {health.sleep.duration}h</Tag>
          <Tag color="#6EE7B7">⚡ BB {health.bodyBattery}</Tag>
          <Tag color="#F87171">❤️ {health.restingHR}bpm</Tag>
        </div>
      </div>
      <div style={{ fontSize: 16, color: "#374151" }}>›</div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <div onClick={() => onNavigate("finance")} style={{ background: "#0d1117", border: "1px solid #FCD34D22", borderRadius: 18, padding: 16, cursor: "pointer" }}>
        <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 8 }}>💰 Budget/jour</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: bjr>30?"#FCD34D":"#F87171", lineHeight: 1 }}>{fmt(bjr,0)}<span style={{ fontSize: 14, color: "#4b5563" }}>€</span></div>
        <div style={{ fontSize: 10, color: "#4b5563", marginTop: 4 }}>{DAYS_LEFT} jours restants</div>
      </div>
      <div onClick={() => onNavigate("finance")} style={{ background: "#0d1117", border: `1px solid ${pos?"#6EE7B7":"#F87171"}22`, borderRadius: 18, padding: 16, cursor: "pointer" }}>
        <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 8 }}>📈 Portefeuille</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#f9fafb", lineHeight: 1 }}>{fmt(totalNow,0)}<span style={{ fontSize: 12, color: "#4b5563" }}>€</span></div>
        <div style={{ fontSize: 11, color: pos?"#6EE7B7":"#F87171", marginTop: 4, fontFamily: "'DM Mono',monospace" }}>{pos?"+":""}{fmt(gain,0)}€</div>
      </div>
    </div>

    <div onClick={() => onNavigate("projects")} style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 18, cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <ST>⚡ Focus du jour</ST>
        <div style={{ display: "flex", gap: 8 }}>
          <Tag color="#6EE7B7">{todayT.length} tâches</Tag>
          {blockedC > 0 && <Tag color="#F87171">{blockedC} bloqués</Tag>}
        </div>
      </div>
      {todayT.slice(0,3).map(t => {
        const proj = projects.find(p=>p.tasks.some(x=>x.id===t.id));
        return <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #111827" }}>
          <div style={{ width: 3, height: 28, borderRadius: 99, background: proj?.color||"#6b7280", flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12, color: "#d1d5db" }}>{t.label}</div>
          <Tag color={STATUT_COLORS[t.statut]}>{t.statut}</Tag>
        </div>;
      })}
      {todayT.length > 3 && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 8, textAlign: "center" }}>+{todayT.length-3} autres</div>}
    </div>

    <div onClick={() => onNavigate("health")} style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 16, cursor: "pointer" }}>
      <ST>Habitudes du jour</ST>
      <div style={{ display: "flex", gap: 10, justifyContent: "space-around" }}>
        {[{icon:"🚬",value:habits.cigarettes.total,label:"cigarettes",color:habits.cigarettes.total>8?"#F87171":"#FB923C",type:"num"},
          {icon:"🌿",value:"●".repeat(habits.detente)+"○".repeat(3-habits.detente),label:["—","Légère","Modérée","Intense"][habits.detente],color:"#6EE7B7",type:"str"},
          {icon:habits.sport?"✅":"⬜",value:habits.sport?"Actif":"Repos",label:"activité",color:habits.sport?"#6EE7B7":"#4b5563",type:"str"},
          {icon:"🛏️",value:health.sleep.bedtime,label:"coucher",color:"#A5B4FC",type:"mono"}].map((s,i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: s.type==="mono"?13:s.type==="num"?18:11, fontWeight: 700, fontFamily: s.type==="mono"?"'DM Mono',monospace":s.type==="num"?"'Syne',sans-serif":"inherit", color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "#4b5563" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>

    <ST>Projets</ST>
    {projects.map(p => {
      const prog = projectProgress(p.tasks);
      return <div key={p.id} onClick={() => onNavigate("projects")} style={{ background: "#0d1117", border: `1px solid ${p.color}22`, borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <div style={{ fontSize: 20 }}>{p.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>{p.name}</div>
            <Tag color={TAG_COLORS[p.tag]}>{p.tag}</Tag>
          </div>
          <div style={{ background: "#1a1a2e", borderRadius: 99, height: 4, overflow: "hidden" }}>
            <div style={{ width: `${prog}%`, height: "100%", background: p.color, borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: p.color }}>{prog}%</div>
      </div>;
    })}
  </div>;
}

// ── LECTURE DONNÉES GARMIN VIA URL ────────────────────────────────────────────
function readGarminData() {
  const params = new URLSearchParams(window.location.search);
  const data = {};
  if (params.get("hr")) data.restingHR = Math.round(parseFloat(params.get("hr")));
  if (params.get("hrv")) data.hrv = Math.round(parseFloat(params.get("hrv")));
  if (params.get("steps")) data.steps = Math.round(parseFloat(params.get("steps")));
  if (params.get("spo2")) data.spo2 = Math.round(parseFloat(params.get("spo2")));
  if (params.get("sleep")) data.sleep = { ...INIT.health.sleep, duration: Math.round(parseFloat(params.get("sleep")) * 10) / 10 };
  if (params.get("bb")) data.bodyBattery = Math.round(parseFloat(params.get("bb")));
  if (params.get("stress")) data.stress = Math.round(parseFloat(params.get("stress")));
  if (params.get("calories")) data.calories = Math.round(parseFloat(params.get("calories")));
  if (params.get("bedtime")) data.sleep = { ...(data.sleep || INIT.health.sleep), bedtime: params.get("bedtime") };
  if (params.get("wake")) data.sleep = { ...(data.sleep || INIT.health.sleep), wake: params.get("wake") };
  return Object.keys(data).length > 0 ? { ...INIT.health, ...data } : null;
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const garminData = readGarminData();
  const [health, setHealth] = useState(garminData || INIT.health);
  const [synced] = useState(!!garminData);
  const [habits, setHabits] = useState(INIT.habits);
  const [finance, setFinance] = useState(INIT.finance);
  const [projects, setProjects] = useState(INIT.projects);

  const NAV = [
    { id: "widget", icon: "⊟", label: "Widget" },
    { id: "projects", icon: "⚙️", label: "Projets" },
    { id: "dashboard", icon: "🏠", label: "Home" },
    { id: "finance", icon: "📈", label: "Finances" },
    { id: "health", icon: "🫀", label: "Santé" },
  ];
  const navC = { health: "#6EE7B7", finance: "#FCD34D", projects: "#A5B4FC", widget: "#f9fafb", dashboard: "#f9fafb" };

  return <div style={{ minHeight: "100vh", background: "#080b14", color: "#f9fafb", fontFamily: "'DM Sans',sans-serif", maxWidth: 420, margin: "0 auto", padding: "24px 16px 100px" }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      input::placeholder { color: #374151; }
      select option { background: #1f2937; }
    `}</style>

    {screen !== "dashboard" && <div style={{ marginBottom: 20 }}>
      <div onClick={() => setScreen("dashboard")} style={{ fontSize: 11, color: "#6b7280", cursor: "pointer", marginBottom: 6 }}>← Dashboard</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>
        {screen==="health"?"🫀 Santé":screen==="finance"?"📈 Finances":screen==="projects"?"⚙️ Projets":"⊟ Widget"}
      </div>
    </div>}

    {screen === "dashboard" && <DashboardHome health={health} finance={finance} habits={habits} projects={projects} onNavigate={setScreen} synced={synced} />}
    {screen === "health" && <HealthModule health={health} habits={habits} onUpdateHabits={setHabits} />}
    {screen === "finance" && <FinanceModule finance={finance} onUpdate={setFinance} />}
    {screen === "projects" && <ProjectsModule projects={projects} onUpdate={setProjects} />}
    {screen === "widget" && <WidgetView health={health} finance={finance} habits={habits} projects={projects} onUpdateHabits={setHabits} onUpdateFinance={setFinance} />}

    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: "#0d1117f0", backdropFilter: "blur(20px)", borderTop: "1px solid #1f2937", display: "flex", justifyContent: "space-around", padding: "10px 0 20px" }}>
      {NAV.map(nav => <div key={nav.id} onClick={() => setScreen(nav.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", opacity: screen===nav.id?1:0.35, transition: "opacity 0.2s ease" }}>
        <div style={{ fontSize: 20, filter: screen===nav.id?`drop-shadow(0 0 6px ${navC[nav.id]})`:""}}>{nav.icon}</div>
        <div style={{ fontSize: 8, color: "#9ca3af" }}>{nav.label}</div>
      </div>)}
    </div>
  </div>;
}
