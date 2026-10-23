import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, BarChart3, ChevronDown, ChevronRight, CircleDollarSign,
  CreditCard, FileSearch, Landmark, Link2, ScanLine, ShieldCheck, Sparkles,
  Store, TrendingDown, TrendingUp, WalletCards,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { AnomalyRecord, InvestigationRecord } from '../types';

const RANGES = ['This Month', 'Last 30 Days', 'Quarterly', 'Year to Date'];

function money(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
}

function Sparkline({ color, values }: { color: string; values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 76;
    const y = 32 - ((value - min) / Math.max(1, max - min)) * 27;
    return `${x},${y}`;
  }).join(' ');
  return <svg viewBox="0 0 76 34" className="h-9 w-20 overflow-visible" aria-hidden="true"><polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MetricCard({ icon: Icon, label, value, change, tone, values, down = false }: {
  icon: React.ElementType; label: string; value: string; change: string; tone: string; values: number[]; down?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/80 bg-white/90 p-3 shadow-[0_8px_24px_rgba(41,54,88,0.06)] backdrop-blur-sm">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${tone}18`, color: tone }}><Icon className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-500">{label}</p><p className="mt-0.5 text-lg font-extrabold tracking-tight text-slate-900">{value}</p><p className={`text-[10px] font-bold ${down ? 'text-red-500' : 'text-emerald-600'}`}>{down ? '↘' : '↗'} {change}</p></div>
      <Sparkline color={tone} values={values} />
    </div>
  );
}

function ActionQueue({ investigations, anomalies }: { investigations: InvestigationRecord[]; anomalies: AnomalyRecord[] }) {
  const queue = investigations.filter(item => item.status === 'NEEDS_REVIEW' || item.status === 'ESCALATED').slice(0, 2);
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-[0_10px_30px_rgba(41,54,88,0.06)]">
      <div className="flex items-center justify-between"><span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600"><AlertTriangle className="mr-1 inline h-3 w-3" /> Action required: {queue.length} issues</span><span className="text-[9px] font-semibold text-slate-500">Priority 1</span></div>
      <div className="mt-2 space-y-2">
        {queue.map(item => {
          const anomaly = anomalies.find(entry => item.anomalyIds.includes(entry.id));
          return <div key={item.id} className="flex items-center gap-2 rounded-lg bg-[#f6f8fd] p-2"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-100 text-red-500"><ScanLine className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-bold text-slate-900">{item.title}</p><p className="truncate text-[9px] text-slate-500">{money(anomaly?.amountInDispute || 0)} flagged · {anomaly?.category.replaceAll('_', ' ')}</p></div><NavLink to={`/investigations/${item.id}`} className="rounded-lg bg-white px-3 py-1.5 text-[9px] font-bold text-cobalt-600 shadow-sm">Review</NavLink><ChevronRight className="h-3 w-3 text-slate-400" /></div>;
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[9px] text-slate-500"><span>Est. resolution: &lt; 90 seconds</span><NavLink to="/investigations" className="font-bold text-cobalt-600">View all <ArrowRight className="inline h-3 w-3" /></NavLink></div>
    </section>
  );
}

function SpendingTrend({ total }: { total: number }) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_10px_30px_rgba(41,54,88,0.06)]">
      <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xs font-extrabold text-slate-900"><BarChart3 className="h-4 w-4 text-emerald-600" /> Spending Trend</h2><span className="rounded-md border border-slate-200 px-2 py-1 text-[9px] text-slate-500">This Month <ChevronDown className="inline h-3 w-3" /></span></div>
      <div className="mt-3 flex items-center gap-2"><p className="text-xl font-extrabold text-slate-900">{money(total)}</p><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">↗ 12.4%</span></div>
      <svg viewBox="0 0 280 130" className="mt-2 h-32 w-full" aria-label="Spending trend chart">
        <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10b981" stopOpacity=".24" /><stop offset="1" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
        {[22, 57, 92].map(y => <line key={y} x1="0" x2="280" y1={y} y2={y} stroke="#eef1f5" />)}
        <path d="M0 104 C18 62,28 72,42 84 S67 45,83 72 S112 105,132 70 S160 42,180 63 S213 97,235 74 S258 66,278 28 L278 118 L0 118 Z" fill="url(#trendFill)" />
        <path d="M0 104 C18 62,28 72,42 84 S67 45,83 72 S112 105,132 70 S160 42,180 63 S213 97,235 74 S258 66,278 28" fill="none" stroke="#10b981" strokeWidth="2.5" />
        <circle cx="278" cy="28" r="4" fill="#fff" stroke="#10b981" strokeWidth="2" />
        <g className="text-[8px] fill-slate-400"><text x="0" y="129">Oct 1</text><text x="72" y="129">Oct 7</text><text x="153" y="129">Oct 15</text><text x="248" y="129">Oct 23</text></g>
      </svg>
    </section>
  );
}

function RiskDistribution({ anomalies }: { anomalies: AnomalyRecord[] }) {
  const high = anomalies.filter(item => item.severity === 'high').length;
  const medium = anomalies.filter(item => item.severity === 'medium').length;
  const low = anomalies.filter(item => item.severity === 'low').length;
  const total = anomalies.length;
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_10px_30px_rgba(41,54,88,0.06)]">
      <h2 className="flex items-center gap-2 text-xs font-extrabold text-slate-900"><CircleDollarSign className="h-4 w-4 text-emerald-600" /> Risk Distribution</h2>
      <div className="mt-4 flex items-center justify-center gap-5"><div className="relative grid h-28 w-28 place-items-center rounded-full" style={{ background: 'conic-gradient(#fb5b55 0 17%, #ffb32c 17% 58%, #4f7df3 58% 91%, #d7dde6 91%)' }}><div className="grid h-16 w-16 place-items-center rounded-full bg-white text-center"><div><p className="text-lg font-extrabold leading-none">{total}</p><p className="text-[9px] text-slate-500">Flagged</p></div></div></div><div className="space-y-2 text-[9px]">{[["High Risk", high, '#fb5b55'], ["Medium Risk", medium, '#ffb32c'], ["Low Risk", low, '#4f7df3'], ["Review", Math.max(0, total-high-medium-low), '#d7dde6']].map(([label, count, color]) => <div key={String(label)} className="flex min-w-28 items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: String(color) }} /><span className="flex-1 text-slate-500">{label}</span><b>{count}</b></div>)}</div></div>
    </section>
  );
}

export const DashboardPage: React.FC = () => {
  const { company, anomalies, investigations, subscriptions, transactions, vendors, metrics } = useData();
  const [range, setRange] = useState(RANGES[0]);
  const openCount = investigations.filter(item => item.status === 'NEEDS_REVIEW' || item.status === 'ESCALATED').length;
  const totalSpend = transactions.reduce((sum, item) => sum + item.amount, 0);
  const potentialSavings = anomalies.reduce((sum, item) => sum + (item.amountInDispute || 0), 0);
  const overlap = anomalies.find(item => item.category === 'SAAS_OVERLAP');
  const alteration = anomalies.find(item => item.category === 'BENEFICIARY_ALTERATION');
  const prevented = metrics.recoveredAmount + metrics.preventedFraudAmount;
  const subscriptionIssues = subscriptions.filter(item => item.status !== 'active').length;
  const metricCards = useMemo(() => [
    { icon: WalletCards, label: 'Total Spend', value: money(totalSpend), change: '12.4%', tone: '#059669', values: [2,5,7,5,4,7,11,8,13,16,12,20] },
    { icon: BarChart3, label: 'Potential Savings', value: money(potentialSavings), change: '18.2%', tone: '#2563eb', values: [2,6,4,10,7,13,14,10,17,22,18,26] },
    { icon: TrendingDown, label: 'Flagged Transactions', value: String(anomalies.length), change: '6.7%', tone: '#f05252', values: [3,6,9,7,6,10,13,11,9,13,18,19], down: true },
    { icon: Store, label: 'Vendors Monitored', value: String(vendors.length), change: '33.3%', tone: '#7c3aed', values: [2,5,6,10,7,6,9,12,9,8,12,14] },
  ], [anomalies.length, potentialSavings, totalSpend, vendors.length]);

  return (
    <div className="relative isolate mx-auto max-w-[1500px] pb-8 text-slate-800">
      <div className="pointer-events-none absolute -left-24 -right-5 -top-5 -z-10 h-[570px] overflow-hidden rounded-b-[40%] opacity-70" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_18%,rgba(16,185,129,0.08),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0)_22%,rgba(91,233,138,0.10)_45%,rgba(255,255,255,0)_66%)]" />
        {[110,170,235,310,395].map(size => <span key={size} className="absolute left-[48%] top-[18%] rounded-full border border-emerald-500/10" style={{ width: size, height: size, transform: 'translate(-50%, -50%)' }} />)}
        <span className="absolute left-[48%] top-[18%] h-px w-[52%] origin-left rotate-[-28deg] bg-gradient-to-r from-emerald-400/15 to-transparent" />
      </div>

      <div className="relative z-10">
        <header className="dashboard-header-row flex flex-col gap-4">
          <div><p className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" /> Live radar synchronized · refreshed 2m ago</p><div className="flex items-end gap-10"><h1 className="text-3xl font-extrabold leading-none tracking-tight text-slate-950">Your Business<br />Money Radar</h1><div><p className="text-sm font-bold leading-5 text-cobalt-600">Good morning,<br />Sarah</p><p className="mt-1 text-[9px] text-slate-500">Here’s what we found today.</p></div></div></div>
          <div className="flex gap-2"><NavLink to="/settings" className="btn-secondary bg-white/90"><Link2 className="h-3.5 w-3.5" /> Link Bank Feed</NavLink><NavLink to="/documents" className="rounded-lg px-4 py-2 text-xs font-bold text-white shadow-lg" style={{ backgroundColor: '#2B59FF', boxShadow: '0 8px 20px rgba(43,89,255,.22)' }}><ScanLine className="mr-1.5 inline h-3.5 w-3.5" /> Scan New Bill</NavLink></div>
        </header>

        <div className="mt-4 flex max-w-lg gap-1 rounded-xl border border-slate-200/70 bg-white/60 p-1 shadow-sm backdrop-blur-sm">{RANGES.map(label => <button key={label} onClick={() => setRange(label)} className={`flex-1 rounded-lg px-3 py-2 text-[9px] font-bold transition ${range === label ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-200' : 'text-slate-600 hover:bg-white'}`}>{label}</button>)}</div>

        <div className="dashboard-metrics-grid mt-4 grid gap-3">{metricCards.map(card => <MetricCard key={card.label} {...card} />)}</div>

        <div className="dashboard-content-grid mt-4 grid gap-4">
          <main className="space-y-4">
            <div className="dashboard-primary-grid grid gap-3">
              <section className="relative min-h-52 overflow-hidden rounded-xl p-5 text-white shadow-[0_20px_38px_rgba(37,99,235,0.25)]" style={{ background: 'linear-gradient(135deg, #2B59FF 0%, #162F9C 100%)' }}><div className="absolute -right-10 -top-14 h-48 w-48 rounded-full border-[24px] border-white/5" /><span className="rounded-full bg-white/15 px-2 py-1 text-[9px] font-bold"><ShieldCheck className="mr-1 inline h-3 w-3" /> Business Safe &amp; Optimised</span><p className="mt-7 text-xs text-white/75">Net Recovered &amp; Prevented</p><div className="flex items-center gap-3"><p className="mt-1 text-4xl font-extrabold">{money(prevented)}</p><span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-[10px] font-extrabold text-emerald-700"><span>↗<br />18.4%</span></span></div><p className="mt-2 max-w-xs text-xs text-white/75">{openCount} active controls stopped money leakage during {range.toLowerCase()}.</p><div className="mt-6 flex gap-2 text-[9px] font-bold"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5"><Sparkles className="mr-1 inline h-3 w-3" /> Auto-Protect Active</span><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5"><CreditCard className="mr-1 inline h-3 w-3" /> {company.connectedAccounts.length} Cards Monitored</span></div></section>
              <div><ActionQueue investigations={investigations} anomalies={anomalies} /></div>
            </div>

            <div className="flex items-center justify-between pt-1"><h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950"><span className="h-2.5 w-2.5 rounded-full bg-cobalt-600" /> Where We Save You Money &amp; Discrepancies</h2><NavLink to="/investigations" className="text-[9px] font-bold text-cobalt-600">Deep Audit Logs <ArrowRight className="inline h-3 w-3" /></NavLink></div>

            <section className="rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_10px_30px_rgba(41,54,88,0.05)]"><div className="flex flex-wrap items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-cobalt-50 text-cobalt-600"><Link2 className="h-5 w-5" /></div><div className="min-w-[250px] flex-1"><h3 className="text-sm font-extrabold text-slate-900">Double Subscriptions &amp; Overlapping Seats</h3><p className="text-[10px] text-slate-500">Caught {subscriptionIssues || 3} SaaS products silently multi-billing across duplicated accounts.</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-[9px] font-bold text-emerald-700">Saved {money(overlap?.amountInDispute || 4560)}</span><NavLink to="/investigations" className="rounded-full bg-cobalt-50 px-3 py-1 text-[9px] font-bold text-cobalt-600">View Duplicates <ChevronRight className="inline h-3 w-3" /></NavLink><ChevronDown className="h-4 w-4 text-slate-500" /></div><div className="mt-3 rounded-lg bg-[#f5f7fc] p-3"><div className="flex justify-between text-[9px] font-bold"><span>Corporate Card Auditing Coverage</span><span>100% Audited</span></div><div className="mt-2 h-1.5 rounded-full bg-emerald-500" /><p className="mt-2 text-[9px] text-slate-500">Notion, Figma, InVision and connected vendor accounts</p></div></section>

            <section className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_10px_30px_rgba(41,54,88,0.05)]"><div className="grid h-10 w-10 place-items-center rounded-lg bg-red-100 text-red-500"><FileSearch className="h-5 w-5" /></div><div className="flex-1"><h3 className="text-sm font-extrabold text-slate-900">Fake &amp; Altered Invoices Intercepted</h3><p className="text-[10px] text-slate-500">Detected manipulated invoices using visual &amp; data forensics.</p></div><p className="text-xl font-extrabold text-red-600">{money(alteration?.amountInDispute || metrics.preventedFraudAmount)}</p><span className="text-[9px] text-slate-500">Potential loss prevented</span><ChevronRight className="h-4 w-4 text-slate-500" /></section>
          </main>

          <aside className="space-y-4"><SpendingTrend total={totalSpend} /><RiskDistribution anomalies={anomalies} /></aside>
        </div>
      </div>
    </div>
  );
};