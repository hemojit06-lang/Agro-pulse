
import React, { useState, useMemo, useEffect } from 'react';
import { WeeklyLogEntry, FarmFinancials } from './types';
import { parseFarmLog } from './services/geminiService';
import { StatCard } from './components/StatCard';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Droplet, 
  Activity, 
  Settings, 
  ClipboardList, 
  Plus, 
  Loader2,
  Tractor,
  HeartPulse,
  ChevronRight,
  BarChart3,
  Calendar,
  History,
  AlertCircle,
  ArrowUpRight,
  Wallet,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';

const App: React.FC = () => {
  const [logs, setLogs] = useState<WeeklyLogEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('agro_pulse_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('agro_pulse_logs', JSON.stringify(logs));
  }, [logs]);

  const totals = useMemo(() => {
    const initial: FarmFinancials = {
      revenue: { morningMilk: 0, eveningMilk: 0, miscSales: 0 },
      expenses: { feed: 0, healthcare: 0, operations: 0 },
      credit: { owed: 0, collected: 0 }
    };

    return logs.reduce((acc, log) => ({
      revenue: {
        morningMilk: acc.revenue.morningMilk + log.parsedData.revenue.morningMilk,
        eveningMilk: acc.revenue.eveningMilk + log.parsedData.revenue.eveningMilk,
        miscSales: acc.revenue.miscSales + log.parsedData.revenue.miscSales,
      },
      expenses: {
        feed: acc.expenses.feed + log.parsedData.expenses.feed,
        healthcare: acc.expenses.healthcare + log.parsedData.expenses.healthcare,
        operations: acc.expenses.operations + log.parsedData.expenses.operations,
      },
      credit: {
        owed: acc.credit.owed + log.parsedData.credit.owed,
        collected: acc.credit.collected + log.parsedData.credit.collected,
      }
    }), initial);
  }, [logs]);

  const financialSnapshot = useMemo(() => {
    const totalRev = totals.revenue.morningMilk + totals.revenue.eveningMilk + totals.revenue.miscSales;
    const totalExp = totals.expenses.feed + totals.expenses.healthcare + totals.expenses.operations;
    const profit = totalRev - totalExp;
    return { totalRev, totalExp, profit };
  }, [totals]);

  const handleProcessLog = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await parseFarmLog(inputText);
      const newEntry: WeeklyLogEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        rawText: inputText,
        parsedData: parsed
      };
      setLogs(prev => [...prev, newEntry]);
      setInputText('');
    } catch (err: any) {
      setError(err.message || "Log analysis failed. Please verify currency formats.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    if (confirm("Reset current monthly data? This cannot be undone.")) {
      setLogs([]);
      localStorage.removeItem('agro_pulse_logs');
    }
  };

  const milkChartData = [
    { name: 'Milk Comparison', Morning: totals.revenue.morningMilk, Evening: totals.revenue.eveningMilk }
  ];

  const totalExpense = financialSnapshot.totalExp || 1; // Avoid divide by zero
  const expenseProgress = [
    { label: 'Animal Feed', value: totals.expenses.feed, pct: (totals.expenses.feed / totalExpense) * 100, icon: <Tractor size={14} />, color: 'bg-cyan-500' },
    { label: 'Healthcare', value: totals.expenses.healthcare, pct: (totals.expenses.healthcare / totalExpense) * 100, icon: <HeartPulse size={14} />, color: 'bg-blue-500' },
    { label: 'Operations', value: totals.expenses.operations, pct: (totals.expenses.operations / totalExpense) * 100, icon: <Zap size={14} />, color: 'bg-indigo-500' },
  ];

  const isInitial = logs.length === 0;

  return (
    <div className="min-h-screen pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation / Header */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-4 md:px-8 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 glow-cyan">
              <BarChart3 className="text-cyan-400" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">AgroPulse <span className="text-cyan-500/50 font-medium">Dashboard X</span></h1>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <div className={`w-1.5 h-1.5 rounded-full ${isInitial ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                {isInitial ? 'Status: NIL (Ready)' : `Status: Active / ${logs.length} Wks`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-medium">
               <Calendar size={14} />
               {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
             </div>
             <button 
               onClick={clearData}
               className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
             >
               Reset Base
             </button>
             <div className="h-6 w-[1px] bg-white/10" />
             <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
               <ShieldCheck size={14} className="text-cyan-400" />
               <span className="text-[10px] font-bold text-slate-300">SECURE ANALYTICS</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* SIDEBAR: INPUT & LOGS */}
        <div className="lg:col-span-4 space-y-8">
          <section className="glass rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <ClipboardList size={18} className="text-cyan-400" />
                  Weekly Data Input
                </h2>
                <div className="px-2 py-0.5 bg-cyan-500/10 rounded text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                  AUTO-PARSE
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste logs here... e.g. 'Morning milk 450rs, evening milk 400rs, feed 200rs...'"
                    className="w-full h-44 bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all resize-none text-sm font-medium"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                    <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-400 font-medium leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleProcessLog}
                  disabled={isLoading || !inputText.trim()}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-30 text-white font-bold rounded-2xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                      Update Dashboard
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <History size={14} />
              Recent Monthly Logs
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {logs.length === 0 ? (
                <div className="p-10 border border-dashed border-white/10 rounded-3xl text-center text-slate-600 text-sm font-medium italic">
                  Waiting for initial entry...
                </div>
              ) : (
                logs.slice().reverse().map((log, idx) => (
                  <div key={log.id} className="glass p-4 rounded-2xl border-white/5 hover:border-cyan-500/30 transition-colors cursor-default group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-cyan-500/50 uppercase font-mono">#{logs.length - idx} WEEKLY RECORD</span>
                      <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic group-hover:text-slate-300 transition-colors">"{log.rawText}"</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* MAIN DASHBOARD PANEL */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* PHASE 1: FINANCIAL SNAPSHOT */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 text-xs font-bold text-cyan-400 tracking-[0.3em] uppercase">
              <span className="px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">Phase 1</span>
              Financial Snapshot
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard label="Revenue" value={financialSnapshot.totalRev} icon={<TrendingUp size={16} />} colorClass="text-cyan-400" />
              <StatCard label="Expenses" value={financialSnapshot.totalExp} icon={<TrendingDown size={16} />} colorClass="text-slate-400" />
              <StatCard 
                label="Net Profit" 
                value={financialSnapshot.profit} 
                icon={<Activity size={16} />} 
                colorClass={financialSnapshot.profit >= 0 ? "text-cyan-400" : "text-rose-500"}
                prefix={financialSnapshot.profit >= 0 ? "+₹" : "-₹"}
              />
              <StatCard label="Total Credit" value={totals.credit.owed} icon={<Wallet size={16} />} colorClass="text-amber-400" />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* PHASE 2: EXPENSE ANALYSIS */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-xs font-bold text-blue-400 tracking-[0.3em] uppercase">
                <span className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">Phase 2</span>
                Expense Analysis
              </div>
              <div className="glass rounded-[2rem] p-8 min-h-[440px] shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <Settings size={60} className="text-white/5 rotate-12" />
                </div>
                <h4 className="text-white font-bold mb-8 flex items-center gap-2">
                  <TrendingDown size={18} className="text-blue-500" />
                  Spending Distribution
                </h4>
                
                <div className="space-y-10">
                  {expenseProgress.map((item, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.color}/10 text-white`}>
                            {item.icon}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-200 block">{item.label}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.pct.toFixed(0)}% of total</span>
                          </div>
                        </div>
                        <span className="text-white font-mono font-bold">₹{item.value.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: isInitial ? '0%' : `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Monthly Burn Rate</span>
                  <span className="text-sm text-white font-bold font-mono">₹{(financialSnapshot.totalExp / 30).toFixed(0)}/day</span>
                </div>
              </div>
            </section>

            {/* PHASE 3: SALES PERFORMANCE */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-xs font-bold text-cyan-400 tracking-[0.3em] uppercase">
                <span className="px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">Phase 3</span>
                Sales Trends
              </div>
              <div className="glass rounded-[2rem] p-8 min-h-[440px] flex flex-col shadow-inner">
                <h4 className="text-white font-bold mb-8 flex items-center gap-2">
                  <Droplet size={18} className="text-cyan-500" />
                  Milk Revenue Balance
                </h4>
                
                <div className="flex-1 min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={milkChartData} barGap={12}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" hide />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      />
                      <Bar dataKey="Morning" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={40} />
                      <Bar dataKey="Evening" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                      <Legend 
                         verticalAlign="bottom" 
                         align="center" 
                         iconType="circle" 
                         wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                    <span className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest block mb-1">Total AM</span>
                    <span className="text-lg font-bold font-mono text-white">₹{totals.revenue.morningMilk.toLocaleString()}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                    <span className="text-[10px] text-blue-500/70 font-bold uppercase tracking-widest block mb-1">Total PM</span>
                    <span className="text-lg font-bold font-mono text-white">₹{totals.revenue.eveningMilk.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* PHASE 4: CREDIT WATCHLIST */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 text-xs font-bold text-amber-400 tracking-[0.3em] uppercase">
              <span className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">Phase 4</span>
              Credit Watchlist
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="glass rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-full md:w-1/3 text-center md:text-left">
                  <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <CreditCard size={14} />
                    Debt Recovery Rate
                  </div>
                  <div className="text-5xl font-bold text-white font-mono mb-2">
                    {totals.credit.owed + totals.credit.collected > 0 
                      ? Math.round((totals.credit.collected / (totals.credit.owed + totals.credit.collected)) * 100)
                      : 0}<span className="text-amber-500">%</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Efficiency of customer collections for the current month.
                  </p>
                </div>

                <div className="flex-1 w-full space-y-6">
                  <div className="h-3 w-full bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      style={{ width: `${totals.credit.owed + totals.credit.collected > 0 ? (totals.credit.collected / (totals.credit.owed + totals.credit.collected)) * 100 : 0}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Current Owed</span>
                        <ArrowUpRight size={14} className="text-amber-500" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-white">₹{totals.credit.owed.toLocaleString()}</div>
                    </div>
                    <div className="p-5 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 group hover:bg-cyan-500/10 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest">Recovered</span>
                        <TrendingUp size={14} className="text-cyan-400" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-cyan-400">₹{totals.credit.collected.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer / Credits */}
      <footer className="max-w-7xl mx-auto mt-20 px-8 text-center">
        <div className="h-[1px] w-full bg-white/5 mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} AgroPulse Analytics Engine
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em]">Privacy Shield</span>
            <span className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em]">Cloud Backup</span>
            <span className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em]">v2.5.0-STABLE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
