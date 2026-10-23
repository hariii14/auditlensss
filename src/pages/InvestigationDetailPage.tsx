import React, { useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Phone,
  FileText,
  CreditCard,
  Mail,
  GitFork,
  User,
  Ban,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { useData } from '../context/DataContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SeverityBadge({ sev }: { sev: string }) {
  if (sev === 'high') return <span className="badge-high">High Priority</span>;
  if (sev === 'medium') return <span className="badge-medium">Medium Priority</span>;
  return <span className="badge-low">Low Priority</span>;
}

function StatusPill({ status }: { status: string }) {
  if (status === 'ESCALATED') return <span className="status-escalated">Escalated</span>;
  if (status === 'VERIFIED_LEGITIMATE') return <span className="status-verified">Verified Legitimate</span>;
  if (status === 'RESOLVED') return <span className="status-resolved">Resolved</span>;
  return <span className="status-needs-review">Needs Review</span>;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

// ─── Evidence Record Row ───────────────────────────────────────────────────────

function EvidenceRow({
  icon,
  title,
  meta,
  extra,
  alert,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  extra?: string;
  alert?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
        alert
          ? 'bg-red-50 border-red-200'
          : 'bg-paper-50 border-paper-200 hover:bg-paper-100'
      }`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-charcoal-900">{title}</p>
        <p className="text-[11px] text-charcoal-500 mt-0.5">{meta}</p>
        {expanded && extra && (
          <p className="text-[11px] text-charcoal-700 mt-1.5 leading-relaxed font-mono bg-white rounded p-2 border border-paper-200">
            {extra}
          </p>
        )}
      </div>
      <button className="shrink-0 text-charcoal-300">
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const InvestigationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { investigations, anomalies, vendors, invoices, transactions, emails, updateInvestigationReview } = useData();

  const investigation = investigations.find(inv => inv.id === id);
  const anomaly = anomalies.find(a => investigation?.anomalyIds.includes(a.id));
  const vendor = vendors.find(v => investigation?.relatedVendorIds.includes(v.id));

  const [checklist, setChecklist] = useState<Record<number, boolean>>({});
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);

  if (!investigation || !anomaly) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto space-y-4">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-sm font-bold text-charcoal-800">Investigation Not Found</h3>
        <p className="text-xs text-charcoal-500">This record does not exist or has been archived.</p>
        <NavLink to="/investigations" className="btn-primary inline-flex">
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Investigations
        </NavLink>
      </div>
    );
  }

  const toggleCheck = (idx: number) =>
    setChecklist(prev => ({ ...prev, [idx]: !prev[idx] }));

  const handleAction = async (action: 'NEEDS_REVIEW' | 'VERIFIED_LEGITIMATE' | 'ESCALATED') => {
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const defaultNote =
        action === 'ESCALATED'
          ? 'Marked as Escalated — outgoing payment halted.'
          : action === 'VERIFIED_LEGITIMATE'
          ? 'Verified legitimate by authorized reviewer. Discrepancy cleared.'
          : 'Status reset to Needs Review for follow-up.';
      await updateInvestigationReview(investigation.id, action, noteText.trim() || defaultNote);
      setNoteText('');
      setFeedbackMsg({ type: 'success', text: `Status updated to: ${action.replace(/_/g, ' ')}` });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error updating status' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setIsSubmitting(true);
    try {
      await updateInvestigationReview(investigation.id, 'NOTE_ADDED', noteText.trim());
      setNoteText('');
      setFeedbackMsg({ type: 'success', text: 'Note appended to audit trail.' });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error adding note' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportingInvoices = invoices.filter(i => anomaly.supportingRecordIds.includes(i.id));
  const supportingTransactions = transactions.filter(t => anomaly.supportingRecordIds.includes(t.id));
  const supportingEmails = emails.filter(e => anomaly.supportingRecordIds.includes(e.id));
  const completedChecks = Object.values(checklist).filter(Boolean).length;
  const totalChecks = anomaly.verificationChecklist.length;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Sticky header */}
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-paper-300">
        <div className="flex items-start gap-3">
          <NavLink
            to="/investigations"
            className="p-1.5 rounded-lg border border-paper-300 bg-white hover:bg-paper-100 text-charcoal-700 transition-colors mt-0.5 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </NavLink>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <SeverityBadge sev={investigation.severity} />
              <StatusPill status={investigation.status} />
              {vendor && (
                <span className="text-[11px] text-charcoal-500 font-medium">
                  {vendor.name}
                </span>
              )}
              {anomaly.amountInDispute && (
                <span className="text-[11px] font-bold text-charcoal-900 bg-paper-200 px-1.5 py-0.5 rounded">
                  {anomaly.currency} {fmt(anomaly.amountInDispute)} at stake
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-charcoal-900 leading-tight">{investigation.title}</h1>
          </div>
        </div>

        <NavLink
          to="/investigations"
          className="btn-secondary shrink-0"
        >
          <GitFork className="w-3.5 h-3.5 text-forest-700" />
          <span className="hidden sm:inline">Trace</span>
        </NavLink>
      </div>

      {/* Feedback message */}
      {feedbackMsg && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
          feedbackMsg.type === 'success'
            ? 'bg-forest-50 border border-forest-600/30 text-forest-900'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {feedbackMsg.type === 'success'
            ? <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
            : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          {feedbackMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content — 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Finding summary */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="panel-title">Finding Summary</h3>
              <span className="text-[10px] font-mono bg-paper-100 text-charcoal-600 px-1.5 py-0.5 rounded border border-paper-200">
                {anomaly.category.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="px-4 py-3 space-y-3">
              {/* Plain-English explanation */}
              <p className="text-xs text-charcoal-700 leading-relaxed">
                {anomaly.explanation}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Why triggered */}
                <div className="bg-paper-50 rounded-lg border border-paper-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mb-1">
                    Detection Rule
                  </p>
                  <p className="text-[11px] font-mono font-semibold text-charcoal-800 mb-1">
                    {anomaly.detectionRule}
                  </p>
                  <p className="text-[11px] text-charcoal-500">{anomaly.detectionMethod}</p>
                </div>

                {/* Uncertainty */}
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                    What Remains Uncertain
                  </p>
                  <p className="text-[11px] text-amber-900 leading-relaxed">{anomaly.uncertainty}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-side comparison for beneficiary alterations */}
          {anomaly.category === 'BENEFICIARY_ALTERATION' && vendor && (
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Remittance Comparison
                </h3>
                <span className="text-[11px] text-red-600 font-semibold">Divergence Detected</span>
              </div>
              <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Verified */}
                <div className="rounded-lg bg-forest-50 border border-forest-600/30 p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
                    <span className="text-[11px] font-bold text-forest-900">Verified on File</span>
                  </div>
                  <div className="font-mono text-[11px] text-charcoal-700 space-y-1 bg-white rounded p-2 border border-forest-200">
                    <p><strong>Bank:</strong> {vendor.availableIdentifiers.verifiedBankAccounts[0]?.bankName || 'Chase Commercial'}</p>
                    <p><strong>Account:</strong> ****{vendor.availableIdentifiers.verifiedBankAccounts[0]?.last4 || '4491'}</p>
                    <p><strong>Country:</strong> {vendor.availableIdentifiers.verifiedBankAccounts[0]?.country || 'US'}</p>
                    <p><strong>Domain:</strong> {vendor.availableIdentifiers.verifiedEmailDomains[0]}</p>
                  </div>
                </div>
                {/* Suspicious */}
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-[11px] font-bold text-red-800">Suspicious — INV-8821</span>
                  </div>
                  <div className="font-mono text-[11px] text-red-800 space-y-1 bg-white rounded p-2 border border-red-200">
                    <p>Bank: Cayman Trust Offshore Bank</p>
                    <p>Account: ****9012 (Offshore)</p>
                    <p>Routing: CYM-88219 (CYTRKYXX)</p>
                    <p className="text-red-700">Domain: apex-loglstics.com ('l' ≠ 'i')</p>
                  </div>
                  <p className="text-[10px] text-red-700 font-semibold">⚠ DKIM Failed · Domain registered 6 days ago</p>
                </div>
              </div>

              {vendor.availableIdentifiers.phone && (
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-paper-50 border border-paper-200">
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="w-4 h-4 text-forest-700" />
                      <span>
                        Verified contact for <strong>{vendor.name}</strong>:{' '}
                        <code className="font-bold">{vendor.availableIdentifiers.phone}</code>
                        {vendor.availableIdentifiers.contactPerson && (
                          <span className="text-charcoal-400"> ({vendor.availableIdentifiers.contactPerson})</span>
                        )}
                      </span>
                    </div>
                    <a
                      href={`tel:${vendor.availableIdentifiers.phone}`}
                      className="btn-primary"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Supporting evidence */}
          {(supportingInvoices.length > 0 || supportingTransactions.length > 0 || supportingEmails.length > 0) && (
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Supporting Evidence</h3>
                <span className="text-[11px] text-charcoal-400">{anomaly.supportingRecordIds.length} records</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                {supportingInvoices.map(inv => (
                  <EvidenceRow
                    key={inv.id}
                    icon={<FileText className="w-3.5 h-3.5 text-charcoal-500" />}
                    title={`Invoice ${inv.invoiceNumber}`}
                    meta={`${inv.currency} ${fmt(inv.total)} · ${inv.invoiceDate}`}
                    extra={`Vendor: ${vendors.find(v => v.id === inv.vendorId)?.name || inv.vendorId} · Doc: ${inv.documentId} · Due: ${inv.dueDate || 'N/A'} · Bank: ${inv.paymentDetails.bankName || 'N/A'}`}
                    alert={inv.visualFlags && inv.visualFlags.length > 0}
                  />
                ))}
                {supportingTransactions.map(tx => (
                  <EvidenceRow
                    key={tx.id}
                    icon={<CreditCard className="w-3.5 h-3.5 text-charcoal-500" />}
                    title={tx.description}
                    meta={`${tx.currency} ${fmt(tx.amount)} debit · ${tx.date} · ${tx.accountName}`}
                    extra={`Status: ${tx.status} · Reference: ${tx.reference} · Reconciled to: ${tx.reconciledInvoiceId || 'Unlinked'}`}
                    alert={tx.status === 'flagged'}
                  />
                ))}
                {supportingEmails.map(em => (
                  <EvidenceRow
                    key={em.id}
                    icon={<Mail className="w-3.5 h-3.5 text-amber-600" />}
                    title={em.subject}
                    meta={`From: ${em.sender} · ${em.date}`}
                    extra={em.domainFlags?.headerAlert || em.body.slice(0, 300)}
                    alert={em.domainFlags?.isTyposquatCandidate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-4">
          {/* Verification checklist */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="panel-title">Verification Checklist</h3>
              <span className="text-[11px] text-charcoal-500 font-medium">
                {completedChecks}/{totalChecks}
              </span>
            </div>
            <div className="px-3 py-3 space-y-1.5">
              {/* Progress bar */}
              <div className="w-full h-1 bg-paper-200 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-forest-600 rounded-full transition-all duration-300"
                  style={{ width: `${totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0}%` }}
                />
              </div>
              {anomaly.verificationChecklist.map((item, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-xs ${
                    checklist[idx]
                      ? 'bg-forest-50 border-forest-600/30 text-forest-900'
                      : 'bg-paper-50 border-paper-200 text-charcoal-700 hover:bg-paper-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checklist[idx]}
                    onChange={() => toggleCheck(idx)}
                    className="mt-0.5 rounded text-forest-700 focus:ring-forest-600 shrink-0"
                  />
                  <span className={checklist[idx] ? 'line-through text-charcoal-400' : ''}>
                    {item}
                  </span>
                </label>
              ))}
              <p className="text-[10px] text-charcoal-400 pt-1">
                Checklist state persists in this session only.
              </p>
            </div>
          </div>

          {/* Review actions */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="panel-title">Reviewer Decision</h3>
            </div>
            <div className="px-3 py-3 space-y-3">
              {/* Note input */}
              <div>
                <label className="text-[11px] font-semibold text-charcoal-600 block mb-1.5">
                  Add reviewer note
                </label>
                <textarea
                  placeholder="e.g. Called verified contact at Apex. Confirmed the invoice is fraudulent."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                  className="form-input w-full resize-none"
                />
                <button
                  onClick={handleAddNote}
                  disabled={isSubmitting || !noteText.trim()}
                  className="mt-1.5 text-[11px] text-forest-700 hover:underline font-semibold disabled:opacity-40"
                >
                  Save note
                </button>
              </div>

              <div className="pt-2 border-t border-paper-200 space-y-2">
                <button
                  id="action-verified"
                  onClick={() => handleAction('VERIFIED_LEGITIMATE')}
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center"
                >
                  <Check className="w-3.5 h-3.5" />
                  Verified Legitimate
                </button>
                <button
                  id="action-escalate"
                  onClick={() => handleAction('ESCALATED')}
                  disabled={isSubmitting}
                  className="btn-danger w-full justify-center"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Pause & Escalate
                </button>
                <button
                  id="action-review"
                  onClick={() => handleAction('NEEDS_REVIEW')}
                  disabled={isSubmitting}
                  className="btn-secondary w-full justify-center text-xs"
                >
                  Needs Follow-Up
                </button>
              </div>

              <p className="text-[10px] text-charcoal-400 flex items-start gap-1.5 pt-1">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                No payments are paused or vendors contacted without your explicit action.
              </p>
            </div>
          </div>

          {/* Audit trail (collapsed by default) */}
          <div className="panel">
            <button
              className="panel-header w-full text-left"
              onClick={() => setAuditOpen(o => !o)}
            >
              <h3 className="panel-title">
                Audit Trail ({investigation.reviewHistory.length})
              </h3>
              {auditOpen ? (
                <ChevronUp className="w-4 h-4 text-charcoal-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-charcoal-400" />
              )}
            </button>

            {/* Always show the latest event */}
            {investigation.reviewHistory.length > 0 && (
              <div className="px-3 py-2.5 border-b border-paper-200">
                <div className="flex justify-between text-[10px] text-charcoal-400 mb-1">
                  <span className="flex items-center gap-1 font-medium text-charcoal-700">
                    <User className="w-3 h-3 text-forest-700" />
                    {investigation.reviewHistory[investigation.reviewHistory.length - 1].author}
                  </span>
                  <span className="font-mono">
                    {new Date(investigation.reviewHistory[investigation.reviewHistory.length - 1].timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-700">
                  {investigation.reviewHistory[investigation.reviewHistory.length - 1].notes}
                </p>
              </div>
            )}

            {/* Expanded history */}
            {auditOpen && investigation.reviewHistory.length > 1 && (
              <div className="px-3 py-2 space-y-2">
                {investigation.reviewHistory.slice(0, -1).reverse().map(rev => (
                  <div key={rev.id} className="text-xs space-y-0.5">
                    <div className="flex justify-between text-[10px] text-charcoal-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {rev.author}
                      </span>
                      <span className="font-mono">{new Date(rev.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-charcoal-600 pl-4">{rev.notes}</p>
                  </div>
                ))}
              </div>
            )}

            {investigation.reviewHistory.length === 0 && (
              <p className="px-3 py-3 text-[11px] text-charcoal-400">No review history yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
