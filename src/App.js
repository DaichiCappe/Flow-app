import { useState, useEffect } from "react";

// ─── DONNÉES GLOBALES ─────────────────────────────────────────────────────────
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
  health: { bodyBattery: 74, hrv: 52, restingHR: 48, spo2: 97, stress: 28, sleep: { quality: 78, duration: 7.2 } },
  finance: {
    salaire: 3200, soldeCompte: 1840,
    recurring: [
      { id: 1, label: "Loyer", amount: 850 }, { id: 2, label: "Électricité", amount: 65 },
      { id: 3, label: "Internet", amount: 30 }, { id: 4, label: "Abonnements", amount: 45 },
    ],
    expenses: [
      { id: 1, label: "Courses", amount: 67.50, cat: "Alimentation", date: "17/05" },
      { id: 2, label: "Restaurant", amount: 24.00, cat: "Sorties", date: "16/05" },
      { id: 3, label: "Essence", amount: 55.00, cat: "Transport", date: "15/05" },
    ],
    portfolio: [
      { id: 1, ticker: "AAPL", name: "Apple", shares: 5, buyPrice: 165.20, currentPrice: 189.30 },
      { id: 2, ticker: "MSCI World", name: "ETF MSCI World", shares: 12, buyPrice: 78.40, currentPrice: 84.10 },
      { id: 3, ticker: "NVDA", name: "Nvidia", shares: 3, buyPrice: 420.00, currentPrice: 875.40 },
    ],
  },
  habits: {
    cigarettes: { total: 6, moments: { Matin: 1, Midi: 1, "Après-midi": 2, Soir: 2, Nuit: 0 } },
    detente: 1, sport: true, stress: 3, mood: 4,
    sleep: { bedtime: "23:20", wake: "06:35" },
  },
  projects: [
    { id: 1, name: "Lancement produit", tag: "Pro", color: "#FCD34D", emoji: "🚀",
      tasks: [
        { id: 101, label: "Créer la landing page", statut: "En cours", need: "Accès Figma", today: true },
        { id: 102, label: "Deck investisseurs", statut: "Todo", need: "", today: true },
        { id: 103, label: "Campagne email", statut: "Bloqué", need: "Validation direction", today: false },
      ]},
    { id: 2, name: "Rénovation appart", tag: "Perso", color: "#A5B4FC", emoji: "🏠",
      tasks: [
        { id: 201, label: "Choisir carrelage", statut: "En cours", need: "", today: true },
        { id: 202, label: "Contacter plombier", statut: "Todo", need: "Contact voisins", today: false },
      ]},
    { id: 3, name: "Course trail 50km", tag: "Perso", color: "#FB923C", emoji: "🏔️",
      tasks: [
        { id: 301, label: "Sortie longue weekend", statut: "Todo", need: "", today: true },
        { id: 302, label: "Inscription course", statut: "Bloqué", need: "Ouverture 1er juin", today: false },
      ]},
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(n, d = 0) { return n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }); }
function calcFormScore(h) {
  return Math.round((h.bodyBattery/100)*30 + Math.min(h.hrv/70,1)*25 + (h.sleep.quality/100)*25 + (1-h.stress/100)*20);
}
function scoreColor(s) { return s >= 80 ? "#6EE7B7" : s >= 60 ? "#FCD34D" : s >= 40 ? "#FB923C" : "#F87171"; }
function scoreLabel(s) { return s >= 80 ? "Excellente" : s >= 60 ? "Bonne forme" : s >= 40 ? "Correcte" : "Repos"; }
function projectProgress(tasks) {
  if (!tasks.length) return 0;
  return Math.round(tasks.filter(t => t.statut === "Fait").length / tasks.length * 100);
}

// ─── MINI COMPOSANTS ─────────────────────────────────────────────────────────
function Tag({ color, children }) {
  return <span style={{ fontSize: 9, color, background: `${color}20`, padding: "2px 7px", borderRadius: 99, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>{children}</span>;
}
function Ring({ value, color, size = 48, stroke = 5 }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${(value/100)*circ} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}66)`, transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>{value}%</span>
      </div>
    </div>
  );
}

// ─── WIDGET VIEW ──────────────────────────────────────────────────────────────
function WidgetView({ health, finance, habits, projects, onUpdate }) {
  const [quickEntry, setQuickEntry] = useState(null); // null | 'cig' | 'detente' | 'depense'
  const [cigMoment, setCigMoment] = useState("Soir");
  const [detenteVal, setDetenteVal] = useState(habits.detente);
  const [depenseAmt, setDepenseAmt] = useState("");
  const [depenseLbl, setDepenseLbl] = useState("");
  const [saved, setSaved] = useState(false);

  const formScore = calcFormScore(health);
  const sc = scoreColor(formScore);
  const totalRecurring = finance.recurring.reduce((a, b) => a + b.amount, 0);
  const disponible = finance.salaire - totalRecurring;
  const totalSpent = finance.expenses.reduce((a, b) => a + b.amount, 0);
  const budgetJourRestant = (disponible - totalSpent) / DAYS_LEFT;
  const totalInvested = finance.portfolio.reduce((a, s) => a + s.shares * s.buyPrice, 0);
  const totalNow = finance.portfolio.reduce((a, s) => a + s.shares * s.currentPrice, 0);
  const portfolioGain = totalNow - totalInvested;
  const portfolioPct = ((portfolioGain / totalInvested) * 100).toFixed(1);
  const isPositive = portfolioGain >= 0;
  const todayTasks = projects.flatMap(p => p.tasks.filter(t => t.today && t.statut !== "Fait"));

  function handleSave() {
    if (quickEntry === "cig") {
      const updated = { ...habits.cigarettes, total: habits.cigarettes.total + 1, moments: { ...habits.cigarettes.moments, [cigMoment]: (habits.cigarettes.moments[cigMoment] || 0) + 1 } };
      onUpdate("habits", { ...habits, cigarettes: updated });
    } else if (quickEntry === "detente") {
      onUpdate("habits", { ...habits, detente: detenteVal });
    } else if (quickEntry === "depense" && depenseAmt) {
      const newExp = { id: Date.now(), label: depenseLbl || "Dépense", amount: parseFloat(depenseAmt), cat: "Autre", date: `${TODAY_DAY}/05` };
      onUpdate("finance", { ...finance, expenses: [newExp, ...finance.expenses] });
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setQuickEntry(null); }, 1500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Widget 4x2 */}
      <div style={{
        background: "linear-gradient(135deg, #0d1117, #111827)",
        border: "1px solid #1f2937", borderRadius: 22,
        padding: "16px 18px", position: "relative", overflow: "hidden"
      }}>
        {/* Glow bg */}
        <div style={{ position: "absolute", top: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: `${sc}08`, filter: "blur(30px)" }} />
        <div style={{ position: "absolute", bottom: -20, right: 0, width: 80, height: 80, borderRadius: "50%", background: "#FCD34D06", filter: "blur(20px)" }} />

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#6b7280" }}>Dim 17 mai · Vue rapide</div>
          <div style={{ fontSize: 10, color: "#374151" }}>MyLife</div>
        </div>

        {/* 3 métriques principales */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>

          {/* Forme */}
          <div style={{ background: "#0d1117", borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>Forme</div>
            <Ring value={formScore} color={sc} size={44} stroke={4} />
            <div style={{ fontSize: 9, color: sc, marginTop: 5, fontWeight: 600 }}>{scoreLabel(formScore)}</div>
          </div>

          {/* Budget */}
          <div style={{ background: "#0d1117", borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>Budget/jour</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: budgetJourRestant > 30 ? "#FCD34D" : "#F87171", lineHeight: 1 }}>
              {fmt(budgetJourRestant, 0)}
            </div>
            <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2 }}>€ restants</div>
            <div style={{ fontSize: 9, color: "#374151", marginTop: 4 }}>{DAYS_LEFT}j restants</div>
          </div>

          {/* Invest */}
          <div style={{ background: "#0d1117", borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>Invest.</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: isPositive ? "#6EE7B7" : "#F87171", lineHeight: 1 }}>
              {isPositive ? "+" : ""}{fmt(portfolioGain, 0)}€
            </div>
            <div style={{ fontSize: 9, color: isPositive ? "#6EE7B7" : "#F87171", marginTop: 2 }}>{isPositive ? "▲" : "▼"} {Math.abs(portfolioPct)}%</div>
            <div style={{ fontSize: 8, color: "#374151", marginTop: 4 }}>{fmt(totalNow, 0)}€ total</div>
          </div>
        </div>

        {/* Tâches du jour — bande */}
        <div style={{ background: "#0d1117", borderRadius: 12, padding: "8px 12px" }}>
          <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 6 }}>⚡ Aujourd'hui · {todayTasks.length} tâche{todayTasks.length > 1 ? "s" : ""}</div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            {todayTasks.slice(0, 4).map(t => {
              const proj = projects.find(p => p.tasks.some(x => x.id === t.id));
              return (
                <div key={t.id} style={{
                  flexShrink: 0, background: `${proj?.color || "#6b7280"}15`,
                  border: `1px solid ${proj?.color || "#6b7280"}33`,
                  borderRadius: 8, padding: "5px 8px", fontSize: 9, color: "#d1d5db",
                  maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>
                  {proj?.emoji} {t.label}
                </div>
              );
            })}
            {todayTasks.length > 4 && <div style={{ flexShrink: 0, fontSize: 9, color: "#4b5563", alignSelf: "center" }}>+{todayTasks.length - 4}</div>}
          </div>
        </div>

        {/* Saisie rapide — habitudes */}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <div style={{ fontSize: 9, color: "#6b7280", alignSelf: "center", flexShrink: 0 }}>Saisie rapide :</div>
          {[
            { key: "cig", icon: "🚬", label: `${habits.cigarettes.total}`, color: "#F87171" },
            { key: "detente", icon: "🌿", label: ["—","·","··","···"][habits.detente] || "—", color: "#6EE7B7" },
            { key: "depense", icon: "💸", label: "Dép.", color: "#FCD34D" },
          ].map(btn => (
            <div key={btn.key} onClick={() => setQuickEntry(quickEntry === btn.key ? null : btn.key)} style={{
              flex: 1, background: quickEntry === btn.key ? `${btn.color}20` : "#0d1117",
              border: `1px solid ${quickEntry === btn.key ? btn.color : "#1f2937"}`,
              borderRadius: 10, padding: "7px 6px", textAlign: "center", cursor: "pointer",
              transition: "all 0.2s ease"
            }}>
              <div style={{ fontSize: 14 }}>{btn.icon}</div>
              <div style={{ fontSize: 9, color: btn.color, marginTop: 2, fontFamily: "'DM Mono',monospace" }}>{btn.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel saisie rapide */}
      {quickEntry && (
        <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 18, padding: 18, animation: "fadeUp 0.25s ease" }}>
          {saved ? (
            <div style={{ textAlign: "center", color: "#6EE7B7", fontSize: 14, padding: "8px 0" }}>✓ Enregistré !</div>
          ) : (
            <>
              {quickEntry === "cig" && (
                <div>
                  <div style={{ fontSize: 12, color: "#F87171", marginBottom: 12, fontWeight: 600 }}>🚬 Ajouter une cigarette</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                    {MOMENTS.map(m => (
                      <div key={m} onClick={() => setCigMoment(m)} style={{
                        flex: 1, minWidth: 60, padding: "8px 4px", borderRadius: 10, textAlign: "center", cursor: "pointer",
                        background: cigMoment === m ? "#F8717120" : "#111827",
                        border: `1px solid ${cigMoment === m ? "#F87171" : "transparent"}`,
                        fontSize: 11, color: cigMoment === m ? "#F87171" : "#6b7280"
                      }}>{m}</div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", marginBottom: 10 }}>
                    Total aujourd'hui : <span style={{ color: "#F87171", fontWeight: 700 }}>{habits.cigarettes.total + 1}</span>
                  </div>
                </div>
              )}

              {quickEntry === "detente" && (
                <div>
                  <div style={{ fontSize: 12, color: "#6EE7B7", marginBottom: 12, fontWeight: 600 }}>🌿 Détente</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {[0,1,2,3].map(v => (
                      <div key={v} onClick={() => setDetenteVal(v)} style={{
                        flex: 1, height: 40, borderRadius: 10, cursor: "pointer",
                        background: v <= detenteVal ? "#6EE7B7" : "#111827",
                        opacity: v <= detenteVal ? 0.4 + v * 0.2 : 0.3,
                        border: v === detenteVal ? "1px solid #6EE7B788" : "1px solid transparent",
                        transition: "all 0.2s ease"
                      }} />
                    ))}
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12, color: "#6EE7B7", marginBottom: 10 }}>
                    {["Aucune","Légère","Modérée","Intense"][detenteVal]}
                  </div>
                </div>
              )}

              {quickEntry === "depense" && (
                <div>
                  <div style={{ fontSize: 12, color: "#FCD34D", marginBottom: 12, fontWeight: 600 }}>💸 Ajouter une dépense</div>
                  <input placeholder="Libellé (ex: Café)" value={depenseLbl}
                    onChange={e => setDepenseLbl(e.target.value)}
                    style={{ width: "100%", background: "#1f2937", border: "none", borderRadius: 10, color: "#f9fafb", padding: "10px 12px", fontSize: 13, outline: "none", marginBottom: 8 }} />
                  <input placeholder="Montant €" type="number" value={depenseAmt}
                    onChange={e => setDepenseAmt(e.target.value)}
                    style={{ width: "100%", background: "#1f2937", border: "none", borderRadius: 10, color: "#FCD34D", fontFamily: "'DM Mono',monospace", fontSize: 16, fontWeight: 700, padding: "10px 12px", outline: "none", marginBottom: 10 }} />
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Budget restant après : <span style={{ color: depenseAmt ? (budgetJourRestant - parseFloat(depenseAmt)/DAYS_LEFT > 0 ? "#6EE7B7" : "#F87171") : "#4b5563", fontWeight: 700 }}>
                      {depenseAmt ? fmt(budgetJourRestant - parseFloat(depenseAmt)/DAYS_LEFT, 2) : "—"}€/j
                    </span>
                  </div>
                </div>
              )}

              <div onClick={handleSave} style={{
                marginTop: 12, background: quickEntry === "cig" ? "#F87171" : quickEntry === "detente" ? "#6EE7B7" : "#FCD34D",
                color: "#080b14", borderRadius: 12, padding: "11px",
                textAlign: "center", fontWeight: 700, fontSize: 13, cursor: "pointer"
              }}>Enregistrer</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────────
function DashboardHome({ health, finance, habits, projects, onNavigate }) {
  const formScore = calcFormScore(health);
  const sc = scoreColor(formScore);
  const totalRecurring = finance.recurring.reduce((a, b) => a + b.amount, 0);
  const disponible = finance.salaire - totalRecurring;
  const totalSpent = finance.expenses.reduce((a, b) => a + b.amount, 0);
  const budgetJourRestant = (disponible - totalSpent) / DAYS_LEFT;
  const totalNow = finance.portfolio.reduce((a, s) => a + s.shares * s.currentPrice, 0);
  const totalInvested = finance.portfolio.reduce((a, s) => a + s.shares * s.buyPrice, 0);
  const portfolioGain = totalNow - totalInvested;
  const isPositive = portfolioGain >= 0;
  const todayTasks = projects.flatMap(p => p.tasks.filter(t => t.today && t.statut !== "Fait"));
  const blockedCount = projects.flatMap(p => p.tasks.filter(t => t.statut === "Bloqué")).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Greeting */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Dimanche 17 mai</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Bonjour 👋
          </div>
        </div>
        <div onClick={() => onNavigate("widget")} style={{
          background: "#1f2937", border: "1px solid #374151", borderRadius: 14,
          padding: "8px 12px", cursor: "pointer", textAlign: "center"
        }}>
          <div style={{ fontSize: 16 }}>⊟</div>
          <div style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>Widget</div>
        </div>
      </div>

      {/* Score de vie global */}
      <div style={{
        background: `linear-gradient(135deg, ${sc}0d, #0d1117)`,
        border: `1px solid ${sc}33`, borderRadius: 22, padding: 20,
        display: "flex", alignItems: "center", gap: 16, cursor: "pointer"
      }} onClick={() => onNavigate("health")}>
        <Ring value={formScore} color={sc} size={64} stroke={6} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>Score de forme</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: sc, marginTop: 2 }}>{scoreLabel(formScore)}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <Tag color="#A5B4FC">💤 {health.sleep.duration}h</Tag>
            <Tag color="#6EE7B7">⚡ BB {health.bodyBattery}</Tag>
            <Tag color="#F87171">❤️ {health.restingHR}bpm</Tag>
          </div>
        </div>
        <div style={{ fontSize: 16, color: "#374151" }}>›</div>
      </div>

      {/* Budget + Invest */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div onClick={() => onNavigate("finance")} style={{
          background: "#0d1117", border: "1px solid #FCD34D22", borderRadius: 18, padding: 16, cursor: "pointer"
        }}>
          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 8 }}>💰 Budget/jour</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: budgetJourRestant > 30 ? "#FCD34D" : "#F87171", lineHeight: 1 }}>
            {fmt(budgetJourRestant, 0)}<span style={{ fontSize: 14, color: "#4b5563" }}>€</span>
          </div>
          <div style={{ fontSize: 10, color: "#4b5563", marginTop: 4 }}>{DAYS_LEFT} jours restants</div>
        </div>
        <div onClick={() => onNavigate("finance")} style={{
          background: "#0d1117", border: `1px solid ${isPositive ? "#6EE7B7" : "#F87171"}22`, borderRadius: 18, padding: 16, cursor: "pointer"
        }}>
          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 8 }}>📈 Portefeuille</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#f9fafb", lineHeight: 1 }}>
            {fmt(totalNow, 0)}<span style={{ fontSize: 12, color: "#4b5563" }}>€</span>
          </div>
          <div style={{ fontSize: 11, color: isPositive ? "#6EE7B7" : "#F87171", marginTop: 4, fontFamily: "'DM Mono',monospace" }}>
            {isPositive ? "+" : ""}{fmt(portfolioGain, 0)}€
          </div>
        </div>
      </div>

      {/* Projets + tâches */}
      <div onClick={() => onNavigate("projects")} style={{
        background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 18, cursor: "pointer"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>⚡ Focus du jour</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Tag color="#6EE7B7">{todayTasks.length} tâches</Tag>
            {blockedCount > 0 && <Tag color="#F87171">{blockedCount} bloqués</Tag>}
          </div>
        </div>
        {todayTasks.slice(0, 3).map(t => {
          const proj = projects.find(p => p.tasks.some(x => x.id === t.id));
          return (
            <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #111827" }}>
              <div style={{ width: 3, height: 28, borderRadius: 99, background: proj?.color || "#6b7280", flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12, color: "#d1d5db" }}>{t.label}</div>
              <Tag color={STATUT_COLORS[t.statut]}>{t.statut}</Tag>
            </div>
          );
        })}
        {todayTasks.length > 3 && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 8, textAlign: "center" }}>+{todayTasks.length - 3} autres tâches</div>}
      </div>

      {/* Habitudes du jour */}
      <div onClick={() => onNavigate("health")} style={{
        background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 16, cursor: "pointer"
      }}>
        <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Habitudes du jour</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>🚬</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 18, fontWeight: 700, color: habits.cigarettes.total > 8 ? "#F87171" : "#FB923C", marginTop: 4 }}>{habits.cigarettes.total}</div>
            <div style={{ fontSize: 9, color: "#4b5563" }}>cigarettes</div>
          </div>
          <div style={{ width: 1, background: "#1f2937" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>🌿</div>
            <div style={{ fontSize: 14, color: "#6EE7B7", marginTop: 4 }}>{"●".repeat(habits.detente) + "○".repeat(3 - habits.detente)}</div>
            <div style={{ fontSize: 9, color: "#4b5563" }}>{["—","Légère","Modérée","Intense"][habits.detente]}</div>
          </div>
          <div style={{ width: 1, background: "#1f2937" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>{habits.sport ? "✅" : "⬜"}</div>
            <div style={{ fontSize: 11, color: habits.sport ? "#6EE7B7" : "#4b5563", marginTop: 4, fontWeight: 600 }}>{habits.sport ? "Actif" : "Repos"}</div>
            <div style={{ fontSize: 9, color: "#4b5563" }}>activité</div>
          </div>
          <div style={{ width: 1, background: "#1f2937" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>🛏️</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "#A5B4FC", marginTop: 4 }}>{habits.sleep.bedtime}</div>
            <div style={{ fontSize: 9, color: "#4b5563" }}>coucher</div>
          </div>
        </div>
      </div>

      {/* Projets mini */}
      <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>Projets</div>
      {projects.map(p => {
        const prog = projectProgress(p.tasks);
        return (
          <div key={p.id} onClick={() => onNavigate("projects")} style={{
            background: "#0d1117", border: `1px solid ${p.color}22`, borderRadius: 16,
            padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer"
          }}>
            <div style={{ fontSize: 20 }}>{p.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>{p.name}</div>
                <Tag color={TAG_COLORS[p.tag]}>{p.tag}</Tag>
              </div>
              <div style={{ background: "#1a1a2e", borderRadius: 99, height: 4, overflow: "hidden" }}>
                <div style={{ width: `${prog}%`, height: "100%", background: p.color, borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: p.color }}>{prog}%</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────
export default function MyLifeApp() {
  const [screen, setScreen] = useState("dashboard"); // dashboard | health | finance | projects | widget
  const [health] = useState(INIT.health);
  const [finance, setFinance] = useState(INIT.finance);
  const [habits, setHabits] = useState(INIT.habits);
  const [projects] = useState(INIT.projects);

  function handleUpdate(module, data) {
    if (module === "habits") setHabits(data);
    if (module === "finance") setFinance(data);
  }

  const NAV = [
    { id: "widget", icon: "⊟", label: "Widget" },
    { id: "projects", icon: "⚙️", label: "Projets" },
    { id: "dashboard", icon: "🏠", label: "Home" },
    { id: "finance", icon: "📈", label: "Finances" },
    { id: "health", icon: "🫀", label: "Santé" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#080b14", color: "#f9fafb",
      fontFamily: "'DM Sans',sans-serif", maxWidth: 420,
      margin: "0 auto", padding: "24px 16px 100px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: #374151; }
      `}</style>

      {/* Contenu selon screen */}
      {screen === "dashboard" && (
        <DashboardHome health={health} finance={finance} habits={habits} projects={projects} onNavigate={setScreen} />
      )}

      {screen === "widget" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.12em" }}>Vue rapide</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 4 }}>Widget</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Format 4×2 · Saisie en un tap</div>
          </div>
          <WidgetView health={health} finance={finance} habits={habits} projects={projects} onUpdate={handleUpdate} />
        </div>
      )}

      {screen === "health" && (
        <div>
          <div onClick={() => setScreen("dashboard")} style={{ fontSize: 11, color: "#6b7280", cursor: "pointer", marginBottom: 8 }}>← Dashboard</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 20 }}>🫀 Santé</div>
          <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 40, textAlign: "center", color: "#4b5563" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>◉</div>
            <div style={{ fontSize: 13 }}>Module Santé complet disponible</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>(intégration en cours)</div>
          </div>
        </div>
      )}

      {screen === "finance" && (
        <div>
          <div onClick={() => setScreen("dashboard")} style={{ fontSize: 11, color: "#6b7280", cursor: "pointer", marginBottom: 8 }}>← Dashboard</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 20 }}>📈 Finances</div>
          <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 40, textAlign: "center", color: "#4b5563" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>◈</div>
            <div style={{ fontSize: 13 }}>Module Finances complet disponible</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>(intégration en cours)</div>
          </div>
        </div>
      )}

      {screen === "projects" && (
        <div>
          <div onClick={() => setScreen("dashboard")} style={{ fontSize: 11, color: "#6b7280", cursor: "pointer", marginBottom: 8 }}>← Dashboard</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 20 }}>⚙️ Projets</div>
          <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 20, padding: 40, textAlign: "center", color: "#4b5563" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>◎</div>
            <div style={{ fontSize: 13 }}>Module Projets complet disponible</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>(intégration en cours)</div>
          </div>
        </div>
      )}

      {/* Nav bar */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 420,
        background: "#0d1117f0", backdropFilter: "blur(20px)",
        borderTop: "1px solid #1f2937",
        display: "flex", justifyContent: "space-around", padding: "10px 0 20px"
      }}>
        {NAV.map(nav => (
          <div key={nav.id} onClick={() => setScreen(nav.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            cursor: "pointer",
            opacity: screen === nav.id ? 1 : 0.35,
            transition: "opacity 0.2s ease"
          }}>
            <div style={{
              fontSize: 20,
              filter: screen === nav.id ? `drop-shadow(0 0 6px ${nav.id === "health" ? "#6EE7B7" : nav.id === "finance" ? "#FCD34D" : nav.id === "projects" ? "#A5B4FC" : "#f9fafb"})` : "none"
            }}>{nav.icon}</div>
            <div style={{ fontSize: 8, color: "#9ca3af" }}>{nav.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
