import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  GitFork,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { AnomalySeverity } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SeverityBadge({ sev }: { sev: string }) {
  if (sev === 'high') return <span className="badge-high">High</span>;
  if (sev === 'medium') return <span className="badge-medium">Med</span>;
  return <span className="badge-low">Low</span>;
}

function StatusPill({ status }: { status: string }) {
  if (status === 'ESCALATED') return <span className="status-escalated">Escalated</span>;
  if (status === 'VERIFIED_LEGITIMATE') return <span className="status-verified">Verified</span>;
  if (status === 'RESOLVED') return <span className="status-resolved">Resolved</span>;
  return <span className="status-needs-review">Needs Review</span>;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0 });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const InvestigationsPage: React.FC = () => {
  const { investigations, anomalies, vendors } = useData();

  const [tab, setTab] = useState<'all' | 'open' | 'escalated' | 'resolved'>('all');
  const [severity, setSeverity] = useState<'all' | AnomalySeverity>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'severity' | 'date' | 'amount'>('severity');

  const filtered = useMemo(() => {
    let list = [...investigations];

    // Tab filter
    if (tab === 'open') list = list.filter(i => i.status === 'NEEDS_REVIEW');
    else if (tab === 'escalated') list = list.filter(i => i.status === 'ESCALATED');
    else if (tab === 'resolved') list = list.filter(i => i.status === 'VERIFIED_LEGITIMATE' || i.status === 'RESOLVED');

    // Severity
    if (severity !== 'all') list = list.filter(i => i.severity === severity);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          (i.summaryNote && i.summaryNote.toLowerCase().includes(q))
      );
    }

    // Sort
    const sevOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    if (sortBy === 'severity') {
      list.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
    } else if (sortBy === 'date') {
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sortBy === 'amount') {
      list.sort((a, b) => {
        const aAmt = anomalies.find(an => a.anomalyIds.includes(an.id))?.amountInDispute || 0;
        const bAmt = anomalies.find(an => b.anomalyIds.includes(an.id))?.amountInDispute || 0;
        return bAmt - aAmt;
      });
    }

    return list;
  }, [investigations, anomalies, tab, severity, search, sortBy]);

  const counts = {
    all: investigations.length,
    open: investigations.filter(i => i.status === 'NEEDS_REVIEW').length,
    escalated: investigations.filter(i => i.status === 'ESCALATED').length,
    resolved: investigations.filter(i => i.status === 'VERIFIED_LEGITIMATE' || i.status === 'RESOLVED').length,
  };

  const TABS = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'open', label: `Needs Review (${counts.open})` },
    { key: 'escalated', label: `Escalated (${counts.escalated})` },
    { key: 'resolved', label: `Resolved (${counts.resolved})` },
  ] as const;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-charcoal-900">Investigations</h2>
          <p className="text-[11px] text-charcoal-500 mt-0.5">
            Human-in-the-loop triage for cross-document discrepancies and forensic findings
          </p>
        </div>
        <NavLink
          to="/investigations"
          className="btn-secondary"
        >
          <GitFork className="w-3.5 h-3.5 text-forest-700" />
          Investigations
        </NavLink>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status tabs */}
        <div className="flex items-center gap-0.5 p-0.5 bg-paper-200/80 rounded-lg border border-paper-300 text-xs font-medium">
          {TABS.map(t => (
            <button
              key={t.key}
              id={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'bg-white text-charcoal-900 font-semibold shadow-sm'
                  : 'text-charcoal-500 hover:text-charcoal-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            id="inv-search"
            type="text"
            placeholder="Search findings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-8 w-44"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Severity */}
        <select
          id="sev-filter"
          value={severity}
          onChange={e => setSeverity(e.target.value as any)}
          className="form-input"
        >
          <option value="all">All severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Sort */}
        <select
          id="sort-by"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="form-input"
        >
          <option value="severity">Sort: Severity</option>
          <option value="date">Sort: Date</option>
          <option value="amount">Sort: Amount</option>
        </select>
      </div>

      {/* Result count */}
      <p className="text-[11px] text-charcoal-400">
        Showing {filtered.length} of {investigations.length} investigations
      </p>

      {/* Investigations table */}
      <div className="panel overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-7 h-7 text-forest-600 mx-auto" />
            <p className="text-sm font-semibold text-charcoal-700">No matching findings</p>
            <p className="text-xs text-charcoal-400">Try adjusting the filters or search query</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-paper-200 bg-paper-50">
                <th className="data-cell font-semibold text-[10px] uppercase tracking-wider text-charcoal-400 w-12">Sev</th>
                <th className="data-cell font-semibold text-[10px] uppercase tracking-wider text-charcoal-400">Finding</th>
                <th className="data-cell font-semibold text-[10px] uppercase tracking-wider text-charcoal-400 hidden md:table-cell">Vendor</th>
                <th className="data-cell font-semibold text-[10px] uppercase tracking-wider text-charcoal-400 text-right hidden sm:table-cell">Amount</th>
                <th className="data-cell font-semibold text-[10px] uppercase tracking-wider text-charcoal-400 hidden lg:table-cell">Date</th>
                <th className="data-cell font-semibold text-[10px] uppercase tracking-wider text-charcoal-400">Status</th>
                <th className="data-cell w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const anomaly = anomalies.find(a => inv.anomalyIds.includes(a.id));
                const vendor = vendors.find(v => inv.relatedVendorIds.includes(v.id));
                const amount = anomaly?.amountInDispute;

                return (
                  <tr key={inv.id} className="data-row inv-row group">
                    <td className="data-cell">
                      <SeverityBadge sev={inv.severity} />
                    </td>
                    <td className="data-cell max-w-xs">
                      <NavLink
                        to={`/investigations/${inv.id}`}
                        className="font-semibold text-charcoal-900 group-hover:text-forest-700 transition-colors block truncate"
                      >
                        {inv.title}
                      </NavLink>
                      {anomaly && (
                        <p className="text-[10px] text-charcoal-400 truncate mt-0.5">
                          {anomaly.detectionMethod}
                        </p>
                      )}
                    </td>
                    <td className="data-cell text-charcoal-600 hidden md:table-cell">
                      {vendor ? (
                        <span className="font-medium">{vendor.name}</span>
                      ) : (
                        <span className="text-charcoal-300">—</span>
                      )}
                    </td>
                    <td className="data-cell text-right hidden sm:table-cell">
                      {amount ? (
                        <span className="font-bold text-charcoal-900">
                          {anomaly?.currency} {fmt(amount)}
                        </span>
                      ) : (
                        <span className="text-charcoal-300">—</span>
                      )}
                    </td>
                    <td className="data-cell text-charcoal-500 font-mono text-[11px] hidden lg:table-cell">
                      {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="data-cell">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="data-cell">
                      <NavLink
                        to={`/investigations/${inv.id}`}
                        className="btn-secondary py-1 px-2 text-[10px]"
                      >
                        Inspect <ChevronRight className="w-3 h-3" />
                      </NavLink>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
