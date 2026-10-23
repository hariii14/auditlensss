import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  GitFork,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Lock,
  Layers,
  Sparkles,
  TrendingDown,
  Building,
  CreditCard,
  Mail,
  ChevronRight,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper-100 text-charcoal-800 flex flex-col selection:bg-forest-100 selection:text-forest-900">
      {/* Top Editorial Bar */}
      <header className="border-b border-paper-300 bg-paper-50/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-white font-bold shadow-subtle">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-charcoal-900">AuditLens</span>
            <span className="hidden sm:inline text-[11px] font-semibold text-charcoal-500 border-l border-paper-300 pl-3">
              Autonomous Financial Forensics
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/dashboard"
              className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-subtle transition-all active:scale-[0.98]"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 border-b border-paper-300 bg-gradient-to-b from-paper-50 via-paper-100 to-paper-100">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-600/30 text-forest-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-lime-accent fill-forest-700" />
            <span>Autonomous Multimodal Forensics for SMBs & Agencies</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.12]">
            Every transaction has a story.<br className="hidden sm:inline" />
            <span className="text-forest-700 underline decoration-lime-accent decoration-wavy underline-offset-8">
              Find what doesn't add up.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-charcoal-600 max-w-2xl mx-auto font-normal leading-relaxed">
            AuditLens connects your bank feeds, PDF invoices, mobile receipt photos, and vendor emails to automatically uncover silent SaaS overlaps, wire redirection fraud, and tax leakage in plain English.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <NavLink
              to="/dashboard"
              className="px-6 py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm flex items-center gap-2 shadow-card hover:shadow-elevated transition-all"
            >
              <span>Explore Demo Workspace (PixelCraft Studio)</span>
              <ArrowRight className="w-4 h-4 text-lime-accent" />
            </NavLink>
            <NavLink
              to="/investigations"
              className="px-5 py-3 rounded-xl bg-white hover:bg-paper-50 text-charcoal-800 border border-paper-300 font-semibold text-sm flex items-center gap-2 shadow-subtle transition-all"
            >
              <GitFork className="w-4 h-4 text-forest-700" />
              <span>View Investigations</span>
            </NavLink>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-charcoal-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-700" /> Zero unauthorized cancellations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-700" /> Plain-English explainable findings
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-700" /> 100% Tax & Audit Provenance
            </span>
          </div>
        </div>

        {/* Hero Interactive Forensics Preview */}
        <div className="max-w-5xl mx-auto mt-14 bg-white rounded-2xl shadow-elevated border border-paper-300 p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-paper-300 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-alert-red animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                Live Forensic Trace Preview · Apex Logistics Case #INV-8821
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-alert-redBg border border-alert-redBorder text-alert-red text-xs font-bold">
              High Severity Alert Triggered
            </span>
          </div>

          {/* 3-Column Visual Stream Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Stream 1: Inbound Invoice */}
            <div className="rounded-xl border border-paper-300 bg-paper-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-charcoal-500 uppercase flex items-center gap-1.5">
                  <FileSearch className="w-3.5 h-3.5 text-charcoal-700" /> PDF Invoice Received
                </span>
                <span className="text-[10px] font-mono text-charcoal-400">14-Oct-2026</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-paper-200 text-xs space-y-1">
                <p className="font-bold text-charcoal-900">Apex Logistics International</p>
                <p className="text-charcoal-600">Invoice: INV-8821 · Total: <strong className="text-charcoal-900">₹5,000.00</strong></p>
                <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-mono">
                  Remit to: Cayman Trust (*9012)
                  <span className="block text-[10px] text-red-600 font-sans font-semibold mt-0.5">
                    ⚠ Altered from verified Chase *4491
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Font DPI mismatch (Arial 144 DPI over Helvetica 300 DPI)
              </p>
            </div>

            {/* Stream 2: Bank Transaction */}
            <div className="rounded-xl border border-paper-300 bg-paper-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-charcoal-500 uppercase flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-charcoal-700" /> Outgoing Bank Wire
                </span>
                <span className="text-[10px] font-mono text-charcoal-400">16-Oct-2026</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-paper-200 text-xs space-y-1">
                <p className="font-bold text-charcoal-900">Chase Commercial Checking *4491</p>
                <p className="text-charcoal-600">Pending Wire: <strong className="text-alert-red font-bold">₹8,000.00</strong></p>
                <p className="text-[11px] text-charcoal-500">Ref: WIRE-PENDING-99042</p>
                <div className="mt-2 p-2 rounded bg-red-50 border border-red-200 text-[11px] text-red-800 font-semibold">
                  Amount Discrepancy: +₹3,000.00 excess above invoice total
                </div>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Matched via Entity Reconciler (Tolerance exceeded by 60%)
              </p>
            </div>

            {/* Stream 3: Connected Anomaly & Plain-English Explanations */}
            <div className="rounded-xl border border-alert-redBorder bg-alert-redBg/40 p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-alert-red uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Anomaly Identified
                  </span>
                  <span className="text-[10px] font-bold text-alert-red">Rules #3 & #5</span>
                </div>
                <h4 className="text-xs font-bold text-charcoal-900 leading-snug">
                  Beneficiary Alteration & Wire Amount Mismatch
                </h4>
                <p className="text-[11px] text-charcoal-600 mt-2 leading-relaxed">
                  Notice spelling: sender is <code className="bg-white px-1 py-0.5 rounded text-red-600">@apex-loglstics.com</code> (letter 'l' instead of 'i'). Funds redirected to offshore Cayman Trust.
                </p>
              </div>

              <div className="pt-2 border-t border-alert-redBorder/60">
                <NavLink
                  to="/investigations/inv-2"
                  className="w-full py-2 px-3 rounded-lg bg-alert-red text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-700 transition-colors"
                >
                  <span>Review Investigation & Pause Wire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Problem Vectors SMBs Face */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            SMBs bleed ₹8,000 to ₹25,000 every year silently.
          </h2>
          <p className="text-sm text-charcoal-600">
            Manual cross-referencing between corporate credit cards, PDFs, and emails is too time-consuming. Attackers and SaaS vendors know this.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white border border-paper-300 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-alert-red flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="font-bold text-sm text-charcoal-900">Typosquatting & Wire Fraud</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Spoofed vendor domains with altered remittance info paste onto real PDF templates. Standard OCR misses font DPI changes and off-shore bank shifts.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-paper-300 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-alert-amber flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="font-bold text-sm text-charcoal-900">Silent SaaS Overlap</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Central team pays for Figma Enterprise on Amex while design leads expense Figma Pro on Chase cards. Double-billed every month without anyone noticing.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-paper-300 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="font-bold text-sm text-charcoal-900">Zombie Subscriptions</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Enterprise software auto-renewing month after month with 0 employee logins in 90+ days. Capital vanishes into unused software seats.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-paper-300 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cobalt-50 text-cobalt-600 flex items-center justify-center font-bold">
              04
            </div>
            <h3 className="font-bold text-sm text-charcoal-900">Lost Deductions & Tax Scrambling</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Paper receipts lost in pockets, email invoices buried in inboxes. Business owners scramble at tax time and forfeit valid IRS write-offs.
            </p>
          </div>
        </div>
      </section>

      {/* The Evidence Trace Differentiator */}
      <section className="py-20 px-6 bg-paper-50 border-y border-paper-300">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
              <GitFork className="w-3.5 h-3.5" />
              <span>Signature Evidence Trace</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
              Trace exactly why an anomaly was raised. Never guess.
            </h2>
            <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
              Unlike black-box cybersecurity tools with cryptic hash codes, AuditLens visualizes every connection. Trace vendors, invoices, bank transactions, emails, and anomaly rules through an interactive evidence trace.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs font-bold mt-0.5">✓</div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal-900">Vendor Investigation Mode</h4>
                  <p className="text-xs text-charcoal-600">Isolate CloudBox, Figma, or Apex to explore their entire billing ecosystem.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs font-bold mt-0.5">✓</div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal-900">Anomaly Trace Mode</h4>
                  <p className="text-xs text-charcoal-600">Select any discrepancy to light up the exact evidence path supporting the finding.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs font-bold mt-0.5">✓</div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal-900">Original Document Excerpts</h4>
                  <p className="text-xs text-charcoal-600">Inspect the extracted remittance block side-by-side with historical records.</p>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <NavLink
                to="/investigations"
                className="px-5 py-2.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-subtle"
              >
                <span>Launch Investigations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-paper-300 p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-paper-200">
              <span className="font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-accent ring-2 ring-forest-700"></span>
                Trace Visualizer
              </span>
              <span className="text-charcoal-500 font-mono text-[11px]">8 Node Types · 8 Relationship Types</span>
            </div>

            {/* Visual Trace Mockup */}
            <div className="bg-paper-100 rounded-xl p-6 border border-paper-200 relative overflow-hidden min-h-[300px] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-lg bg-white border border-forest-600/40 shadow-sm text-xs font-bold text-charcoal-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-forest-700" />
                  <span>Apex Logistics</span>
                </div>
                <div className="p-2.5 rounded-lg bg-alert-redBg border border-alert-redBorder shadow-sm text-xs font-bold text-alert-red flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-alert-red" />
                  <span>Beneficiary Alteration</span>
                </div>
              </div>

              <div className="flex justify-center items-center py-4">
                <div className="p-2.5 rounded-lg bg-white border border-paper-300 shadow-sm text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-charcoal-900">
                    <FileSearch className="w-3.5 h-3.5 text-forest-700" />
                    <span>Invoice INV-8821</span>
                  </div>
                  <p className="text-[10px] text-charcoal-500">Altered: Cayman Trust *9012</p>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="p-2.5 rounded-lg bg-white border border-paper-300 shadow-sm text-xs font-bold text-charcoal-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-charcoal-700" />
                  <span>Wire: ₹8,000</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-amber-300 shadow-sm text-xs font-bold text-amber-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-700" />
                  <span>@apex-loglstics.com</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-charcoal-500 text-center">
              Click any node in the actual application to inspect source files, timestamps, and confidence ratings.
            </p>
          </div>
        </div>
      </section>

      {/* Human Safeguards & Peace of Mind Guarantee */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">
          The Zero Disruption Guarantee
        </h2>
        <p className="text-sm sm:text-base text-charcoal-600 max-w-xl mx-auto leading-relaxed">
          AuditLens never pauses, alters, or cancels an external corporate subscription without explicit, authenticated human approval. You remain in complete control.
        </p>
        <div className="pt-4">
          <NavLink
            to="/dashboard"
            className="px-6 py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm inline-flex items-center gap-2 shadow-card"
          >
            <span>Enter AuditLens Platform</span>
            <ArrowRight className="w-4 h-4 text-lime-accent" />
          </NavLink>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-paper-300 bg-paper-50 py-8 px-6 text-xs text-charcoal-500 text-center space-y-2">
        <p className="font-semibold text-charcoal-700">AuditLens Financial Forensics Core</p>
        <p>Built for Small-to-Medium Businesses, Agencies, and Fast-Growing Service Firms.</p>
        <p className="text-[11px] text-charcoal-400">© 2026 AuditLens. All rights reserved.</p>
      </footer>
    </div>
  );
};
