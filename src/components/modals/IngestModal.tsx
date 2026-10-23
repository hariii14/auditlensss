import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  UploadCloud,
  Camera,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Plus,
  File,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DocumentRecord } from '../../types';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FileEntry {
  file: File;
  status: 'queued' | 'processing' | 'done' | 'error';
  result?: DocumentRecord;
  error?: string;
}

export const IngestModal: React.FC<IngestModalProps> = ({ isOpen, onClose }) => {
  const { uploadDocument } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'email'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [fileQueue, setFileQueue] = useState<FileEntry[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [pastedResult, setPastedResult] = useState<DocumentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const entries: FileEntry[] = Array.from(newFiles).map(f => ({
      file: f,
      status: 'queued',
    }));
    setFileQueue(prev => [...prev, ...entries]);
    setAllDone(false);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeFile = (idx: number) => {
    setFileQueue(prev => prev.filter((_, i) => i !== idx));
  };

  const handleBatchIngest = async () => {
    if (activeTab !== 'email' && fileQueue.length === 0 && !pastedText.trim()) {
      setError('Please select at least one file to ingest.');
      return;
    }
    if (activeTab === 'email' && !pastedText.trim() && fileQueue.length === 0) {
      setError('Please paste email content or attach a file.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (fileQueue.length > 0) {
        // Process each file in sequence
        for (let i = 0; i < fileQueue.length; i++) {
          if (fileQueue[i].status === 'done') continue;
          setFileQueue(prev =>
            prev.map((entry, idx) =>
              idx === i ? { ...entry, status: 'processing' } : entry
            )
          );
          try {
            const source =
              activeTab === 'camera'
                ? 'Mobile Smart Viewfinder'
                : activeTab === 'email'
                ? 'Pasted Email Forward'
                : 'Manual Upload';
            const doc = await uploadDocument(fileQueue[i].file, undefined, source);
            setFileQueue(prev =>
              prev.map((entry, idx) =>
                idx === i
                  ? { ...entry, status: 'done', result: doc || undefined }
                  : entry
              )
            );
          } catch (err: any) {
            setFileQueue(prev =>
              prev.map((entry, idx) =>
                idx === i
                  ? { ...entry, status: 'error', error: err.message || 'Processing error' }
                  : entry
              )
            );
          }
        }
      } else if (pastedText.trim()) {
        const source = activeTab === 'email' ? 'Pasted Email Forward' : 'Pasted Text';
        const doc = await uploadDocument(undefined, pastedText.trim(), source);
        setPastedResult(doc);
        setPastedText('');
      }

      setAllDone(true);
    } catch (err: any) {
      setError(err.message || 'Error processing documents');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFileQueue([]);
    setPastedText('');
    setAllDone(false);
    setPastedResult(null);
    setError(null);
  };

  const errorCount = fileQueue.filter(f => f.status === 'error').length;
  const totalQueued = fileQueue.length;
  const reviewResults = [
    ...fileQueue.flatMap(entry => entry.result ? [entry.result] : []),
    ...(pastedResult ? [pastedResult] : []),
  ];

  function FileSize({ size }: { size: number }) {
    if (size < 1024) return <>{size} B</>;
    if (size < 1024 * 1024) return <>{(size / 1024).toFixed(1)} KB</>;
    return <>{(size / (1024 * 1024)).toFixed(1)} MB</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-elevated border border-paper-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-paper-300 flex items-center justify-between bg-paper-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-forest-700 text-white flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal-900">Batch Upload & Scan</h2>
              <p className="text-[10px] text-charcoal-500">OCR extraction, DPI inspection & anomaly detection</p>
            </div>
          </div>
          <button
            onClick={() => { handleReset(); onClose(); }}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Success view */}
          {allDone && reviewResults.length > 0 ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${reviewResults.some(doc => doc.processingStatus === 'flagged') ? 'bg-red-50 border-red-200' : 'bg-forest-50 border-forest-600/30'}`}>
                {reviewResults.some(doc => doc.processingStatus === 'flagged') ? <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-forest-700 mt-0.5 shrink-0" />}
                <div>
                  <h4 className={`text-sm font-bold ${reviewResults.some(doc => doc.processingStatus === 'flagged') ? 'text-red-900' : 'text-forest-900'}`}>
                    Document review ready
                    {errorCount > 0 && ` · ${errorCount} with errors`}
                  </h4>
                  <p className={`text-xs mt-0.5 ${reviewResults.some(doc => doc.processingStatus === 'flagged') ? 'text-red-700' : 'text-forest-800'}`}>
                    {reviewResults.some(doc => doc.processingStatus === 'flagged') ? 'Potential invoice issues were found. Review the evidence below before approving payment.' : 'No high-risk invoice discrepancies were detected.'}
                  </p>
                </div>
              </div>

              {/* Immediate per-document forensic review */}
              <div className="space-y-3">
                {reviewResults.map(doc => {
                  const fields = doc.extractedFields || {};
                  const report = fields.uncertaintyReport;
                  const uncertaintyScore = fields.uncertaintyScore ?? (report?.uncertaintyScore ?? Math.round((1 - (fields.confidenceScore || 0.85)) * 100));
                  const uncertaintyLevel = fields.uncertaintyLevel ?? (report?.uncertaintyLevel ?? (uncertaintyScore >= 50 ? 'high' : uncertaintyScore >= 25 ? 'medium' : 'low'));
                  const arithmetic = report?.fieldConfidences?.arithmetic;
                  const isFlagged = doc.processingStatus === 'flagged';

                  return (
                    <div
                      key={doc.id}
                      className={`rounded-xl border p-3.5 text-xs transition-all ${
                        isFlagged
                          ? 'border-red-300 bg-red-50/60 shadow-sm'
                          : 'border-forest-600/20 bg-forest-50/50'
                      }`}
                    >
                      {/* Document Title & Status Header */}
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-paper-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <File className={`w-4 h-4 shrink-0 ${isFlagged ? 'text-red-600' : 'text-forest-700'}`} />
                          <p className="font-bold text-charcoal-900 truncate">{doc.filename}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Uncertainty pill */}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              uncertaintyLevel === 'high'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : uncertaintyLevel === 'medium'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-forest-100 text-forest-800 border border-forest-600/30'
                            }`}
                          >
                            {uncertaintyLevel === 'high'
                              ? `High Uncertainty (${uncertaintyScore}%)`
                              : uncertaintyLevel === 'medium'
                              ? `Medium Uncertainty (${uncertaintyScore}%)`
                              : `Low Uncertainty (${uncertaintyScore}%)`}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isFlagged
                                ? 'bg-red-600 text-white'
                                : 'bg-forest-700 text-white'
                            }`}
                          >
                            {isFlagged ? 'Flagged as Anomaly' : 'Parsed & Clean'}
                          </span>
                        </div>
                      </div>

                      {/* Recognized OCR Entities Grid */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg border border-paper-200 bg-white p-3">
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-charcoal-400">Vendor</span>
                          <b className="text-charcoal-900 text-xs block truncate">{fields.vendorName || 'Unidentified'}</b>
                          <span className="text-[10px] text-charcoal-500">
                            {report?.fieldConfidences?.vendorName?.status === 'verified' ? '✓ In Directory' : '⚠ Unverified'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-charcoal-400">Invoice #</span>
                          <b className="font-mono text-charcoal-900 text-xs block truncate">{fields.invoiceNumber || 'Not Stated'}</b>
                          <span className="text-[10px] text-charcoal-500">
                            {fields.invoiceNumber ? '✓ Detected' : '⚠ Missing'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-charcoal-400">Total Amount</span>
                          <b className="text-forest-800 text-xs block">
                            {fields.total != null
                              ? `${fields.currency || 'INR'} ${fields.total.toLocaleString('en-IN')}`
                              : 'Unreadable'}
                          </b>
                          <span className="text-[10px] text-charcoal-500">
                            {arithmetic?.status === 'discrepancy'
                              ? `⚠ Discrepancy (${arithmetic.discrepancy})`
                              : arithmetic?.status === 'passed'
                              ? '✓ Line items balance'
                              : 'Stated amount'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-charcoal-400">OCR Confidence</span>
                          <b className="text-charcoal-900 text-xs block">
                            {Math.round((fields.confidenceScore || 0.85) * 100)}%
                          </b>
                          <span className="text-[10px] text-charcoal-500">
                            {uncertaintyScore}% Uncertainty
                          </span>
                        </div>
                      </div>

                      {/* Remittance Destination if available */}
                      {fields.bankName && (
                        <div className="mt-2 p-2 bg-white rounded-lg border border-paper-200 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="text-charcoal-400 uppercase text-[9px] font-bold block">Remittance Destination</span>
                            <span className="font-mono text-charcoal-800">
                              {fields.bankName} {fields.accountNumberLast4 ? `(Acct *${fields.accountNumberLast4})` : ''}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            report?.fieldConfidences?.remittance?.status === 'suspicious'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-paper-100 text-charcoal-600'
                          }`}>
                            {report?.fieldConfidences?.remittance?.status === 'suspicious' ? '⚠ Unverified Divergence' : 'Standard'}
                          </span>
                        </div>
                      )}

                      {/* Forensic Findings & Anomaly Flags */}
                      {Array.isArray(fields.forensicFindings) && fields.forensicFindings.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {fields.forensicFindings.map((finding: any) => (
                            <div key={finding.id} className="p-2.5 rounded-lg border border-red-300 bg-red-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-red-900 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                  <span>{finding.title}</span>
                                </p>
                                <p className="text-[10px] text-red-800 mt-0.5 leading-relaxed">
                                  {finding.explanation}
                                </p>
                              </div>
                              {finding.investigationId && (
                                <button
                                  onClick={() => {
                                    onClose();
                                    navigate(`/investigations/${finding.investigationId}`);
                                  }}
                                  className="btn-danger text-[10px] py-1 px-2.5 shrink-0 self-start sm:self-center"
                                >
                                  Open Investigation →
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Forensic Observations List */}
                      {doc.visualFlags && doc.visualFlags.length > 0 && (
                        <div className={`mt-2 rounded-lg border p-2 ${isFlagged ? 'border-red-200 bg-white text-red-800' : 'border-paper-200 bg-white text-charcoal-600'}`}>
                          <p className="mb-1 text-[9px] font-bold uppercase text-charcoal-500">Forensic Observations & Signals</p>
                          {doc.visualFlags.map((flag, index) => (
                            <p key={index} className="text-[10px] flex items-center gap-1">
                              <span>{isFlagged ? '⚠' : '✓'}</span>
                              <span>{flag}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/investigations');
                  }}
                  className="text-xs font-semibold text-red-700 hover:text-red-900 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Check Investigations Hub</span>
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={handleReset} className="btn-secondary text-xs">
                    Upload More
                  </button>
                  <button onClick={() => { onClose(); navigate('/documents'); }} className="btn-primary">
                    View Document Vault <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tab selector */}
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-paper-100 rounded-lg border border-paper-300 text-xs font-medium">
                {[
                  { key: 'upload', label: 'PDF / File', icon: <FileText className="w-3.5 h-3.5" /> },
                  { key: 'camera', label: 'Receipt Scan', icon: <Camera className="w-3.5 h-3.5" /> },
                  { key: 'email', label: 'Email Forward', icon: <Mail className="w-3.5 h-3.5" /> },
                ].map(t => (
                  <button
                    key={t.key}
                    id={`tab-${t.key}`}
                    onClick={() => setActiveTab(t.key as any)}
                    className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                      activeTab === t.key
                        ? 'bg-white text-charcoal-900 shadow-sm font-semibold'
                        : 'text-charcoal-500 hover:text-charcoal-700'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drop zone */}
              {activeTab !== 'email' && (
                <div>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      dragActive
                        ? 'border-forest-600 bg-forest-50'
                        : 'border-paper-300 bg-paper-50 hover:border-forest-600/50 hover:bg-paper-100'
                    }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${dragActive ? 'text-forest-600' : 'text-charcoal-400'}`} />
                    <p className="text-xs font-semibold text-charcoal-700">
                      Drop files here or{' '}
                      <span className="text-forest-700 underline">browse</span>
                    </p>
                    <p className="text-[11px] text-charcoal-400 mt-1">
                      PDFs, images, bank statements — multiple files supported
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* File queue */}
                  {fileQueue.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-charcoal-500 mb-2">
                        <span>{fileQueue.length} file{fileQueue.length > 1 ? 's' : ''} queued</span>
                        <button
                          onClick={() => { setFileQueue([]); setAllDone(false); }}
                          className="text-charcoal-400 hover:text-red-600 transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      {fileQueue.map((entry, i) => (
                        <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs ${
                          entry.status === 'processing'
                            ? 'bg-forest-50 border-forest-600/30'
                            : entry.status === 'error'
                            ? 'bg-red-50 border-red-200'
                            : entry.status === 'done'
                            ? 'bg-forest-50 border-forest-600/20'
                            : 'bg-paper-50 border-paper-200'
                        }`}>
                          <File className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                          <span className="font-medium text-charcoal-800 truncate flex-1">{entry.file.name}</span>
                          <span className="text-charcoal-400 shrink-0 text-[10px]">
                            <FileSize size={entry.file.size} />
                          </span>
                          {entry.status === 'processing' && (
                            <Loader2 className="w-3.5 h-3.5 text-forest-700 animate-spin shrink-0" />
                          )}
                          {entry.status === 'done' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                          )}
                          {entry.status === 'error' && (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          )}
                          {entry.status === 'queued' && (
                            <button
                              onClick={() => removeFile(i)}
                              className="text-charcoal-300 hover:text-red-500 transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add more */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 rounded-lg border border-dashed border-paper-300 text-[11px] text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-400 transition-colors flex items-center justify-center gap-1.5 mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add more files
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Email paste area */}
              {activeTab === 'email' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-charcoal-700 block">
                    Paste forwarded email or invoice text
                  </label>
                  <textarea
                    placeholder="Paste the full email or invoice content here. AuditLens will extract vendor details, amounts, and payment instructions automatically."
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    rows={7}
                    className="form-input w-full resize-none font-mono"
                  />
                  <p className="text-[10px] text-charcoal-400">
                    Domain headers, DKIM flags, and typosquatting patterns will be checked automatically.
                  </p>
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Info strip */}
              <div className="flex items-start gap-2 px-3 py-2 bg-paper-50 rounded-lg border border-paper-200 text-[11px] text-charcoal-500">
                <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-charcoal-700">Zero Disruption Policy</strong> — no payments are paused or vendors contacted without your explicit action.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        {!allDone && (
          <div className="px-4 py-3 border-t border-paper-300 flex items-center justify-between bg-paper-50 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-charcoal-400">
              <Sparkles className="w-3.5 h-3.5 text-forest-700" />
              <span>Gemini AI extraction where configured</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleReset(); onClose(); }}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                id="ingest-submit-btn"
                onClick={handleBatchIngest}
                disabled={isProcessing || (fileQueue.length === 0 && !pastedText.trim())}
                className="btn-primary min-w-28 justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    Ingest {fileQueue.length > 1 ? `${fileQueue.length} Files` : fileQueue.length === 1 ? 'File' : 'Document'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
