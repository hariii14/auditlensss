export type DocumentType =
  | 'invoice_pdf'
  | 'receipt_img'
  | 'bank_statement'
  | 'csv_transactions'
  | 'vendor_email'
  | 'contract_doc';

export type ProcessingStatus = 'pending' | 'processing' | 'parsed' | 'flagged' | 'failed';

export interface DocumentRecord {
  id: string;
  filename: string;
  type: DocumentType;
  uploadDate: string;
  processingStatus: ProcessingStatus;
  fileSize?: number;
  extractedFields: {
    vendorName?: string | null;
    invoiceNumber?: string | null;
    date?: string | null;
    currency?: string | null;
    subtotal?: number | null;
    tax?: number | null;
    cgst?: number | null;
    sgst?: number | null;
    igst?: number | null;
    taxRatePercent?: number | null;
    expectedTax?: number | null;
    total?: number | null;
    expectedTotal?: number | null;
    amountInWords?: string | null;
    amountInWordsNumeric?: number | null;
    bankName?: string | null;
    accountNumberLast4?: string | null;
    routingNumber?: string | null;
    confidenceScore?: number;
    uncertaintyScore?: number;
    uncertaintyLevel?: 'low' | 'medium' | 'high';
    uncertaintyReport?: any;
    forensicFindings?: any[];
    forensicAnalysis?: {
      mainReasons: Array<{
        id: string;
        title: string;
        evidence: string;
        severity: 'high' | 'medium' | 'low';
        type: 'GST_MISMATCH' | 'TOTAL_MISMATCH' | 'AMOUNT_IN_WORDS_MISMATCH' | 'DISCOUNT_MISMATCH' | 'REMITTANCE_DIVERGENCE' | 'OTHER';
      }>;
      gstMismatch?: {
        detected: boolean;
        statedRate?: number | null;
        subtotal?: number | null;
        expectedTax?: number | null;
        actualCgst?: number | null;
        actualSgst?: number | null;
        actualTotalTax?: number | null;
        evidence: string;
      };
      totalMismatch?: {
        detected: boolean;
        subtotal?: number | null;
        totalTax?: number | null;
        expectedTotal?: number | null;
        shownTotal?: number | null;
        discrepancy?: number | null;
        evidence: string;
      };
      amountInWordsMismatch?: {
        detected: boolean;
        words?: string | null;
        wordsNumeric?: number | null;
        shownTotal?: number | null;
        discrepancy?: number | null;
        evidence: string;
      };
      otherDiscrepancies?: string[];
    };
    notes?: string | null;
    [key: string]: any;
  };
  sourceReference: string;
  rawContent?: string;
  visualFlags?: string[];
  thumbnailUrl?: string;
}

export interface ForensicCalculationAudit {
  subtotal?: number | null;
  cgst?: number | null;
  sgst?: number | null;
  igst?: number | null;
  totalTax?: number | null;
  statedTaxRate?: number | null;
  expectedTax?: number | null;
  expectedTotal?: number | null;
  shownTotal?: number | null;
  amountInWords?: string | null;
  amountInWordsNumeric?: number | null;
  totalDiscrepancy?: number | null;
  gstDiscrepancy?: number | null;
  wordsDiscrepancy?: number | null;
}

export interface ForensicPrimaryReason {
  id: string;
  title: string;
  evidence: string;
  severity: AnomalySeverity;
  type: string;
}

export interface BankAccountDetails {
  bankName: string;
  last4: string;
  routingNumber?: string;
  country: string;
  accountHolder?: string;
}

export interface VendorRecord {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  availableIdentifiers: {
    taxId?: string;
    verifiedEmailDomains: string[];
    verifiedBankAccounts: BankAccountDetails[];
    phone?: string;
    contactPerson?: string;
  };
  associatedRecordIds: string[];
  riskRating: 'low' | 'medium' | 'high';
  monthlySpend: number;
  currency: string;
  lastAuditDate?: string;
}

export interface InvoiceRecord {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  currency: string;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  paymentDetails: {
    bankName?: string | null;
    accountNumberLast4?: string | null;
    routingNumber?: string | null;
    accountHolder?: string | null;
    country?: string | null;
    remittanceNotes?: string | null;
  };
  documentId: string;
  visualFlags?: string[];
}

export interface TransactionRecord {
  id: string;
  date: string;
  description: string;
  vendorId?: string;
  currency: string;
  amount: number;
  direction: 'debit' | 'credit';
  reference: string;
  sourceDocumentId?: string;
  accountName: string;
  reconciledInvoiceId?: string;
  status: 'reconciled' | 'flagged' | 'unmatched';
}

export interface EmailRecord {
  id: string;
  sender: string;
  senderDomain: string;
  recipient: string;
  date: string;
  vendorId?: string;
  subject: string;
  body: string;
  documentId?: string;
  domainFlags?: {
    isTyposquatCandidate: boolean;
    similarityToDomain?: string;
    spfDkimPassed?: boolean;
    headerAlert?: string;
  };
}

export interface SubscriptionRecord {
  id: string;
  vendorId: string;
  productName: string;
  billingPeriod: 'monthly' | 'annual';
  amount: number;
  currency: string;
  contractDocumentId?: string;
  seatCount?: number;
  activeLoginsLast90Days?: number;
  paymentMethodRef?: string;
  renewalDate?: string;
  status: 'active' | 'zombie' | 'duplicate';
}

export type AnomalyCategory =
  | 'DUPLICATE_PAYMENT'
  | 'DUPLICATE_INVOICE'
  | 'AMOUNT_MISMATCH'
  | 'BENEFICIARY_ALTERATION'
  | 'CONFLICTING_PAYMENT_DETAILS'
  | 'SAAS_OVERLAP'
  | 'ARITHMETIC_INCONSISTENCY'
  | 'VISUAL_OR_DOMAIN_IRREGULARITY';

export type AnomalySeverity = 'high' | 'medium' | 'low';
export type ReviewStatus = 'NEEDS_REVIEW' | 'VERIFIED_LEGITIMATE' | 'ESCALATED' | 'RESOLVED';

export interface AnomalyRecord {
  id: string;
  title: string;
  category: AnomalyCategory;
  severity: AnomalySeverity;
  amountInDispute?: number;
  currency: string;
  explanation: string;
  supportingRecordIds: string[];
  detectionMethod: string;
  detectionRule: string;
  uncertainty: string;
  verificationChecklist: string[];
  status: ReviewStatus;
  primaryEvidenceReasons?: ForensicPrimaryReason[];
  calculationAudit?: ForensicCalculationAudit;
  createdAt: string;
  updatedAt: string;
}

export type EdgeRelationship =
  | 'ISSUED_BY'
  | 'PAID_BY'
  | 'MENTIONS'
  | 'MATCHES'
  | 'CONFLICTS_WITH'
  | 'POSSIBLE_DUPLICATE_OF'
  | 'SUPPORTS_ANOMALY'
  | 'REQUIRES_VERIFICATION';

export interface EvidenceEdgeRecord {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationship: EdgeRelationship;
  explanation: string;
  supportingRecordIds: string[];
  detectionRule?: string;
  isFlagged?: boolean;
}

export interface ReviewEvent {
  id: string;
  investigationId: string;
  anomalyId: string;
  action: ReviewStatus | 'NOTE_ADDED';
  notes: string;
  author: string;
  timestamp: string;
}

export interface InvestigationRecord {
  id: string;
  title: string;
  relatedVendorIds: string[];
  anomalyIds: string[];
  severity: AnomalySeverity;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  reviewHistory: ReviewEvent[];
  summaryNote?: string;
}

export interface AuditCleanlinessMetric {
  overallScore: number; // e.g. 98.2
  reconciledCount: number;
  totalTransactions: number;
  unresolvedAnomalies: number;
  taxReadinessPercent: number;
  recoveredAmount: number;
  preventedFraudAmount: number;
}
