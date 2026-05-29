import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const CATEGORIES = ["Bills", "Savings", "PMG Bills", "Food", "Personal Spendings"];
const TYPES = ["income", "expense", "savings"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const YEARS = Array.from({length: 10}, (_, i) => 2026 + i);
const PINK = ["#f9a8d4","#f472b6","#ec4899","#db2777","#be185d"];
const PIE_COLORS = ["#f472b6","#fb7185","#fbbf24","#34d399","#818cf8"];

const fmt = (n) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(n);
const uid = () => Math.random().toString(36).slice(2, 9);

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, type: "spring", stiffness: 200, damping: 20 } }),
};

function SummaryCard({ label, amount, icon, accent, index }) {
  return (
    <motion.div variants={cardVariants} custom={index} initial="hidden" animate="visible"
      className="rounded-2xl p-4 shadow-lg border border-pink-100 dark:border-pink-900/30 bg-white dark:bg-zinc-900 flex flex-col gap-1 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-6 translate-x-6 ${accent}`} />
      <span className="text-2xl">{icon}</span>
      <p className="text-xs font-semibold text-pink-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold text-zinc-800 dark:text-white truncate">{fmt(amount)}</p>
    </motion.div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-pink-100 dark:border-pink-900/30"
          onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-zinc-800 dark:text-white">{title}</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-pink-500 text-xl transition">✕</button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TransactionForm({ initial, onSave, onClose }) {
  const now = new Date();
  const [form, setForm] = useState(initial || {
    type: "expense", category: "Food", description: "",
    amount: "", date: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0 || !form.description.trim()) return;
    onSave({ ...form, amount: +form.amount, id: form.id || uid() });
  };

  const cats = form.type === "income" ? ["Athena", "Andren Homes", "Others"] : form.type === "savings" ? ["Savings"] : CATEGORIES.filter(c => c !== "Savings");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {TYPES.map(t => (
          <button key={t} onClick={() => set("type", t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${form.type === t ? "bg-pink-500 text-white shadow-md" : "bg-pink-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"}`}>
            {t}
          </button>
        ))}
      </div>
      <select value={form.category} onChange={e => set("category", e.target.value)}
        className="w-full rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-pink-400">
        {cats.map(c => <option key={c}>{c}</option>)}
      </select>
      <input placeholder="Description" value={form.description} onChange={e => set("description", e.target.value)}
        className="w-full rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-400" />
      <input type="number" placeholder="Amount (₱)" value={form.amount} onChange={e => set("amount", e.target.value)}
        className="w-full rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-400" />
      <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
        className="w-full rounded-xl border border-pink-200 dark:border-zinc-700 bg-pink-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-pink-400" />
      <div className="flex gap-2 mt-1">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-pink-200 dark:border-zinc-700 text-sm text-zinc-500 hover:bg-pink-50 dark:hover:bg-zinc-800 transition">Cancel</button>
        <button onClick={submit} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white text-sm font-semibold shadow-md hover:from-pink-500 hover:to-rose-500 transition">Save</button>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-pink-100 dark:border-zinc-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-zinc-600 dark:text-zinc-300 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>)}
    </div>
  );
};

export default function App() {
  const [txns, setTxns] = useLocalStorage("jajie-txns", []);
  const [dark, setDark] = useLocalStorage("jajie-dark", false);
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear().toString());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const filtered = useMemo(() => txns.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === +filterYear && d.getMonth() === filterMonth;
  }), [txns, filterMonth, filterYear]);

  const yearFiltered = useMemo(() => txns.filter(t => new Date(t.date).getFullYear() === +filterYear), [txns, filterYear]);

  const sum = (arr, type) => arr.filter(t => t.type === type).reduce((a, t) => a + t.amount, 0);

  const income = sum(filtered, "income");
  const expenses = sum(filtered, "expense");
  const savings = sum(filtered, "savings");
  const balance = income - expenses - savings;

  const yearIncome = sum(yearFiltered, "income");
  const yearExpenses = sum(yearFiltered, "expense");
  const yearSavings = sum(yearFiltered, "savings");

  const monthlyData = MONTHS.map((m, i) => {
    const mo = txns.filter(t => new Date(t.date).getFullYear() === +filterYear && new Date(t.date).getMonth() === i);
    return { month: m, Income: sum(mo, "income"), Expenses: sum(mo, "expense"), Savings: sum(mo, "savings") };
  });

  const catData = CATEGORIES.filter(c => c !== "Savings").map(c => ({
    name: c, value: filtered.filter(t => t.type === "expense" && t.category === c).reduce((a, t) => a + t.amount, 0)
  })).filter(d => d.value > 0);

  const saveTxn = (txn) => {
    setTxns(prev => {
      const exists = prev.find(t => t.id === txn.id);
      return exists ? prev.map(t => t.id === txn.id ? txn : t) : [txn, ...prev];
    });
    setModal(null); setEditing(null);
  };

  const deleteTxn = (id) => setTxns(prev => prev.filter(t => t.id !== id));

  const typeColor = { income: "text-emerald-500", expense: "text-rose-500", savings: "text-sky-500" };
  const typeBg = { income: "bg-emerald-50 dark:bg-emerald-950/30", expense: "bg-rose-50 dark:bg-rose-950/30", savings: "bg-sky-50 dark:bg-sky-950/30" };
  const typeIcon = { income: "💚", expense: "🌸", savings: "💙" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-pink-100 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <div>
            <h1 className="text-base font-black text-zinc-800 dark:text-white leading-tight tracking-tight">Jajie's Expense Tracker</h1>
            <p className="text-[10px] text-pink-400 font-medium">{MONTHS[filterMonth]} {filterYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark(d => !d)}
            className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-zinc-800 flex items-center justify-center text-base hover:bg-pink-100 dark:hover:bg-zinc-700 transition">
            {dark ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setModal("add")}
            className="h-9 px-3 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white text-sm font-bold shadow-md hover:from-pink-500 hover:to-rose-500 transition">
            + Add
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="px-4 pt-4 flex gap-2 flex-wrap">
        <select value={filterMonth} onChange={e => setFilterMonth(+e.target.value)}
          className="rounded-xl border border-pink-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm">
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="rounded-xl border border-pink-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm">
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Nav Tabs — fixed width, no scroll, icon + short label */}
      <nav className="px-4 pt-3 flex gap-1">
        {[["dashboard","📊","Dashboard"],["transactions","💳","Transactions"],["analytics","📈","Analytics"]].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-semibold transition-all ${tab === id ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md" : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-pink-100 dark:border-zinc-800"}`}>
            <span className="text-base leading-none">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className="px-4 py-4 max-w-2xl mx-auto pb-24">

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard label="Income" amount={income} icon="💚" accent="bg-emerald-400" index={0} />
              <SummaryCard label="Expenses" amount={expenses} icon="🌸" accent="bg-pink-400" index={1} />
              <SummaryCard label="Savings" amount={savings} icon="💙" accent="bg-sky-400" index={2} />
              <SummaryCard label="Balance" amount={balance} icon="✨" accent="bg-fuchsia-400" index={3} />
            </div>

            {/* Monthly bar chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-lg border border-pink-100 dark:border-pink-900/30">
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Monthly Overview — {filterYear}</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} barSize={6}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Income" fill="#34d399" radius={4} />
                  <Bar dataKey="Expenses" fill="#f472b6" radius={4} />
                  <Bar dataKey="Savings" fill="#60a5fa" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent 5 transactions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-lg border border-pink-100 dark:border-pink-900/30">
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Recent Transactions</h3>
              {filtered.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🌸</p>
                  <p className="text-sm text-zinc-400">No transactions yet</p>
                  <p className="text-xs text-zinc-300 dark:text-zinc-600">Tap + Add to get started</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filtered.slice(0, 5).map(t => (
                    <div key={t.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${typeBg[t.type]}`}>
                      <span className="text-lg">{typeIcon[t.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate">{t.description}</p>
                        <p className="text-xs text-zinc-400">{t.category} · {t.date}</p>
                      </div>
                      <p className={`text-sm font-bold ${typeColor[t.type]}`}>{t.type === "expense" ? "-" : "+"}{fmt(t.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab === "transactions" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-10 text-center shadow-lg border border-pink-100 dark:border-pink-900/30">
                <p className="text-5xl mb-3">🌸</p>
                <p className="text-sm text-zinc-500">No transactions for {MONTHS[filterMonth]} {filterYear}</p>
                <button onClick={() => setModal("add")} className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white text-sm font-bold shadow-md">+ Add Transaction</button>
              </div>
            ) : (
              filtered.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl px-4 py-3 shadow-sm border border-pink-100 dark:border-pink-900/30 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${typeBg[t.type]}`}>{typeIcon[t.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-white truncate">{t.description}</p>
                    <p className="text-xs text-zinc-400">{t.category} · {t.date}</p>
                  </div>
                  <p className={`text-sm font-bold mr-2 ${typeColor[t.type]}`}>{t.type === "expense" ? "-" : "+"}{fmt(t.amount)}</p>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(t); setModal("edit"); }} className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-zinc-800 text-pink-400 hover:bg-pink-100 transition text-xs flex items-center justify-center">✏️</button>
                    <button onClick={() => deleteTxn(t.id)} className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-zinc-800 text-rose-400 hover:bg-rose-100 transition text-xs flex items-center justify-center">🗑️</button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* ANALYTICS */}
        {tab === "analytics" && (
          <div className="flex flex-col gap-4">
            {/* Year summary cards */}
            <div className="grid grid-cols-3 gap-2">
              {[["Total Income", yearIncome, "💚"], ["Total Expenses", yearExpenses, "🌸"], ["Total Savings", yearSavings, "💙"]].map(([label, amt, icon], i) => (
                <motion.div key={label} variants={cardVariants} custom={i} initial="hidden" animate="visible"
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-3 shadow-lg border border-pink-100 dark:border-pink-900/30 text-center">
                  <p className="text-xl mb-1">{icon}</p>
                  <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider leading-tight">{label}</p>
                  <p className="text-xs font-black text-zinc-800 dark:text-white mt-1">{fmt(amt)}</p>
                </motion.div>
              ))}
            </div>

            {/* Area chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-lg border border-pink-100 dark:border-pink-900/30">
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Income vs Expenses — {filterYear}</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Income" stroke="#34d399" fill="url(#gIncome)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Expenses" stroke="#f472b6" fill="url(#gExpense)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-lg border border-pink-100 dark:border-pink-900/30">
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Expenses by Category — {MONTHS[filterMonth]}</h3>
              {catData.length === 0 ? (
                <div className="text-center py-8 text-sm text-zinc-400">No expense data</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Savings bar per month */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-lg border border-pink-100 dark:border-pink-900/30">
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Monthly Savings — {filterYear}</h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={monthlyData} barSize={10}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Savings" fill="#60a5fa" radius={5} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === "edit" ? "Edit Transaction" : "New Transaction"} onClose={() => { setModal(null); setEditing(null); }}>
          <TransactionForm initial={editing} onSave={saveTxn} onClose={() => { setModal(null); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}