import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  GitFork,
  FileText,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Settings,
  Plus,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  onOpenIngest: () => void;
}

const NAV_ITEMS = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Investigations', path: '/investigations', icon: ShieldAlert, hasBadge: true },
  { label: 'Documents', path: '/documents', icon: FileText },
  { label: 'Transactions', path: '/transactions', icon: CreditCard },
  { label: 'Vendors', path: '/vendors', icon: Building2 },
  { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
];

export const Sidebar: React.FC<SidebarProps> = ({ onOpenIngest }) => {
  const { company, anomalies, metrics } = useData();
  const highRiskCount = anomalies.filter(
    a => a.severity === 'high' && (a.status === 'NEEDS_REVIEW' || a.status === 'ESCALATED')
  ).length;

  return (
    <aside className="hidden w-56 border-r border-paper-300 bg-paper-50 md:flex flex-col h-screen sticky top-0 select-none shrink-0">
      {/* Brand */}
      <div className="px-4 py-3.5 border-b border-paper-300">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-forest-700 flex items-center justify-center text-white shadow-subtle group-hover:bg-forest-800 transition-colors shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <circle cx="12" cy="11" r="2.5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-charcoal-900">AuditLens</span>
              <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-lime-soft text-forest-900 border border-lime-accent/40 tracking-wider">AI</span>
            </div>
            <p className="text-[10px] text-charcoal-400 font-medium leading-none mt-0.5">Financial Forensics</p>
          </div>
        </NavLink>

        {/* Workspace pill */}
        <div className="mt-3 px-2.5 py-2 rounded-lg bg-white border border-paper-300 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-forest-100 text-forest-800 flex items-center justify-center text-[10px] font-bold shrink-0">
              PC
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-charcoal-800 truncate leading-tight">{company.name}</p>
              <p className="text-[10px] text-charcoal-400 leading-tight">{company.employeeCount} employees</p>
            </div>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Bank feeds synced" />
        </div>
      </div>

      {/* Upload CTA */}
      <div className="px-3 pt-3 pb-1">
        <button
          id="sidebar-upload-btn"
          onClick={onOpenIngest}
          className="w-full py-2 px-3 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-subtle transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload / Scan</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 px-2 py-1.5 mt-1">Workspace</p>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                isActive
                  ? 'bg-forest-100 text-forest-900 font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-paper-200/80'
              } ${('isSpecial' in item && (item as any).isSpecial) ? 'border border-dashed border-forest-600/30' : ''}`
            }
          >
            <div className="flex items-center gap-2">
              <item.icon className={`w-3.5 h-3.5 shrink-0 ${('isSpecial' in item && (item as any).isSpecial) ? 'text-forest-700' : ''}`} />
              <span>{item.label}</span>
            </div>
            {item.hasBadge && highRiskCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white leading-none">
                {highRiskCount}
              </span>
            )}
          </NavLink>
        ))}

        <div className="border-t border-paper-200 pt-1 mt-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                isActive
                  ? 'bg-forest-100 text-forest-900 font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-paper-200/80'
              }`
            }
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* Bottom health score */}
      <div className="p-3 border-t border-paper-300">
        <div className="p-2.5 rounded-lg bg-white border border-paper-300">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-charcoal-600 font-medium">Audit Health</span>
            <span className="font-bold text-forest-700">{metrics.overallScore.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-paper-200 h-1 rounded-full overflow-hidden">
            <div
              className="bg-forest-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.overallScore}%` }}
            />
          </div>
          <p className="text-[10px] text-charcoal-400 mt-1.5">
            {metrics.reconciledCount}/{metrics.totalTransactions} transactions reconciled
          </p>
        </div>
      </div>
    </aside>
  );
};
