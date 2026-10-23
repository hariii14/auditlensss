import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DocumentRecord,
  VendorRecord,
  InvoiceRecord,
  TransactionRecord,
  EmailRecord,
  SubscriptionRecord,
  AnomalyRecord,
  EvidenceEdgeRecord,
  InvestigationRecord,
  AuditCleanlinessMetric,
  ReviewStatus,
} from '../types';
import {
  MOCK_COMPANY,
  MOCK_DOCUMENTS,
  MOCK_VENDORS,
  MOCK_INVOICES,
  MOCK_TRANSACTIONS,
  MOCK_EMAILS,
  MOCK_SUBSCRIPTIONS,
  MOCK_ANOMALIES,
  MOCK_EVIDENCE_EDGES,
  MOCK_INVESTIGATIONS,
  MOCK_METRICS,
} from '../data/mockData';
import { parseOcrText, createOcrAnomalyRecord } from '../engine/ocrEngine';

interface DataContextType {
  company: typeof MOCK_COMPANY;
  documents: DocumentRecord[];
  vendors: VendorRecord[];
  invoices: InvoiceRecord[];
  transactions: TransactionRecord[];
  emails: EmailRecord[];
  subscriptions: SubscriptionRecord[];
  anomalies: AnomalyRecord[];
  edges: EvidenceEdgeRecord[];
  investigations: InvestigationRecord[];
  metrics: AuditCleanlinessMetric;
  isLoading: boolean;
  isLiveApi: boolean;
  refreshData: () => Promise<void>;
  updateInvestigationReview: (investigationId: string, action: ReviewStatus | 'NOTE_ADDED', notes: string, author?: string) => Promise<boolean>;
  uploadDocument: (file?: File, pastedText?: string, source?: string) => Promise<DocumentRecord | null>;
  resetToBaseline: () => Promise<void>;
  saveApiKey: (apiKey: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState(MOCK_COMPANY);
  const [documents, setDocuments] = useState<DocumentRecord[]>(MOCK_DOCUMENTS);
  const [vendors, setVendors] = useState<VendorRecord[]>(MOCK_VENDORS);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(MOCK_INVOICES);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(MOCK_TRANSACTIONS);
  const [emails, setEmails] = useState<EmailRecord[]>(MOCK_EMAILS);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>(MOCK_SUBSCRIPTIONS);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(MOCK_ANOMALIES);
  const [edges, setEdges] = useState<EvidenceEdgeRecord[]>(MOCK_EVIDENCE_EDGES);
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>(MOCK_INVESTIGATIONS);
  const [metrics, setMetrics] = useState<AuditCleanlinessMetric>(MOCK_METRICS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // Fetch initial data from backend if available, fallback gracefully to mockData
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setCompany(data.company || MOCK_COMPANY);
        setDocuments(data.documents || MOCK_DOCUMENTS);
        setVendors(data.vendors || MOCK_VENDORS);
        setInvoices(data.invoices || MOCK_INVOICES);
        setTransactions(data.transactions || MOCK_TRANSACTIONS);
        setEmails(data.emails || MOCK_EMAILS);
        setSubscriptions(data.subscriptions || MOCK_SUBSCRIPTIONS);
        setAnomalies(data.anomalies || MOCK_ANOMALIES);
        setEdges(data.edges || MOCK_EVIDENCE_EDGES);
        setInvestigations(data.investigations || MOCK_INVESTIGATIONS);
        setMetrics(data.metrics || MOCK_METRICS);
        setIsLiveApi(true);
      }
    } catch (err) {
      console.warn('API fetch failed, utilizing client-side forensic repository.');
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateInvestigationReview = async (
    investigationId: string,
    action: ReviewStatus | 'NOTE_ADDED',
    notes: string,
    author: string = 'Sarah Jenkins (Founder)'
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/investigations/${investigationId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes, author }),
      });

      if (res.ok) {
        const result = await res.json();
        // Update local state
        setInvestigations(prev =>
          prev.map(inv => inv.id === investigationId ? result.investigation : inv)
        );
        if (action !== 'NOTE_ADDED') {
          const inv = investigations.find(i => i.id === investigationId);
          if (inv) {
            setAnomalies(prev =>
              prev.map(a => inv.anomalyIds.includes(a.id) ? { ...a, status: action, updatedAt: new Date().toISOString() } : a)
            );
          }
        }
        await refreshData();
        return true;
      }
    } catch (err) {
      console.warn('Backend unavailable, updating local client state.');
    }

    // Client-side fallback update
    const now = new Date().toISOString();
    const newEvent = {
      id: `rev-${Date.now()}`,
      investigationId,
      anomalyId: '',
      action,
      notes,
      author,
      timestamp: now,
    };

    setInvestigations(prev =>
      prev.map(inv => {
        if (inv.id === investigationId) {
          return {
            ...inv,
            status: action !== 'NOTE_ADDED' ? action : inv.status,
            updatedAt: now,
            reviewHistory: [...inv.reviewHistory, newEvent],
          };
        }
        return inv;
      })
    );

    if (action !== 'NOTE_ADDED') {
      const targetInv = investigations.find(i => i.id === investigationId);
      if (targetInv) {
        setAnomalies(prev =>
          prev.map(a =>
            targetInv.anomalyIds.includes(a.id)
              ? { ...a, status: action, updatedAt: now }
              : a
          )
        );
      }
      setMetrics(prev => ({
        ...prev,
        overallScore: action === 'RESOLVED' || action === 'VERIFIED_LEGITIMATE' ? Math.min(99.5, prev.overallScore + 0.8) : prev.overallScore,
        unresolvedAnomalies: Math.max(0, prev.unresolvedAnomalies - (action === 'RESOLVED' || action === 'VERIFIED_LEGITIMATE' ? 1 : 0)),
      }));
    }

    return true;
  };

  const uploadDocument = async (file?: File, pastedText?: string, source: string = 'Manual Upload'): Promise<DocumentRecord | null> => {
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (pastedText) formData.append('pastedText', pastedText);
      formData.append('source', source);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        await refreshData();
        return data.document;
      }
    } catch (err) {
      console.warn('Upload API call failed, generating simulated forensic parse in local state.');
    }

    // Client-side fallback deterministic ingestion — NEVER random values!
    const docId = `doc-${Date.now()}`;
    const filename = file ? file.name : `Pasted_Communication_${new Date().toISOString().slice(0, 10)}.txt`;
    const reviewText = `${pastedText || file?.name || ''}`;

    const parsedOcr = parseOcrText(
      reviewText,
      filename,
      pastedText ? 0.95 : 0.65,
      vendors,
      invoices
    );

    const report = parsedOcr.uncertaintyReport;
    const isFlagged = report.isAnomaly || report.uncertaintyLevel !== 'low' || parsedOcr.confidenceScore < 0.75;

    let docType: DocumentRecord['type'] = 'invoice_pdf';
    if (file?.type.includes('image') || /\.(png|jpg|jpeg|webp)$/i.test(filename)) docType = 'receipt_img';
    else if (file?.type.includes('csv') || filename.endsWith('.csv')) docType = 'csv_transactions';
    else if (filename.toLowerCase().includes('statement')) docType = 'bank_statement';
    else if (pastedText || file?.type.includes('text')) docType = 'vendor_email';

    const newDoc: DocumentRecord = {
      id: docId,
      filename,
      type: docType,
      uploadDate: new Date().toISOString().slice(0, 10),
      processingStatus: isFlagged ? 'flagged' : 'parsed',
      fileSize: file ? file.size : pastedText?.length || 1024,
      extractedFields: {
        vendorName: parsedOcr.vendorName,
        invoiceNumber: parsedOcr.invoiceNumber,
        date: parsedOcr.date || new Date().toISOString().slice(0, 10),
        currency: parsedOcr.currency,
        subtotal: parsedOcr.subtotal,
        tax: parsedOcr.tax,
        total: parsedOcr.total,
        bankName: parsedOcr.bankName,
        accountNumberLast4: parsedOcr.accountNumberLast4,
        routingNumber: parsedOcr.routingNumber,
        confidenceScore: parsedOcr.confidenceScore,
        uncertaintyScore: report.uncertaintyScore,
        uncertaintyLevel: report.uncertaintyLevel,
        uncertaintyReport: report,
        notes: parsedOcr.notes,
        forensicFindings: [],
      },
      sourceReference: `${source} (Offline local mode)`,
      rawContent: reviewText.slice(0, 12000),
      visualFlags: parsedOcr.visualFlags,
    };

    let matchedVendorId: string | undefined = undefined;
    let createdInvoiceId: string | undefined = undefined;

    if (parsedOcr.total && parsedOcr.total > 0 && parsedOcr.vendorName && parsedOcr.vendorName !== 'Unknown Vendor') {
      const extractedVendorName = parsedOcr.vendorName.toLowerCase();
      let vendor = vendors.find(v =>
        v.name.toLowerCase() === extractedVendorName || v.aliases.some(alias => alias.toLowerCase() === extractedVendorName)
      );
      if (!vendor) {
        const newVendor: VendorRecord = {
          id: `vend-${Date.now()}`,
          name: parsedOcr.vendorName,
          category: 'General Services',
          aliases: [parsedOcr.vendorName],
          availableIdentifiers: {
            verifiedEmailDomains: [],
            verifiedBankAccounts: !isFlagged && parsedOcr.accountNumberLast4 ? [
              { bankName: parsedOcr.bankName || 'Bank', last4: parsedOcr.accountNumberLast4, country: 'US' }
            ] : [],
          },
          associatedRecordIds: [docId],
          riskRating: isFlagged ? 'high' : 'low',
          monthlySpend: parsedOcr.total,
          currency: parsedOcr.currency || 'INR',
        };
        vendor = newVendor;
        setVendors(prev => [...prev, newVendor]);
      }
      matchedVendorId = vendor.id;

      const invId = `inv-${Date.now()}`;
      createdInvoiceId = invId;
      const newInvoice = {
        id: invId,
        vendorId: vendor.id,
        invoiceNumber: parsedOcr.invoiceNumber || `INV-${docId.slice(-6)}`,
        invoiceDate: parsedOcr.date || new Date().toISOString().slice(0, 10),
        currency: parsedOcr.currency || 'INR',
        subtotal: parsedOcr.subtotal || parsedOcr.total,
        tax: parsedOcr.tax || 0,
        total: parsedOcr.total,
        paymentDetails: {
          bankName: parsedOcr.bankName,
          accountNumberLast4: parsedOcr.accountNumberLast4,
          routingNumber: parsedOcr.routingNumber,
        },
        documentId: docId,
        visualFlags: parsedOcr.visualFlags,
      };
      setInvoices(prev => [...prev, newInvoice]);
    }

    if (isFlagged) {
      const anomalyRecord = createOcrAnomalyRecord(newDoc, parsedOcr, matchedVendorId, createdInvoiceId);
      const investigationId = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newInvestigation: InvestigationRecord = {
        id: investigationId,
        title: anomalyRecord.title,
        relatedVendorIds: matchedVendorId ? [matchedVendorId] : [],
        anomalyIds: [anomalyRecord.id],
        severity: anomalyRecord.severity,
        status: anomalyRecord.status,
        createdAt: anomalyRecord.createdAt,
        updatedAt: anomalyRecord.updatedAt,
        summaryNote: anomalyRecord.explanation,
        reviewHistory: [
          {
            id: `rev-${Date.now()}`,
            investigationId,
            anomalyId: anomalyRecord.id,
            action: 'NEEDS_REVIEW',
            notes: `Flagged by OCR Uncertainty & Forensic Integrity Classifier (${anomalyRecord.detectionRule}). Detected: ${report.detectedRisks.join('; ')}`,
            author: 'AuditLens Autonomous Sentinel',
            timestamp: new Date().toISOString(),
          }
        ]
      };

      newDoc.extractedFields.forensicFindings = [{
        id: anomalyRecord.id,
        title: anomalyRecord.title,
        severity: anomalyRecord.severity,
        explanation: anomalyRecord.explanation,
        category: anomalyRecord.category,
        uncertainty: anomalyRecord.uncertainty,
        investigationId,
      }];

      setAnomalies(prev => [anomalyRecord, ...prev]);
      setInvestigations(prev => [newInvestigation, ...prev]);
      setMetrics(prev => ({
        ...prev,
        unresolvedAnomalies: prev.unresolvedAnomalies + 1,
        overallScore: Math.max(82, prev.overallScore - 1.5),
      }));
    }

    setDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const resetToBaseline = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (err) {
      // ignore
    }
    setCompany(MOCK_COMPANY);
    setDocuments(MOCK_DOCUMENTS);
    setVendors(MOCK_VENDORS);
    setInvoices(MOCK_INVOICES);
    setTransactions(MOCK_TRANSACTIONS);
    setEmails(MOCK_EMAILS);
    setSubscriptions(MOCK_SUBSCRIPTIONS);
    setAnomalies(MOCK_ANOMALIES);
    setEdges(MOCK_EVIDENCE_EDGES);
    setInvestigations(MOCK_INVESTIGATIONS);
    setMetrics(MOCK_METRICS);
  };

  const saveApiKey = async (apiKey: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/settings/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error saving API key' };
    }
  };

  return (
    <DataContext.Provider
      value={{
        company,
        documents,
        vendors,
        invoices,
        transactions,
        emails,
        subscriptions,
        anomalies,
        edges,
        investigations,
        metrics,
        isLoading,
        isLiveApi,
        refreshData,
        updateInvestigationReview,
        uploadDocument,
        resetToBaseline,
        saveApiKey,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
