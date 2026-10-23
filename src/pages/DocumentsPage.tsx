import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  UploadCloud,
  FileSearch,
  Camera,
  Mail,
  Download,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { DocumentRecord, DocumentType } from '../types';
import { IngestModal } from '../components/modals/IngestModal';

export const DocumentsPage: React.FC = () => {
  const { documents } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | DocumentType | 'flagged'>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    if (typeFilter === 'flagged') {
      if (doc.processingStatus !== 'flagged') return false;
    } else if (typeFilter !== 'all' && doc.type !== typeFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.filename.toLowerCase().includes(q) ||
        doc.sourceReference.toLowerCase().includes(q) ||
        (doc.extractedFields.vendorName && doc.extractedFields.vendorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-paper-300 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-charcoal-900 tracking-tight">
            Multimodal Ingest Center & Document Vault
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            OCR entity recognition, automated arithmetic verification, remittance validation, and forensic anomaly detection.
          </p>
        </div>

        <button
          onClick={() => setIsIngestOpen(true)}
          className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs flex items-center gap-2 shadow-subtle self-start"
        >
          <UploadCloud className="w-4 h-4 text-lime-accent" />
          <span>Ingest New Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-paper-200/70 rounded-lg border border-paper-300 text-xs font-medium">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              typeFilter === 'all' ? 'bg-white text-charcoal-900 font-semibold shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            All Docs ({documents.length})
          </button>
          <button
            onClick={() => setTypeFilter('flagged')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              typeFilter === 'flagged' ? 'bg-red-600 text-white font-semibold shadow-sm' : 'text-red-700 hover:text-red-900'
            }`}
          >
            Flagged & Uncertain ({documents.filter(d => d.processingStatus === 'flagged').length})
          </button>
          <button
            onClick={() => setTypeFilter('invoice_pdf')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              typeFilter === 'invoice_pdf' ? 'bg-white text-charcoal-900 font-semibold shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            PDF Invoices
          </button>
          <button
            onClick={() => setTypeFilter('receipt_img')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              typeFilter === 'receipt_img' ? 'bg-white text-charcoal-900 font-semibold shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Receipt Photos
          </button>
          <button
            onClick={() => setTypeFilter('contract_doc')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              typeFilter === 'contract_doc' ? 'bg-white text-charcoal-900 font-semibold shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Contracts
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-paper-300 text-xs w-56 focus:outline-none focus:ring-1 focus:ring-forest-600 bg-white"
          />
        </div>
      </div>

      {/* Document Vault Table */}
      <div className="bg-white rounded-xl border border-paper-300 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-paper-200 text-charcoal-500 font-semibold uppercase text-[10px] tracking-wider bg-paper-50/50">
                <th className="py-3 px-4">Filename / Source</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Extracted Entity</th>
                <th className="py-3 px-4">Amount / Total</th>
                <th className="py-3 px-4">OCR Confidence</th>
                <th className="py-3 px-4">Uncertainty Risk</th>
                <th className="py-3 px-4">Forensic Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200">
              {filteredDocs.map((doc) => {
                const fields = doc.extractedFields || {};
                const report = fields.uncertaintyReport;
                const uncertaintyScore = fields.uncertaintyScore ?? (report?.uncertaintyScore ?? Math.round((1 - (fields.confidenceScore || 0.85)) * 100));
                const uncertaintyLevel = fields.uncertaintyLevel ?? (report?.uncertaintyLevel ?? (uncertaintyScore >= 50 ? 'high' : uncertaintyScore >= 25 ? 'medium' : 'low'));
                const isFlagged = doc.processingStatus === 'flagged';

                return (
                  <tr key={doc.id} className="hover:bg-paper-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-paper-100 text-charcoal-700 flex items-center justify-center flex-shrink-0 border border-paper-200">
                          {doc.type === 'receipt_img' ? (
                            <Camera className="w-4 h-4 text-forest-700" />
                          ) : (
                            <FileText className="w-4 h-4 text-charcoal-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-charcoal-900 truncate">{doc.filename}</p>
                          <p className="text-[11px] text-charcoal-500 truncate">{doc.sourceReference}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-600 uppercase">
                      {doc.type.replace('_', ' ')}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-charcoal-800">
                      <div>
                        <span>{fields.vendorName || 'Unidentified'}</span>
                        {fields.invoiceNumber && (
                          <span className="block font-mono text-[10px] text-charcoal-400">
                            #{fields.invoiceNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-charcoal-900">
                      {fields.total != null
                        ? `${fields.currency || 'INR'} ${fields.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-600">
                      <span className="font-semibold text-forest-800">
                        {Math.round((fields.confidenceScore || 0.95) * 100)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          uncertaintyLevel === 'high'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : uncertaintyLevel === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-forest-50 text-forest-800 border border-forest-600/20'
                        }`}
                      >
                        {uncertaintyLevel === 'high'
                          ? `High Risk (${uncertaintyScore}%)`
                          : uncertaintyLevel === 'medium'
                          ? `Medium (${uncertaintyScore}%)`
                          : 'Low / Verified'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isFlagged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-alert-redBg border border-alert-redBorder text-alert-red text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-50 border border-forest-600/20 text-forest-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-forest-700" />
                          Parsed
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-2.5 py-1 rounded-md border border-paper-300 text-charcoal-700 hover:bg-paper-100 font-semibold text-xs flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Inspector Modal */}
      {selectedDoc && (() => {
        const fields = selectedDoc.extractedFields || {};
        const report = fields.uncertaintyReport;
        const uncertaintyScore = fields.uncertaintyScore ?? (report?.uncertaintyScore ?? Math.round((1 - (fields.confidenceScore || 0.85)) * 100));
        const uncertaintyLevel = fields.uncertaintyLevel ?? (report?.uncertaintyLevel ?? (uncertaintyScore >= 50 ? 'high' : uncertaintyScore >= 25 ? 'medium' : 'low'));
        const arithmetic = report?.fieldConfidences?.arithmetic;
        const findings = Array.isArray(fields.forensicFindings) ? fields.forensicFindings : [];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-elevated border border-paper-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-paper-300 flex items-center justify-between bg-paper-50">
                <div className="flex items-center gap-2.5">
                  <FileSearch className="w-5 h-5 text-forest-700" />
                  <div>
                    <h3 className="text-sm font-bold text-charcoal-900">{selectedDoc.filename}</h3>
                    <p className="text-[11px] text-charcoal-500">{selectedDoc.sourceReference}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Forensic Anomaly Alert Banner if flagged */}
                {findings.length > 0 && (
                  <div className="p-4 rounded-xl border border-red-300 bg-red-50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-red-900 font-bold">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <span>Forensic Anomaly Triggered</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-200 text-red-800">
                        High Priority
                      </span>
                    </div>
                    {findings.map((f: any) => (
                      <div key={f.id} className="text-red-800 text-[11px] space-y-1">
                        <p className="font-semibold">{f.title}</p>
                        <p className="text-charcoal-600 leading-relaxed">{f.explanation}</p>
                        {f.investigationId && (
                          <button
                            onClick={() => {
                              setSelectedDoc(null);
                              navigate(`/investigations/${f.investigationId}`);
                            }}
                            className="btn-danger text-xs mt-2 py-1.5 px-3"
                          >
                            Open Investigation Case File →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Extracted Structured Metadata */}
                <div className="bg-paper-50 border border-paper-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-paper-200">
                    <h4 className="font-bold text-charcoal-900 text-xs uppercase tracking-wider">
                      OCR Extracted Metadata & Certainty Audit
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        uncertaintyLevel === 'high'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : uncertaintyLevel === 'medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-forest-100 text-forest-800 border border-forest-600/30'
                      }`}
                    >
                      Uncertainty: {uncertaintyScore}% ({uncertaintyLevel.toUpperCase()})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-charcoal-500 block">Vendor Identity:</span>
                      <strong className="text-charcoal-900 text-sm block">{fields.vendorName || 'Unidentified'}</strong>
                      <span className="text-[10px] text-charcoal-500">
                        {report?.fieldConfidences?.vendorName?.status === 'verified'
                          ? '✓ Verified against vendor directory'
                          : '⚠ New / Unverified vendor'}
                      </span>
                    </div>

                    <div>
                      <span className="text-charcoal-500 block">Invoice Number:</span>
                      <strong className="font-mono text-charcoal-900 text-sm block">{fields.invoiceNumber || 'Not Stated'}</strong>
                      <span className="text-[10px] text-charcoal-500">
                        {fields.invoiceNumber ? '✓ Stated on document' : '⚠ Missing from document'}
                      </span>
                    </div>

                    <div>
                      <span className="text-charcoal-500 block">Stated Total:</span>
                      <strong className="text-forest-800 text-sm block">
                        {fields.total != null
                          ? `${fields.currency || 'INR'} ${fields.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : 'Unreadable'}
                      </strong>
                      <span className="text-[10px] text-charcoal-500">
                        {arithmetic?.status === 'discrepancy'
                          ? `⚠ Line item variance: ${arithmetic.discrepancy}`
                          : arithmetic?.status === 'passed'
                          ? '✓ Reconciled with subtotal + tax'
                          : 'Stated invoice total'}
                      </span>
                    </div>

                    <div>
                      <span className="text-charcoal-500 block">Invoice Date:</span>
                      <strong className="text-charcoal-900 text-sm block">{fields.date || 'Unspecified'}</strong>
                      <span className="text-[10px] text-charcoal-500">
                        {fields.date ? '✓ Detected' : '⚠ Missing date'}
                      </span>
                    </div>

                    {/* Subtotal and Tax Line Item Breakdown */}
                    {(fields.subtotal != null || fields.tax != null) && (
                      <div className="col-span-2 pt-2 border-t border-paper-200 grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-charcoal-400 block text-[10px]">Subtotal</span>
                          <span className="font-semibold text-charcoal-800">{fields.currency || 'INR'} {fields.subtotal ?? '—'}</span>
                        </div>
                        <div>
                          <span className="text-charcoal-400 block text-[10px]">Tax / GST</span>
                          <span className="font-semibold text-charcoal-800">{fields.currency || 'INR'} {fields.tax ?? '—'}</span>
                        </div>
                        <div>
                          <span className="text-charcoal-400 block text-[10px]">Arithmetic Balance</span>
                          <span className={`font-semibold ${arithmetic?.status === 'discrepancy' ? 'text-red-600' : 'text-forest-700'}`}>
                            {arithmetic?.status === 'discrepancy' ? 'Discrepancy' : 'Balanced'}
                          </span>
                        </div>
                      </div>
                    )}

                    {fields.bankName && (
                      <div className="col-span-2 pt-2 border-t border-paper-200">
                        <span className="text-charcoal-500 block">Remittance Destination:</span>
                        <strong className="font-mono text-charcoal-800">
                          {fields.bankName} {fields.accountNumberLast4 ? `(Account ending in *${fields.accountNumberLast4})` : ''}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual & Forensic Flags */}
                {selectedDoc.visualFlags && selectedDoc.visualFlags.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                    <span className="text-[10px] font-bold text-amber-900 uppercase">Forensic Signals & Observations</span>
                    <ul className="list-disc list-inside text-amber-800 text-[11px] space-y-0.5">
                      {selectedDoc.visualFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Raw Extracted Document Content / Text */}
                {selectedDoc.rawContent && (
                  <div>
                    <h4 className="font-bold text-charcoal-900 mb-1">OCR Transcribed Text Excerpt</h4>
                    <pre className="p-3 rounded-lg bg-paper-100 border border-paper-300 font-mono text-[11px] text-charcoal-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {selectedDoc.rawContent}
                    </pre>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-paper-300 bg-paper-50 flex justify-end">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 rounded-lg bg-forest-700 text-white font-semibold text-xs"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Global Ingest Modal */}
      <IngestModal isOpen={isIngestOpen} onClose={() => setIsIngestOpen(false)} />
    </div>
  );
};
