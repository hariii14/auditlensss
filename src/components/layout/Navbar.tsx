import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Upload,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  onOpenIngest: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/investigations': 'Investigations',
  '/documents': 'Document Vault',
  '/transactions': 'Transactions',
  '/vendors': 'Vendors',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenIngest }) => {
  const location = useLocation();
  const { anomalies, metrics, resetToBaseline, isLiveApi, documents } = useData();

  const pageKey = Object.keys(PAGE_TITLES).find(k =>
    k === '/' ? location.pathname === '/' : location.pathname.startsWith(k)
  );
  const pageTitle = pageKey ? PAGE_TITLES[pageKey] : 'AuditLens';

  const highRiskCount = anomalies.filter(
    a => a.severity === 'high' && (a.status === 'NEEDS_REVIEW' || a.status === 'ESCALATED')
  ).length;

  const lastDoc = documents[0];
  const lastUpdated = lastDoc
    ? new Date(lastDoc.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <header className="h-12 border-b border-paper-300 bg-white/90 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: breadcrumb + page title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[11px] text-charcoal-400 font-medium hidden sm:inline">PixelCraft Studio</span>
        <span className="text-charcoal-300 hidden sm:inline">/</span>
        <h1 className="text-sm font-bold text-charcoal-900 truncate">{pageTitle}</h1>

        {/* Sentinel pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-forest-50 border border-forest-600/20 text-[10px] text-forest-800 font-medium ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-forest-600 pulse-dot" />
          Sentinel Active
        </div>
      </div>

      {/* Right: status + actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Last synced */}
        {lastUpdated && (
          <span className="hidden lg:inline text-[11px] text-charcoal-400 font-medium">
            Updated {lastUpdated}
          </span>
        )}

        {/* Mode pill */}
        <NavLink
          to="/settings"
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold border border-paper-300 bg-paper-100 hover:bg-paper-200 text-charcoal-600 transition-colors"
          title="Configure Gemini API Key in Settings"
        >
          {isLiveApi ? (
            <>
              <Zap className="w-3 h-3 text-forest-700" />
              <span>Live AI</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-charcoal-500" />
              <span>Demo Mode</span>
            </>
          )}
        </NavLink>

        {/* High risk alert */}
        {highRiskCount > 0 && (
          <NavLink
            to="/investigations"
            className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{highRiskCount} High Risk</span>
          </NavLink>
        )}

        {/* Reset */}
        <button
          onClick={resetToBaseline}
          className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-200 rounded transition-colors"
          title="Reset to baseline demo data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Upload CTA */}
        <button
          id="navbar-upload-btn"
          onClick={onOpenIngest}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-subtle transition-colors"
        >
          <Upload className="w-3 h-3" />
          <span className="hidden sm:inline">Upload / Scan</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </div>
    </header>
  );
};
