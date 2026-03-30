import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ── Constants ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Housing", color: "#f59e0b", icon: "🏠" },
  { name: "Food & Dining", color: "#f97316", icon: "🍽️" },
  { name: "Transport", color: "#38bdf8", icon: "🚗" },
  { name: "Healthcare", color: "#4ade80", icon: "💊" },
  { name: "Entertainment", color: "#fb7185", icon: "🎬" },
  { name: "Shopping", color: "#a78bfa", icon: "🛍️" },
  { name: "Utilities", color: "#a3e635", icon: "⚡" },
  { name: "Savings", color: "#34d399", icon: "💰" },
  { name: "Debt Payment", color: "#60a5fa", icon: "📉" },
  { name: "Income", color: "#22d3ee", icon: "💵" },
  { name: "Other", color: "#94a3b8", icon: "📦" },
];

const DEFAULT_BUDGETS = {
  Housing: 1500, "Food & Dining": 600, Transport: 300,
  Healthcare: 200, Entertainment: 150, Shopping: 250,
  Utilities: 200, Savings: 500, "Debt Payment": 400, Other: 200,
};

const DAD_JOKES = [
  "You're on a roll! A BREAD roll, not a payroll - but we're getting there! 🥁",
  "Nice entry! You really CENTS-ed an opportunity to be responsible!",
  "Logged! Your wallet called - it said you're its best INTEREST! 🥁",
  "Ba-dum-BUDGET! Another entry in the books. Literally.",
  "I tried to save money once. Best INVEST-ment of my time! 🥁",
  "Entry recorded! You're really making CENTS of your finances!",
  "Another one bites the DUST... fund. Classic.",
  "You're really ACCOUNTING for yourself today! 🥁",
  "Faster than compound interest on a Tuesday! Nice.",
  "Money tracked! I would make a finance pun but I don't want to BANK on it. 🥁",
  "So responsible! I'm almost a-LOAN in my admiration.",
  "That's what I call taking STOCK of the situation! 🥁",
  "You did it! Don't worry, I won't make this a CAPITAL offense.",
  "Entry saved! You're liquid-ly amazing. 🥁",
  "Another penny tracked! You're un-BALANCE-ably great.",
];

const REWARD_SETS = [
  ["Cook a fancy dinner at home", "Movie night with snacks you already have", "Free museum or park day", "Board game tournament night"],
  ["Rent a movie and make homemade pizza", "Free local concert or community event", "Picnic in the park", "DIY spa night at home"],
  ["Scenic drive together", "Visit a farmers market", "Stargazing with blankets", "Cook a brand new recipe together"],
  ["Library book swap and hot cocoa", "Free hiking trail nearby", "Card games and favorite snacks", "Watch old home videos together"],
];

const MILESTONE_JOKES = [
  "You hit a milestone! I'd say you're on FIRE but that'd cost extra in utilities! 🥁",
  "GOAL ACHIEVED! You're so good at saving, banks are starting to feel insecure!",
  "Milestone unlocked! You're basically a CENT-imental favorite! 🥁",
  "WOW! You crushed that goal! Money DOES grow on trees if you plant savings!",
  "Achievement unlocked! You're not just saving money - you're saving hearts!",
  "You smashed it! That milestone never saw you COMIN'! 🥁",
];

const ICONS = ["🎯","🏖️","🚗","💍","🏠","✈️","🎓","💻","🛋️","🐾","🎸","⚽","🎂","🌿","🎻","🏕️"];
const EXPENSE_CATS = CATEGORIES.filter(c => c.name !== "Income");
const INCOME_CATS = CATEGORIES.filter(c => ["Income","Other"].includes(c.name));

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n ?? 0);
const calcPct = (a, b) => b > 0 ? Math.min(Math.round((a / b) * 100), 100) : 0;
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Shared styles ──────────────────────────────────────────────────────────
const CARD = { background: "#111827", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 22 };
const CARD_TITLE = { fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: "#e2d9f3", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" };
const PBAR = { height: 5, background: "rgba(255,255,255,.06)", borderRadius: 99, overflow: "hidden" };
const INPUT_STYLE = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 14px", color: "#e8eaf0", fontFamily: "'Nunito',sans-serif", fontSize: 14, outline: "none" };
const LABEL_STYLE = { display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#64748b", fontWeight: 700, marginBottom: 5 };

// ── Small reusable components ──────────────────────────────────────────────
function FInput({ label, ...p }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={LABEL_STYLE}>{label}</label>
      <input {...p} style={INPUT_STYLE} />
    </div>
  );
}

function FSelect({ label, children, ...p }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={LABEL_STYLE}>{label}</label>
      <select {...p} style={INPUT_STYLE}>{children}</select>
    </div>
  );
}

function BtnP({ onClick, children, full }) {
  return (
    <button onClick={onClick} style={{ flex: full ? undefined : 1, width: full ? "100%" : undefined, background: "#f59e0b", color: "#0a0e1a", border: "none", fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, padding: 11, borderRadius: 10, cursor: "pointer" }}>
      {children}
    </button>
  );
}

function BtnS({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ flex: 1, background: "rgba(255,255,255,.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,.1)", fontFamily: "'Nunito',sans-serif", fontWeight: 600, fontSize: 14, padding: 11, borderRadius: 10, cursor: "pointer" }}>
      {children}
    </button>
  );
}

function Ring({ p, color, size, stroke }) {
  size = size || 78; stroke = stroke || 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (p / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={dash + " " + circ} strokeLinecap="round"
        style={{ transition: "stroke-dasharray .8s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}

function Modal({ open, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.78)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div onClick={function(e){ e.stopPropagation(); }} style={{ background: "#111827", border: "1px solid rgba(245,158,11,.22)", borderRadius: 20, padding: 28, width: wide ? 620 : 440, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}>
        {children}
      </div>
    </div>
  );
}

function Toast({ toasts, pop }) {
  return (
    <div style={{ position: "fixed", top: 18, right: 18, zIndex: 999, display: "flex", flexDirection: "column", gap: 9, maxWidth: 330, pointerEvents: "none" }}>
      {toasts.map(function(t) {
        return (
          <div key={t.id} onClick={function(){ pop(t.id); }}
            style={{ display: "flex", gap: 10, padding: "12px 15px", borderRadius: 12, background: "#151d30", border: "1px solid rgba(245,158,11,.3)", boxShadow: "0 8px 30px rgba(0,0,0,.45)", animation: "toastIn .3s ease", cursor: "pointer", pointerEvents: "all" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{t.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e2d9f3", lineHeight: 1.45 }}>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Report Tab ─────────────────────────────────────────────────────────────
function ReportTab({ transactions, goals, debts, budgets, selectedMonth, setSelectedMonth, push }) {
  const allMonths = [...new Set(transactions.map(function(t){ return t.date.slice(0,7); }))].sort(function(a,b){ return b.localeCompare(a); });
  const monthTxs = transactions.filter(function(t){ return t.date.slice(0,7) === selectedMonth; });
  const rIncome = monthTxs.filter(function(t){ return t.type==="income"; }).reduce(function(s,t){ return s+t.amount; }, 0);
  const rExpenses = monthTxs.filter(function(t){ return t.type==="expense"; }).reduce(function(s,t){ return s+t.amount; }, 0);
  const rNet = rIncome - rExpenses;
  const rSaved = monthTxs.filter(function(t){ return t.cat==="Savings"; }).reduce(function(s,t){ return s+t.amount; }, 0);
  const rDebtPaid = monthTxs.filter(function(t){ return t.cat==="Debt Payment"; }).reduce(function(s,t){ return s+t.amount; }, 0);
  const monthLabel = selectedMonth ? new Date(selectedMonth+"-02").toLocaleDateString("en-US",{month:"long",year:"numeric"}) : "--";

  const catBreakdown = CATEGORIES.filter(function(c){ return c.name!=="Income"; }).map(function(cat) {
    return {
      name: cat.name, icon: cat.icon, color: cat.color,
      spent: monthTxs.filter(function(t){ return t.type==="expense" && t.cat===cat.name; }).reduce(function(s,t){ return s+t.amount; }, 0),
      budget: budgets[cat.name] || 0,
    };
  }).filter(function(c){ return c.spent>0 || c.budget>0; });

  const goalContribs = goals.map(function(g) {
    return Object.assign({}, g, { contributed: monthTxs.filter(function(t){ return t.cat==="Savings" && String(t.goalId)===String(g.id); }).reduce(function(s,t){ return s+t.amount; }, 0) });
  }).filter(function(g){ return g.contributed>0; });

  const debtPayments = debts.map(function(d) {
    return Object.assign({}, d, { paid: monthTxs.filter(function(t){ return t.cat==="Debt Payment" && String(t.debtId)===String(d.id); }).reduce(function(s,t){ return s+t.amount; }, 0) });
  }).filter(function(d){ return d.paid>0; });

  function exportMonthCSV() {
    var headers = ["Date","Description","Type","Category","Amount"];
    var rows = monthTxs.map(function(tx){ return [tx.date, '"'+tx.desc.replace(/"/g,'""')+'"', tx.type, tx.cat, tx.type==="income"?tx.amount:-tx.amount]; });
    var csv = [headers].concat(rows).map(function(r){ return r.join(","); }).join("\n");
    var blob = new Blob([csv], {type:"text/csv"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "report-"+selectedMonth+".csv"; a.click(); URL.revokeObjectURL(url);
    push("Monthly report exported! That's what I call a SPREAD-sheet of success! 🥁","📊");
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700 }}>Monthly Summary Report</div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <select value={selectedMonth} onChange={function(e){ setSelectedMonth(e.target.value); }}
            style={{ background:"#111827", border:"1px solid rgba(255,255,255,.12)", borderRadius:10, padding:"8px 14px", color:"#e8eaf0", fontFamily:"Nunito", fontSize:13, fontWeight:600, outline:"none", cursor:"pointer" }}>
            {allMonths.length===0 && <option value={selectedMonth}>{monthLabel}</option>}
            {allMonths.map(function(m){ return <option key={m} value={m}>{new Date(m+"-02").toLocaleDateString("en-US",{month:"long",year:"numeric"})}</option>; })}
          </select>
          <button onClick={exportMonthCSV} style={{ background:"rgba(52,211,153,.12)",color:"#34d399",border:"1px solid rgba(52,211,153,.3)",fontFamily:"Nunito",fontWeight:700,fontSize:13,padding:"8px 16px",borderRadius:20,cursor:"pointer" }}>Export</button>
        </div>
      </div>

      {monthTxs.length===0 ? (
        <div style={Object.assign({}, CARD, { textAlign:"center", padding:"48px 20px", color:"#64748b" })}>
          No transactions for {monthLabel}. Try another month or add some entries!
        </div>
      ) : (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:18 }}>
            {[
              {label:"Income", val:fmt(rIncome), color:"#34d399", sub:""},
              {label:"Expenses", val:fmt(rExpenses), color:"#fb7185", sub:""},
              {label:"Net", val:fmt(rNet), color:rNet>=0?"#f59e0b":"#fb7185", sub:rNet>=0?"Surplus":"Deficit"},
              {label:"Saved", val:fmt(rSaved), color:"#a78bfa", sub:""},
              {label:"Debt Paid", val:fmt(rDebtPaid), color:"#60a5fa", sub:""},
            ].map(function(s) {
              return (
                <div key={s.label} style={Object.assign({}, CARD, { position:"relative", overflow:"hidden" })}>
                  <div style={{ position:"absolute",top:-20,right:-20,width:70,height:70,borderRadius:"50%",background:s.color,opacity:.08 }} />
                  <div style={{ fontSize:10,textTransform:"uppercase",letterSpacing:"1.1px",color:"#64748b",fontWeight:700,marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,color:s.color }}>{s.val}</div>
                  {s.sub && <div style={{ fontSize:11,color:"#475569",marginTop:3 }}>{s.sub}</div>}
                </div>
              );
            })}
          </div>

          {rIncome > 0 && (
            <div style={{ background:"linear-gradient(135deg,rgba(167,139,250,.1),rgba(52,211,153,.08))", border:"1px solid rgba(167,139,250,.2)", borderRadius:14, padding:"14px 20px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"1px", color:"#64748b", fontWeight:700, marginBottom:4 }}>Savings Rate</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:700, color:"#a78bfa" }}>{Math.round((rSaved/rIncome)*100)}%</div>
                <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>of income saved this month</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"1px", color:"#64748b", fontWeight:700, marginBottom:4 }}>Expense Ratio</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:700, color: rExpenses/rIncome>1?"#fb7185":"#f59e0b" }}>{Math.round((rExpenses/rIncome)*100)}%</div>
                <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>of income spent</div>
              </div>
              <div style={{ fontSize:32 }}>{Math.round((rSaved/rIncome)*100)>=20 ? "🌟" : Math.round((rSaved/rIncome)*100)>=10 ? "👍" : "💪"}</div>
            </div>
          )}

          <div style={Object.assign({}, CARD, { marginBottom:18 })}>
            <div style={CARD_TITLE}>Spending vs Budget by Category</div>
            {catBreakdown.map(function(cat) {
              var p = calcPct(cat.spent, cat.budget);
              var over = cat.budget>0 && cat.spent>cat.budget;
              var under = cat.budget>0 && cat.spent<=cat.budget;
              return (
                <div key={cat.name} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, fontWeight:600, color:"#cbd5e1" }}>
                      <span>{cat.icon}</span>{cat.name}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:12 }}>
                      <span style={{ color:"#64748b" }}>{fmt(cat.spent)}{cat.budget>0 ? " / "+fmt(cat.budget) : ""}</span>
                      {over && <span style={{ color:"#fb7185", fontWeight:700, fontSize:11 }}>+{fmt(cat.spent-cat.budget)} over</span>}
                      {under && cat.budget>0 && <span style={{ color:"#34d399", fontWeight:700, fontSize:11 }}>{fmt(cat.budget-cat.spent)} under</span>}
                    </div>
                  </div>
                  {cat.budget>0 && (
                    <div style={PBAR}><div style={{ height:"100%", borderRadius:99, width:p+"%", background: over?"#fb7185":cat.color, transition:"width .6s" }} /></div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display:"grid", gridTemplateColumns: goalContribs.length>0 && debtPayments.length>0 ? "1fr 1fr" : "1fr", gap:18, marginBottom:18 }}>
            {goalContribs.length>0 && (
              <div style={CARD}>
                <div style={CARD_TITLE}>Savings Goal Contributions</div>
                {goalContribs.map(function(g) {
                  return (
                    <div key={g.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                      <span style={{ fontSize:20 }}>{g.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#e2d9f3" }}>{g.name}</div>
                        <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{calcPct(g.saved,g.target)}% of goal complete</div>
                      </div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, color:"#a78bfa", fontWeight:700 }}>+{fmt(g.contributed)}</div>
                    </div>
                  );
                })}
              </div>
            )}
            {debtPayments.length>0 && (
              <div style={CARD}>
                <div style={CARD_TITLE}>Debt Payments Made</div>
                {debtPayments.map(function(d) {
                  return (
                    <div key={d.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                      <span style={{ fontSize:20 }}>{d.dtype==="Car loan" ? "🚗" : "🏠"}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#e2d9f3" }}>{d.name}</div>
                        <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{fmt(d.remaining)} remaining</div>
                      </div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, color:"#60a5fa", fontWeight:700 }}>-{fmt(d.paid)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={CARD}>
            <div style={CARD_TITLE}>
              All Transactions - {monthLabel}
              <span style={{ fontFamily:"Nunito", fontSize:10, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:".8px" }}>{monthTxs.length} entries</span>
            </div>
            {monthTxs.map(function(tx) {
              var cat = CATEGORIES.find(function(c){ return c.name===tx.cat; }) || CATEGORIES[CATEGORIES.length-1];
              return (
                <div key={tx.id} style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 12px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.04)", borderRadius:10, marginBottom:6 }}>
                  <div style={{ width:32,height:32,borderRadius:9,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>{cat.icon}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:13,fontWeight:600,color:"#e2d9f3",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{tx.desc}</div>
                    <div style={{ fontSize:10,color:"#64748b",marginTop:1 }}>{tx.cat} - {tx.date}</div>
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,color:tx.type==="income"?"#34d399":"#fb7185",fontWeight:700 }}>{tx.type==="income"?"+":"-"}{fmt(tx.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [goals, setGoals] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState(null);
  const [milestoneData, setMilestoneData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [toasts, setToasts] = useState([]);

  const [txF, setTxF] = useState({ desc:"", amount:"", cat:"Food & Dining", type:"expense", date:new Date().toISOString().slice(0,10), goalId:"", debtId:"" });
  const [gF, setGF] = useState({ name:"", target:"", saved:"", icon:"🎯", milestones:"25,50,75,100", monthlyTarget:"" });
  const [dF, setDF] = useState({ name:"", dtype:"Car loan", total:"", remaining:"", milestones:"25,50,75,100" });
  const [bEdit, setBEdit] = useState(Object.assign({}, DEFAULT_BUDGETS));

  function push(msg, emoji) {
    emoji = emoji || "🥁";
    var id = Date.now() + Math.random();
    setToasts(function(p){ return p.concat([{ id:id, msg:msg, emoji:emoji }]); });
    setTimeout(function(){ setToasts(function(p){ return p.filter(function(t){ return t.id!==id; }); }); }, 5500);
  }
  function popToast(id) { setToasts(function(p){ return p.filter(function(t){ return t.id!==id; }); }); }

  useEffect(function() {
    async function load() {
      try {
        var t = await window.storage.get("hb_tx", true); if (t) setTransactions(JSON.parse(t.value));
        var b = await window.storage.get("hb_bud", true); if (b) setBudgets(JSON.parse(b.value));
        var g = await window.storage.get("hb_goals", true); if (g) setGoals(JSON.parse(g.value));
        var d = await window.storage.get("hb_debts", true); if (d) setDebts(JSON.parse(d.value));
      } catch(e) {}
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(function(){ if (loaded) window.storage.set("hb_tx", JSON.stringify(transactions), true).catch(function(){}); }, [transactions, loaded]);
  useEffect(function(){ if (loaded) window.storage.set("hb_bud", JSON.stringify(budgets), true).catch(function(){}); }, [budgets, loaded]);
  useEffect(function(){ if (loaded) window.storage.set("hb_goals", JSON.stringify(goals), true).catch(function(){}); }, [goals, loaded]);
  useEffect(function(){ if (loaded) window.storage.set("hb_debts", JSON.stringify(debts), true).catch(function(){}); }, [debts, loaded]);

  function addTx() {
    if (!txF.desc || !txF.amount || isNaN(parseFloat(txF.amount))) return;
    var tx = { desc:txF.desc, amount:parseFloat(txF.amount), cat:txF.cat, type:txF.type, date:txF.date, goalId:txF.goalId, debtId:txF.debtId, id:Date.now() };
    push(rand(DAD_JOKES), "🥁");

    var pendingMilestone = null;

    if (tx.cat === "Savings" && tx.goalId) {
      var newGoals = goals.map(function(g) {
        if (String(g.id) !== String(tx.goalId)) return g;
        var prevSaved = g.saved;
        var newSaved = prevSaved + tx.amount;
        g.milestones.forEach(function(m) {
          var threshold = (m/100) * g.target;
          if (prevSaved < threshold && newSaved >= threshold && !pendingMilestone)
            pendingMilestone = { emoji:g.icon, title:g.name, pct:m, joke:rand(MILESTONE_JOKES), ideas:rand(REWARD_SETS) };
        });
        return Object.assign({}, g, { saved:newSaved });
      });
      setGoals(newGoals);
    }

    if (tx.cat === "Debt Payment" && tx.debtId) {
      var newDebts = debts.map(function(d) {
        if (String(d.id) !== String(tx.debtId)) return d;
        var prevPaid = d.total - d.remaining;
        var newRemaining = Math.max(0, d.remaining - tx.amount);
        var newPaid = d.total - newRemaining;
        d.milestones.forEach(function(m) {
          var threshold = (m/100) * d.total;
          if (prevPaid < threshold && newPaid >= threshold && !pendingMilestone)
            pendingMilestone = { emoji: d.dtype==="Car loan"?"🚗":"🏠", title:d.name, pct:m, joke:rand(MILESTONE_JOKES), ideas:rand(REWARD_SETS) };
        });
        return Object.assign({}, d, { remaining:newRemaining });
      });
      setDebts(newDebts);
    }

    setTransactions(function(p){ return [tx].concat(p); });
    setTxF({ desc:"", amount:"", cat:"Food & Dining", type:"expense", date:new Date().toISOString().slice(0,10), goalId:"", debtId:"" });
    setModal(null);
    if (pendingMilestone) setTimeout(function(){ setMilestoneData(pendingMilestone); setModal("milestone"); }, 800);
  }

  function addGoal() {
    if (!gF.name || !gF.target) return;
    var parsed = gF.milestones.split(",").map(function(s){ return parseInt(s.trim()); }).filter(Boolean);
    setGoals(function(p){ return p.concat([Object.assign({}, gF, { id:Date.now(), target:parseFloat(gF.target), saved:parseFloat(gF.saved)||0, monthlyTarget:parseFloat(gF.monthlyTarget)||0, milestones:parsed })]); });
    setGF({ name:"", target:"", saved:"", icon:"🎯", milestones:"25,50,75,100", monthlyTarget:"" });
    setModal(null);
    push("New goal created! Time to make it RAIN savings! 🥁", "🎯");
  }

  function addDebt() {
    if (!dF.name || !dF.total) return;
    var parsed = dF.milestones.split(",").map(function(s){ return parseInt(s.trim()); }).filter(Boolean);
    setDebts(function(p){ return p.concat([Object.assign({}, dF, { id:Date.now(), total:parseFloat(dF.total), remaining:parseFloat(dF.remaining)||parseFloat(dF.total), milestones:parsed })]); });
    setDF({ name:"", dtype:"Car loan", total:"", remaining:"", milestones:"25,50,75,100" });
    setModal(null);
    push("Debt added! Every payment is a step toward DEBT-ication! 🥁", "📉");
  }

  function exportCSV() {
    var headers = ["Date","Description","Type","Category","Amount","Linked Goal","Linked Debt"];
    var rows = transactions.map(function(tx) {
      return [tx.date, '"'+tx.desc.replace(/"/g,'""')+'"', tx.type, tx.cat, tx.type==="income"?tx.amount:-tx.amount,
        (goals.find(function(g){ return String(g.id)===String(tx.goalId); })||{name:""}).name,
        (debts.find(function(d){ return String(d.id)===String(tx.debtId); })||{name:""}).name];
    });
    var csv = [headers].concat(rows).map(function(r){ return r.join(","); }).join("\n");
    var blob = new Blob([csv],{type:"text/csv"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href=url; a.download="homebudget-export-"+new Date().toISOString().slice(0,10)+".csv"; a.click(); URL.revokeObjectURL(url);
    push("CSV exported! You're so organized it's almost TAXING! 🥁","📊");
  }

  var income = transactions.filter(function(t){ return t.type==="income"; }).reduce(function(s,t){ return s+t.amount; }, 0);
  var expenses = transactions.filter(function(t){ return t.type==="expense"; }).reduce(function(s,t){ return s+t.amount; }, 0);
  var totalSaved = goals.reduce(function(s,g){ return s+g.saved; }, 0);
  var totalDebt = debts.reduce(function(s,d){ return s+d.remaining; }, 0);

  var spendByCat = CATEGORIES.filter(function(c){ return c.name!=="Income"; }).map(function(cat) {
    return Object.assign({}, cat, {
      spent: transactions.filter(function(t){ return t.type==="expense" && t.cat===cat.name; }).reduce(function(s,t){ return s+t.amount; }, 0),
      budget: budgets[cat.name] || 0,
    });
  });
  var pieData = spendByCat.filter(function(c){ return c.spent>0; }).map(function(c){ return { name:c.name, value:c.spent, color:c.color }; });
  var monthlyMap = {};
  transactions.forEach(function(t) {
    var m = t.date.slice(0,7);
    if (!monthlyMap[m]) monthlyMap[m] = { month:m, income:0, expenses:0 };
    if (t.type==="income") monthlyMap[m].income+=t.amount; else monthlyMap[m].expenses+=t.amount;
  });
  var monthlyData = Object.values(monthlyMap).sort(function(a,b){ return a.month.localeCompare(b.month); }).slice(-6);

  var navStyle = function(id) {
    return { background: tab===id?"rgba(245,158,11,.13)":"none", color: tab===id?"#f59e0b":"#64748b", border:"none", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, padding:"7px 14px", borderRadius:8, cursor:"pointer", textTransform:"uppercase", letterSpacing:".5px" };
  };

  if (!loaded) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0a0e1a", color:"#f59e0b", fontFamily:"Syne,serif", fontSize:20 }}>
        Loading your finances...
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0a0e1a", color:"#e8eaf0", fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select option { background: #1e2235; }
        @keyframes toastIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pop { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }
      `}</style>

      <Toast toasts={toasts} pop={popToast} />

      <header style={{ background:"linear-gradient(90deg,#0f1829,#131d35)", borderBottom:"1px solid rgba(255,255,255,.07)", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:62, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#f59e0b", display:"flex", alignItems:"center", gap:8 }}>
          🏦 <span>home</span><span style={{ color:"#e8eaf0", fontWeight:500 }}>budget</span>
        </div>
        <nav style={{ display:"flex", gap:2 }}>
          {[["dashboard","Dashboard"],["goals","Goals"],["debts","Debts"],["transactions","Transactions"],["report","Report"]].map(function(item) {
            return <button key={item[0]} onClick={function(){ setTab(item[0]); }} style={navStyle(item[0])}>{item[1]}</button>;
          })}
        </nav>
        <button onClick={function(){ setModal("addTx"); }} style={{ background:"#f59e0b", color:"#0a0e1a", border:"none", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, padding:"8px 20px", borderRadius:20, cursor:"pointer" }}>+ Add Entry</button>
      </header>

      <div style={{ maxWidth:1140, margin:"0 auto", padding:"26px 18px" }}>

        {/* DASHBOARD */}
        {tab==="dashboard" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
              {[
                {label:"Total Income", val:fmt(income), color:"#34d399", sub:transactions.filter(function(t){return t.type==="income";}).length+" entries"},
                {label:"Total Expenses", val:fmt(expenses), color:"#fb7185", sub:transactions.filter(function(t){return t.type==="expense";}).length+" entries"},
                {label:"Total Saved", val:fmt(totalSaved), color:"#f59e0b", sub:goals.length+" goals"},
                {label:"Remaining Debt", val:fmt(totalDebt), color:"#60a5fa", sub:debts.length+" loans"},
              ].map(function(s) {
                return (
                  <div key={s.label} style={Object.assign({}, CARD, { position:"relative", overflow:"hidden" })}>
                    <div style={{ position:"absolute",top:-25,right:-25,width:80,height:80,borderRadius:"50%",background:s.color,opacity:.08 }} />
                    <div style={{ fontSize:10,textTransform:"uppercase",letterSpacing:"1.2px",color:"#64748b",marginBottom:8,fontWeight:700 }}>{s.label}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:11,color:"#475569",marginTop:4 }}>{s.sub}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
              <div style={CARD}>
                <div style={CARD_TITLE}>Spending by Category</div>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={205}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                        {pieData.map(function(e,i){ return <Cell key={i} fill={e.color} />; })}
                      </Pie>
                      <Tooltip formatter={function(v){ return fmt(v); }} contentStyle={{ background:"#1e2235",border:"none",borderRadius:8,color:"#e8eaf0",fontSize:12 }} />
                      <Legend iconType="circle" iconSize={7} formatter={function(v){ return <span style={{ color:"#94a3b8",fontSize:11 }}>{v}</span>; }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div style={{ textAlign:"center",padding:"36px 20px",color:"#64748b",fontSize:13 }}>No expense data yet!</div>}
              </div>
              <div style={CARD}>
                <div style={CARD_TITLE}>Monthly Overview</div>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={205}>
                    <BarChart data={monthlyData} barSize={12}>
                      <XAxis dataKey="month" tick={{ fill:"#64748b",fontSize:10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"#64748b",fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={function(v){ return "$"+v; }} />
                      <Tooltip formatter={function(v){ return fmt(v); }} contentStyle={{ background:"#1e2235",border:"none",borderRadius:8,color:"#e8eaf0",fontSize:12 }} />
                      <Bar dataKey="income" fill="#34d399" name="Income" radius={[4,4,0,0]} />
                      <Bar dataKey="expenses" fill="#fb7185" name="Expenses" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div style={{ textAlign:"center",padding:"36px 20px",color:"#64748b",fontSize:13 }}>Add transactions to see trends</div>}
              </div>
            </div>

            {goals.length>0 && (
              <div style={Object.assign({}, CARD, { marginBottom:18 })}>
                <div style={CARD_TITLE}>Savings Goals
                  <button onClick={function(){ setTab("goals"); }} style={{ fontSize:11,color:"#f59e0b",cursor:"pointer",background:"none",border:"none",fontFamily:"Nunito",fontWeight:700,textDecoration:"underline" }}>View all</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:12 }}>
                  {goals.map(function(g) {
                    var p = calcPct(g.saved, g.target);
                    return (
                      <div key={g.id} style={{ background:"rgba(52,211,153,.06)",border:"1px solid rgba(52,211,153,.15)",borderRadius:12,padding:"14px 16px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                          <span style={{ fontSize:18 }}>{g.icon}</span>
                          <span style={{ fontWeight:700,fontSize:13,color:"#e2d9f3" }}>{g.name}</span>
                        </div>
                        <div style={PBAR}><div style={{ height:"100%",borderRadius:99,background:"#34d399",width:p+"%",transition:"width .6s" }} /></div>
                        <div style={{ display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:"#64748b" }}>
                          <span>{fmt(g.saved)}</span><span style={{ color:"#34d399",fontWeight:700 }}>{p}%</span><span>{fmt(g.target)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {debts.length>0 && (
              <div style={Object.assign({}, CARD, { marginBottom:18 })}>
                <div style={CARD_TITLE}>Debt Reduction
                  <button onClick={function(){ setTab("debts"); }} style={{ fontSize:11,color:"#f59e0b",cursor:"pointer",background:"none",border:"none",fontFamily:"Nunito",fontWeight:700,textDecoration:"underline" }}>View all</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:12 }}>
                  {debts.map(function(d) {
                    var paid = d.total - d.remaining;
                    var p = calcPct(paid, d.total);
                    return (
                      <div key={d.id} style={{ background:"rgba(96,165,250,.06)",border:"1px solid rgba(96,165,250,.15)",borderRadius:12,padding:"14px 16px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                          <span style={{ fontSize:18 }}>{d.dtype==="Car loan"?"🚗":"🏠"}</span>
                          <span style={{ fontWeight:700,fontSize:13,color:"#e2d9f3" }}>{d.name}</span>
                        </div>
                        <div style={PBAR}><div style={{ height:"100%",borderRadius:99,background:"#60a5fa",width:p+"%",transition:"width .6s" }} /></div>
                        <div style={{ display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:"#64748b" }}>
                          <span>{fmt(d.remaining)} left</span><span style={{ color:"#60a5fa",fontWeight:700 }}>{p}% paid</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={CARD}>
              <div style={CARD_TITLE}>Budget Limits
                <button onClick={function(){ setBEdit(Object.assign({},budgets)); setModal("editBudgets"); }} style={{ fontSize:11,color:"#f59e0b",background:"none",border:"none",cursor:"pointer",fontFamily:"Nunito",fontWeight:700,textDecoration:"underline" }}>Edit</button>
              </div>
              {spendByCat.filter(function(c){ return c.budget>0; }).map(function(cat) {
                var p = calcPct(cat.spent, cat.budget);
                var over = cat.spent > cat.budget;
                return (
                  <div key={cat.name} style={{ marginBottom:13 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                      <div style={{ fontSize:12,fontWeight:600,color:"#cbd5e1" }}>{cat.icon} {cat.name}</div>
                      <div style={{ fontSize:11,color:over?"#fb7185":"#64748b" }}>{fmt(cat.spent)} / {fmt(cat.budget)}{over?" ⚠️":""}</div>
                    </div>
                    <div style={PBAR}><div style={{ height:"100%",borderRadius:99,background:over?"#fb7185":cat.color,width:p+"%",transition:"width .6s" }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GOALS */}
        {tab==="goals" && (
          <div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700 }}>Savings Goals</div>
              <button onClick={function(){ setModal("addGoal"); }} style={{ background:"#f59e0b",color:"#0a0e1a",border:"none",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:13,padding:"8px 20px",borderRadius:20,cursor:"pointer" }}>+ New Goal</button>
            </div>
            {goals.length===0 && <div style={Object.assign({},CARD,{textAlign:"center",padding:"40px 20px",color:"#64748b"})}>No goals yet! Create one - even a CENT of progress is progress! 🥁</div>}
            {goals.map(function(g) {
              var p = calcPct(g.saved, g.target);
              var thisMonth = new Date().toISOString().slice(0,7);
              var contributed = transactions.filter(function(tx){ return tx.cat==="Savings" && String(tx.goalId)===String(g.id) && tx.date.slice(0,7)===thisMonth; }).reduce(function(s,t){ return s+t.amount; }, 0);
              var monthPct = g.monthlyTarget > 0 ? calcPct(contributed, g.monthlyTarget) : null;
              return (
                <div key={g.id} style={Object.assign({},CARD,{display:"flex",alignItems:"center",gap:16,marginBottom:12})}>
                  <div style={{ position:"relative",flexShrink:0 }}>
                    <Ring p={p} color="#34d399" />
                    <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:"#34d399" }}>{p}%</div>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontWeight:700,fontSize:15,color:"#e2d9f3",display:"flex",alignItems:"center",gap:7 }}><span style={{ fontSize:20 }}>{g.icon}</span>{g.name}</div>
                    <div style={{ fontSize:12,color:"#64748b",margin:"4px 0 6px" }}>{fmt(g.saved)} saved of {fmt(g.target)}</div>
                    {monthPct !== null && (
                      <div style={{ marginBottom:8 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",marginBottom:4 }}>
                          <span>This month: {fmt(g.monthlyTarget)} target</span>
                          <span style={{ color:monthPct>=100?"#34d399":"#f59e0b",fontWeight:700 }}>{fmt(contributed)} ({monthPct}%)</span>
                        </div>
                        <div style={{ height:4,background:"rgba(255,255,255,.06)",borderRadius:99,overflow:"hidden" }}>
                          <div style={{ height:"100%",borderRadius:99,background:monthPct>=100?"#34d399":"#f59e0b",width:monthPct+"%",transition:"width .6s" }} />
                        </div>
                      </div>
                    )}
                    <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                      {g.milestones.map(function(m) {
                        var hit = p>=m;
                        return <div key={m} style={{ display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:99,background:hit?"rgba(52,211,153,.15)":"rgba(255,255,255,.04)",border:"1px solid "+(hit?"#34d399":"rgba(255,255,255,.1)"),fontSize:11,fontWeight:700,color:hit?"#34d399":"#475569" }}>{hit?"+ ":""}{m}%</div>;
                      })}
                    </div>
                  </div>
                  <button onClick={function(){ setGoals(function(p){ return p.filter(function(x){ return x.id!==g.id; }); }); }} style={{ background:"none",border:"none",color:"#334155",cursor:"pointer",fontSize:14,padding:4 }}>x</button>
                </div>
              );
            })}
          </div>
        )}

        {/* DEBTS */}
        {tab==="debts" && (
          <div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700 }}>Debt Reduction</div>
              <button onClick={function(){ setModal("addDebt"); }} style={{ background:"#f59e0b",color:"#0a0e1a",border:"none",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:13,padding:"8px 20px",borderRadius:20,cursor:"pointer" }}>+ Add Debt</button>
            </div>
            {debts.length===0 && <div style={Object.assign({},CARD,{textAlign:"center",padding:"40px 20px",color:"#64748b"})}>No debts tracked yet. Add one - no INTEREST in giving up! 🥁</div>}
            {debts.map(function(d) {
              var paid = d.total - d.remaining;
              var p = calcPct(paid, d.total);
              return (
                <div key={d.id} style={Object.assign({},CARD,{display:"flex",alignItems:"center",gap:16,marginBottom:12})}>
                  <div style={{ position:"relative",flexShrink:0 }}>
                    <Ring p={p} color="#60a5fa" />
                    <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:"#60a5fa" }}>{p}%</div>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontWeight:700,fontSize:15,color:"#e2d9f3",display:"flex",alignItems:"center",gap:7 }}>
                      <span style={{ fontSize:20 }}>{d.dtype==="Car loan"?"🚗":"🏠"}</span>{d.name}
                      <span style={{ fontSize:11,color:"#64748b",fontWeight:400 }}>({d.dtype})</span>
                    </div>
                    <div style={{ fontSize:12,color:"#64748b",margin:"4px 0 8px" }}>{fmt(d.remaining)} remaining - {fmt(paid)} paid of {fmt(d.total)}</div>
                    <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                      {d.milestones.map(function(m) {
                        var hit = p>=m;
                        return <div key={m} style={{ display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:99,background:hit?"rgba(96,165,250,.15)":"rgba(255,255,255,.04)",border:"1px solid "+(hit?"#60a5fa":"rgba(255,255,255,.1)"),fontSize:11,fontWeight:700,color:hit?"#60a5fa":"#475569" }}>{hit?"+ ":""}{m}%</div>;
                      })}
                    </div>
                  </div>
                  <button onClick={function(){ setDebts(function(p){ return p.filter(function(x){ return x.id!==d.id; }); }); }} style={{ background:"none",border:"none",color:"#334155",cursor:"pointer",fontSize:14,padding:4 }}>x</button>
                </div>
              );
            })}
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab==="transactions" && (
          <div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700 }}>All Transactions</div>
              <div style={{ display:"flex",gap:10 }}>
                <button onClick={exportCSV} style={{ background:"rgba(52,211,153,.12)",color:"#34d399",border:"1px solid rgba(52,211,153,.3)",fontFamily:"Nunito",fontWeight:700,fontSize:13,padding:"8px 16px",borderRadius:20,cursor:"pointer" }}>Export CSV</button>
                <button onClick={function(){ setModal("addTx"); }} style={{ background:"#f59e0b",color:"#0a0e1a",border:"none",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:13,padding:"8px 20px",borderRadius:20,cursor:"pointer" }}>+ Add Entry</button>
              </div>
            </div>
            <div style={CARD}>
              {transactions.length===0
                ? <div style={{ textAlign:"center",padding:"36px 20px",color:"#64748b",fontSize:13 }}>No transactions yet! 🥁</div>
                : transactions.map(function(tx) {
                  var cat = CATEGORIES.find(function(c){ return c.name===tx.cat; }) || CATEGORIES[CATEGORIES.length-1];
                  var linkedGoal = goals.find(function(g){ return String(g.id)===String(tx.goalId); });
                  var linkedDebt = debts.find(function(d){ return String(d.id)===String(tx.debtId); });
                  return (
                    <div key={tx.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 13px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.04)",borderRadius:10,marginBottom:7 }}>
                      <div style={{ width:36,height:36,borderRadius:10,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>{cat.icon}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:13,fontWeight:600,color:"#e2d9f3",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{tx.desc}</div>
                        <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{tx.cat}{linkedGoal?" - "+linkedGoal.name:""}{linkedDebt?" - "+linkedDebt.name:""}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,color:tx.type==="income"?"#34d399":"#fb7185" }}>{tx.type==="income"?"+":"-"}{fmt(tx.amount)}</div>
                        <div style={{ fontSize:10,color:"#475569",marginTop:2 }}>{tx.date}</div>
                      </div>
                      <button onClick={function(){ setTransactions(function(p){ return p.filter(function(t){ return t.id!==tx.id; }); }); }} style={{ background:"none",border:"none",color:"#334155",cursor:"pointer",fontSize:13,padding:4 }}>x</button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* REPORT */}
        {tab==="report" && (
          <ReportTab transactions={transactions} goals={goals} debts={debts} budgets={budgets} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} push={push} />
        )}

      </div>

      {/* ADD TRANSACTION */}
      <Modal open={modal==="addTx"} onClose={function(){ setModal(null); }}>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:700,color:"#e2d9f3",marginBottom:20 }}>Add Transaction</div>
        <div style={{ marginBottom:14 }}>
          <label style={LABEL_STYLE}>Type</label>
          <div style={{ display:"flex",gap:8 }}>
            {["expense","income"].map(function(t) {
              var active = txF.type===t;
              var clr = t==="income"?"#34d399":"#fb7185";
              return (
                <button key={t} onClick={function(){ setTxF(function(f){ return Object.assign({},f,{type:t,cat:t==="income"?"Income":"Food & Dining",goalId:"",debtId:""}); }); }}
                  style={{ flex:1,padding:9,borderRadius:10,border:"1px solid "+(active?clr:"rgba(255,255,255,.1)"),background:active?"rgba("+( t==="income"?"52,211,153":"251,113,133")+", .12)":"transparent",color:active?clr:"#64748b",fontFamily:"Nunito",fontSize:13,fontWeight:700,cursor:"pointer" }}>
                  {t==="income"?"Income":"Expense"}
                </button>
              );
            })}
          </div>
        </div>
        <FInput label="Description" placeholder="e.g. Grocery run, Paycheck..." value={txF.desc} onChange={function(e){ setTxF(function(f){ return Object.assign({},f,{desc:e.target.value}); }); }} />
        <FInput label="Amount ($)" type="number" placeholder="0.00" value={txF.amount} onChange={function(e){ setTxF(function(f){ return Object.assign({},f,{amount:e.target.value}); }); }} />
        <FSelect label="Category" value={txF.cat} onChange={function(e){ setTxF(function(f){ return Object.assign({},f,{cat:e.target.value,goalId:"",debtId:""}); }); }}>
          {(txF.type==="income" ? INCOME_CATS : EXPENSE_CATS).map(function(c){ return <option key={c.name} value={c.name}>{c.icon} {c.name}</option>; })}
        </FSelect>
        {txF.cat==="Savings" && goals.length>0 && (
          <FSelect label="Link to Savings Goal" value={txF.goalId} onChange={function(e){ setTxF(function(f){ return Object.assign({},f,{goalId:e.target.value}); }); }}>
            <option value="">None</option>
            {goals.map(function(g){ return <option key={g.id} value={g.id}>{g.icon} {g.name}</option>; })}
          </FSelect>
        )}
        {txF.cat==="Debt Payment" && debts.length>0 && (
          <FSelect label="Link to Debt" value={txF.debtId} onChange={function(e){ setTxF(function(f){ return Object.assign({},f,{debtId:e.target.value}); }); }}>
            <option value="">None</option>
            {debts.map(function(d){ return <option key={d.id} value={d.id}>{d.dtype==="Car loan"?"🚗":"🏠"} {d.name}</option>; })}
          </FSelect>
        )}
        <FInput label="Date" type="date" value={txF.date} onChange={function(e){ setTxF(function(f){ return Object.assign({},f,{date:e.target.value}); }); }} />
        <div style={{ display:"flex",gap:10,marginTop:6 }}>
          <BtnS onClick={function(){ setModal(null); }}>Cancel</BtnS>
          <BtnP onClick={addTx}>Add It! 🥁</BtnP>
        </div>
      </Modal>

      {/* ADD GOAL */}
      <Modal open={modal==="addGoal"} onClose={function(){ setModal(null); }}>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:700,color:"#e2d9f3",marginBottom:20 }}>New Savings Goal</div>
        <FInput label="Goal Name" placeholder="e.g. Emergency Fund, Beach Vacation..." value={gF.name} onChange={function(e){ setGF(function(f){ return Object.assign({},f,{name:e.target.value}); }); }} />
        <FInput label="Target Amount ($)" type="number" placeholder="5000" value={gF.target} onChange={function(e){ setGF(function(f){ return Object.assign({},f,{target:e.target.value}); }); }} />
        <FInput label="Already Saved ($)" type="number" placeholder="0" value={gF.saved} onChange={function(e){ setGF(function(f){ return Object.assign({},f,{saved:e.target.value}); }); }} />
        <FInput label="Monthly Contribution Target ($)" type="number" placeholder="e.g. 200 per month (optional)" value={gF.monthlyTarget} onChange={function(e){ setGF(function(f){ return Object.assign({},f,{monthlyTarget:e.target.value}); }); }} />
        <FInput label="Milestone checkpoints (%)" placeholder="25,50,75,100" value={gF.milestones} onChange={function(e){ setGF(function(f){ return Object.assign({},f,{milestones:e.target.value}); }); }} />
        <div style={{ marginBottom:14 }}>
          <label style={LABEL_STYLE}>Pick an Icon</label>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {ICONS.map(function(ic){ return <button key={ic} onClick={function(){ setGF(function(f){ return Object.assign({},f,{icon:ic}); }); }} style={{ width:38,height:38,borderRadius:8,border:"1.5px solid "+(gF.icon===ic?"#f59e0b":"rgba(255,255,255,.1)"),background:gF.icon===ic?"rgba(245,158,11,.15)":"rgba(255,255,255,.04)",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>{ic}</button>; })}
          </div>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:6 }}>
          <BtnS onClick={function(){ setModal(null); }}>Cancel</BtnS>
          <BtnP onClick={addGoal}>Create Goal</BtnP>
        </div>
      </Modal>

      {/* ADD DEBT */}
      <Modal open={modal==="addDebt"} onClose={function(){ setModal(null); }}>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:700,color:"#e2d9f3",marginBottom:20 }}>Add Debt</div>
        <FInput label="Debt Name" placeholder="e.g. Toyota Camry, Family Home..." value={dF.name} onChange={function(e){ setDF(function(f){ return Object.assign({},f,{name:e.target.value}); }); }} />
        <FSelect label="Type" value={dF.dtype} onChange={function(e){ setDF(function(f){ return Object.assign({},f,{dtype:e.target.value}); }); }}>
          <option>Car loan</option><option>Mortgage</option>
        </FSelect>
        <FInput label="Original Total ($)" type="number" placeholder="25000" value={dF.total} onChange={function(e){ setDF(function(f){ return Object.assign({},f,{total:e.target.value}); }); }} />
        <FInput label="Current Remaining ($)" type="number" placeholder="Leave blank to use total" value={dF.remaining} onChange={function(e){ setDF(function(f){ return Object.assign({},f,{remaining:e.target.value}); }); }} />
        <FInput label="Milestone checkpoints (%)" placeholder="25,50,75,100" value={dF.milestones} onChange={function(e){ setDF(function(f){ return Object.assign({},f,{milestones:e.target.value}); }); }} />
        <div style={{ display:"flex",gap:10,marginTop:6 }}>
          <BtnS onClick={function(){ setModal(null); }}>Cancel</BtnS>
          <BtnP onClick={addDebt}>Add Debt</BtnP>
        </div>
      </Modal>

      {/* EDIT BUDGETS */}
      <Modal open={modal==="editBudgets"} onClose={function(){ setModal(null); }} wide>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:700,color:"#e2d9f3",marginBottom:20 }}>Edit Monthly Budgets</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {Object.keys(bEdit).map(function(cat) {
            var c = CATEGORIES.find(function(x){ return x.name===cat; });
            return (
              <div key={cat}>
                <label style={LABEL_STYLE}>{c ? c.icon : ""} {cat}</label>
                <input type="number" value={bEdit[cat]} onChange={function(e){ setBEdit(function(b){ return Object.assign({},b,{[cat]:parseFloat(e.target.value)||0}); }); }} style={INPUT_STYLE} />
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex",gap:10,marginTop:20 }}>
          <BtnS onClick={function(){ setModal(null); }}>Cancel</BtnS>
          <BtnP onClick={function(){ setBudgets(Object.assign({},bEdit)); setModal(null); }}>Save Budgets</BtnP>
        </div>
      </Modal>

      {/* MILESTONE */}
      <Modal open={modal==="milestone"} onClose={function(){ setModal(null); }}>
        {milestoneData && (
          <div>
            <div style={{ textAlign:"center",padding:"8px 0 18px" }}>
              <div style={{ fontSize:52,marginBottom:8 }}>🏆</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#f59e0b" }}>{milestoneData.pct}% Milestone!</div>
              <div style={{ fontSize:15,color:"#e2d9f3",fontWeight:700,margin:"6px 0 4px" }}>{milestoneData.emoji} {milestoneData.title}</div>
              <div style={{ fontSize:13,color:"#94a3b8",lineHeight:1.55 }}>{milestoneData.joke}</div>
            </div>
            <div style={{ fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"#64748b",fontWeight:700,marginBottom:10 }}>Budget-Friendly Reward Ideas</div>
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:18 }}>
              {milestoneData.ideas.map(function(idea,i){ return <div key={i} style={{ background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10,padding:"11px 14px",fontSize:13,fontWeight:600,color:"#e2d9f3" }}>{idea}</div>; })}
            </div>
            <BtnP onClick={function(){ setModal(null); }} full>Keep Crushing It!</BtnP>
          </div>
        )}
      </Modal>
    </div>
  );
}
