import React, { useState } from 'react';
import {
  Settings,
  Key,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  Link2,
  RefreshCw,
  Eye,
  EyeOff,
  Database,
  Building,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const SettingsPage: React.FC = () => {
  const { company, resetToBaseline, saveApiKey, isLiveApi } = useData();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleTestAndSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      setKeyFeedback({ success: false, msg: 'Please provide a non-empty Gemini API key.' });
      return;
    }

    setIsTestingKey(true);
    setKeyFeedback(null);
    try {
      const res = await saveApiKey(apiKeyInput.trim());
      if (res.success) {
        setKeyFeedback({ success: true, msg: res.message || 'Gemini 3.8 Flash activated for live multimodal parsing.' });
      } else {
        setKeyFeedback({ success: false, msg: res.error || 'Failed to verify API key with Google Gen AI.' });
      }
    } catch (err: any) {
      setKeyFeedback({ success: false, msg: err.message || 'Error communicating with server.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetToBaseline();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="pb-4 border-b border-paper-300">
        <h2 className="text-xl font-extrabold text-charcoal-900 tracking-tight">
          System Settings & Forensics Configuration
        </h2>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Configure Google Gemini multimodal extraction credentials, manage bank feed connections, and audit safeguards.
        </p>
      </div>

      {/* Gemini API Key Configuration Card */}
      <div className="p-6 rounded-2xl bg-white border border-paper-300 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-paper-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-forest-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Google Gemini Multimodal API Key</h3>
              <p className="text-[11px] text-charcoal-500">Powers live invoice OCR, DPI inspection, and remittance extraction</p>
            </div>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            keyFeedback?.success
              ? 'bg-forest-100 text-forest-800 border border-forest-600/30'
              : 'bg-paper-100 text-charcoal-700 border border-paper-300'
          }`}>
            {keyFeedback?.success ? 'Live Gemini 3.8 Flash' : 'Synthetic Demo Mode'}
          </span>
        </div>

        <p className="text-xs text-charcoal-600 leading-relaxed">
          AuditLens functions in <strong>Synthetic Demo Mode</strong> using our deterministic forensic rule engine. To enable live multimodal extraction for real invoices and receipt photos, provide your Gemini API key below.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-charcoal-700 block">
            Gemini API Key:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full px-3 py-2 pr-10 rounded-lg border border-paper-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={handleTestAndSaveKey}
              disabled={isTestingKey || !apiKeyInput.trim()}
              className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-subtle disabled:opacity-50 transition-colors"
            >
              {isTestingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5 text-lime-accent" />}
              <span>{isTestingKey ? 'Verifying...' : 'Save & Test Key'}</span>
            </button>
          </div>
        </div>

        {keyFeedback && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            keyFeedback.success ? 'bg-forest-50 border border-forest-600/30 text-forest-900' : 'bg-alert-redBg border border-alert-redBorder text-alert-red'
          }`}>
            {keyFeedback.success ? <CheckCircle2 className="w-4 h-4 text-forest-700" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{keyFeedback.msg}</span>
          </div>
        )}
      </div>

      {/* Connected Financial Data Feeds */}
      <div className="p-6 rounded-2xl bg-white border border-paper-300 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-forest-700" />
          <span>Active Ingestion Feeds & Banking Connectors</span>
        </h3>

        <div className="space-y-3 text-xs">
          {company.connectedAccounts.map((acc, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-paper-50 border border-paper-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-white text-charcoal-700 flex items-center justify-center border border-paper-300">
                  <Lock className="w-3.5 h-3.5 text-forest-700" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal-900">{acc.name}</h4>
                  <p className="text-[11px] text-charcoal-500">Plaid Read-Only Token · Last synced 2m ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-forest-800">Synced</span>
              </div>
            </div>
          ))}

          <div className="p-3.5 rounded-xl bg-paper-50 border border-paper-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-white text-charcoal-700 flex items-center justify-center border border-paper-300">
                <Building className="w-3.5 h-3.5 text-cobalt-600" />
              </div>
              <div>
                <h4 className="font-bold text-charcoal-900">Google Workspace Email Forwarding</h4>
                <p className="text-[11px] text-charcoal-500">receipts@auditlens.com · DKIM Verification Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-forest-800">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="p-6 rounded-2xl bg-white border border-paper-300 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-paper-200">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900">Reset Demo Workspace</h3>
            <p className="text-[11px] text-charcoal-500">Restore PixelCraft Studio dataset to initial baseline</p>
          </div>
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-lg border border-paper-300 bg-white hover:bg-paper-100 text-charcoal-800 font-semibold text-xs flex items-center gap-1.5 shadow-subtle transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Baseline Data</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-lg bg-forest-50 border border-forest-600/30 text-forest-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-700" />
            <span>PixelCraft Studio demo data successfully restored to pristine state.</span>
          </div>
        )}

        <div className="text-[11px] text-charcoal-500 leading-relaxed">
          Useful during hackathon judging and live demonstrations. Resets all invoices, dual-card CloudBox charges, Apex Logistics remittance redirection finding, and InVision zombie licenses.
        </div>
      </div>

      {/* Security Architecture Statement */}
      <div className="p-6 rounded-2xl bg-paper-50 border border-paper-300 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-charcoal-900">
          <ShieldCheck className="w-4 h-4 text-forest-700" />
          <span>AuditLens Zero Disruption & Bank-Grade Security Policy</span>
        </div>
        <p className="text-charcoal-600 leading-relaxed">
          AuditLens operates on read-only banking feeds. No external accounts are modified, and no subscription cancellations or payment holds are executed without explicit, authenticated user authorization. All ledger hashes are calculated locally with SHA-256 integrity verification.
        </p>
      </div>
    </div>
  );
};
