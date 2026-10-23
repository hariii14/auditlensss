import {
  DocumentRecord,
  InvoiceRecord,
  VendorRecord,
  AnomalyRecord,
  InvestigationRecord,
  EvidenceEdgeRecord
} from '../types';

export interface FieldConfidence {
  value: any;
  confidence: number; // 0 to 1
  status: 'verified' | 'inferred' | 'ambiguous' | 'missing' | 'suspicious' | 'valid' | 'labelled';
  note?: string;
}

export interface OcrUncertaintyReport {
  overallScore: number; // 0 (completely uncertain) to 1 (fully confident)
  uncertaintyScore: number; // 0 (no uncertainty) to 100 (extreme uncertainty)
  uncertaintyLevel: 'low' | 'medium' | 'high';
  fieldConfidences: {
    vendorName: FieldConfidence;
    invoiceNumber: FieldConfidence;
    date: FieldConfidence;
    totalAmount: FieldConfidence;
    subtotal: FieldConfidence;
    tax: FieldConfidence;
    remittance: FieldConfidence;
    arithmetic: {
      status: 'passed' | 'discrepancy' | 'unverifiable';
      discrepancy?: number;
      note?: string;
    };
  };
  detectedRisks: string[];
  visualFlags: string[];
  isAnomaly: boolean;
  suggestedAnomalyCategory:
    | 'VISUAL_OR_DOMAIN_IRREGULARITY'
    | 'ARITHMETIC_INCONSISTENCY'
    | 'BENEFICIARY_ALTERATION'
    | 'DUPLICATE_INVOICE'
    | 'AMOUNT_MISMATCH';
  suggestedSeverity: 'high' | 'medium' | 'low';
}

export interface ParsedOcrResult {
  vendorName: string | null;
  invoiceNumber: string | null;
  date: string | null;
  currency: string;
  subtotal: number | null;
  tax: number | null;
  discount: number | null;
  total: number | null;
  bankName: string | null;
  accountNumberLast4: string | null;
  routingNumber: string | null;
  visualFlags: string[];
  rawText: string;
  confidenceScore: number;
  uncertaintyReport: OcrUncertaintyReport;
  notes: string;
}

const SUSPICIOUS_PAYMENT_PATTERNS: Array<[string, RegExp]> = [
  ['Altered or redirect remittance instructions detected', /changed?\s+(?:bank|payment|remittance|account)|altered\s+(?:bank|payment|remittance)|updated\s+(?:bank|account|remittance)|new\s+banking\s+details/i],
  ['Urgent payment pressure language detected', /urgent|immediate\s+payment|pay\s+immediately|same\s*day\s+transfer|transfer\s+today/i],
  ['High-risk offshore or crypto beneficiary', /offshore|cayman|escrow|crypto|wallet|western\s+union|wire\s+to\s+personal/i],
  ['Unverified account update requested via invoice', /please\s+note\s+our\s+new|remit\s+to\s+new\s+account|do\s+not\s+send\s+to\s+old/i],
  ['Duplicate invoice or re-billing signal', /duplicate|already\s+billed|second\s+invoice|re-?\s*bill/i],
  ['Payment discrepancy or dispute warning', /discrepancy|mismatch|adjusted\s+amount|revised\s+balance/i],
];

/**
 * Normalizes numbers extracted from text, handling commas and periods.
 */
function cleanNumber(val: string): number | null {
  if (!val) return null;
  const cleaned = val.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Intelligent deterministic OCR Text Parser
 * Accurately identifies real invoice entities without random placeholders.
 */
export function parseOcrText(
  rawText: string,
  filename: string,
  baseConfidence: number = 0.85,
  knownVendors: VendorRecord[] = [],
  existingInvoices: InvoiceRecord[] = []
): ParsedOcrResult {
  const normalized = (rawText || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ');

  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Currency Detection
  let currency = 'INR';
  if (/(\$|USD|\bUSD\b)/i.test(normalized)) currency = 'USD';
  else if (/(€|EUR|\bEUR\b)/i.test(normalized)) currency = 'EUR';
  else if (/(£|GBP|\bGBP\b)/i.test(normalized)) currency = 'GBP';
  else if (/(₹|INR|\bINR\b|Rs\.?)/i.test(normalized)) currency = 'INR';

  // 2. Invoice Number Extraction
  let invoiceNumber: string | null = null;
  const invLinePatterns = [
    /(?:tax\s+invoice|invoice|inv|bill|receipt)\s*(?:no\.?|num(?:ber)?|#|id)?\s*[:=\-]\s*([A-Za-z0-9][A-Za-z0-9\/\-_]{1,30})/i,
    /(?:tax\s+invoice|invoice|inv|bill|receipt)\s+(?:no\.?|num(?:ber)?|#|id)\s*[:=\-]?\s*([A-Za-z0-9][A-Za-z0-9\/\-_]{1,30})/i,
    /(?:inv|invoice)[#\-]([A-Za-z0-9\-_]{2,25})/i,
    /#\s*([A-Za-z0-9\-_]{3,20})/,
  ];
  for (const line of lines) {
    for (const pat of invLinePatterns) {
      const match = line.match(pat);
      if (match && match[1] && !/^(date|total|amount|due|gst|inr|usd|vendor|services|bank|number|client|subtotal)$/i.test(match[1])) {
        invoiceNumber = match[1].trim();
        break;
      }
    }
    if (invoiceNumber) break;
  }

  // 3. Date Extraction
  let invoiceDate: string | null = null;
  const datePatterns = [
    /(?:invoice\s+date|issue\s+date|bill\s+date|date)\s*[:=\-]?\s*(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/i,
    /(?:invoice\s+date|issue\s+date|bill\s+date|date)\s*[:=\-]?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
    /(?:invoice\s+date|date)\s*[:=\-]?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i,
    /(\d{4}[-/.]\d{2}[-/.]\d{2})/,
  ];
  for (const pat of datePatterns) {
    const match = normalized.match(pat);
    if (match && match[1]) {
      const rawDate = match[1].trim();
      const parsed = Date.parse(rawDate);
      if (!isNaN(parsed)) {
        invoiceDate = new Date(parsed).toISOString().slice(0, 10);
        break;
      }
    }
  }

  // 4. Subtotal, Tax, and Stated Total Extraction
  let subtotal: number | null = null;
  const subtotalMatch = normalized.match(/(?:sub-?total|taxable\s+amount|net\s+amount|base\s+amount)\s*[:=\-]?\s*(?:₹|INR|Rs\.?|\$|USD|€|EUR|£|GBP)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i);
  if (subtotalMatch) {
    subtotal = cleanNumber(subtotalMatch[1]);
  }

  let tax: number | null = null;
  const taxMatch = normalized.match(/(?:tax|gst|vat|cgst\s*\+\s*sgst|sales\s+tax)(?:\s*\([^)]*\))?\s*[:=\-]?\s*(?:₹|INR|Rs\.?|\$|USD|€|EUR|£|GBP)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i);
  if (taxMatch) {
    tax = cleanNumber(taxMatch[1]);
  }

  let total: number | null = null;
  // Look for strongly labelled total lines
  const totalLabels = [
    /(?:grand\s+total|total\s+amount|amount\s+due|total\s+due|net\s+payable|balance\s+due|final\s+total|invoice\s+total)\s*[:=\-]?\s*(?:₹|INR|Rs\.?|\$|USD|€|EUR|£|GBP)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i,
    /(?:total)\s*[:=\-]\s*(?:₹|INR|Rs\.?|\$|USD|€|EUR|£|GBP)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i,
    /(?:total)\s+(?:₹|INR|Rs\.?|\$|USD|€|EUR|£|GBP)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i,
  ];

  for (const pat of totalLabels) {
    const match = normalized.match(pat);
    if (match && match[1]) {
      const val = cleanNumber(match[1]);
      if (val != null && val > 0 && val !== 2024 && val !== 2025 && val !== 2026) {
        total = val;
        break;
      }
    }
  }

  // If labelled total was not found, check if subtotal + tax reconcile to a number in the text
  const amountPattern = /(?:₹|INR|Rs\.?|USD|\$|€|EUR|£|GBP)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/ig;
  const allCurrencyAmounts = Array.from(normalized.matchAll(amountPattern))
    .map(m => cleanNumber(m[1]))
    .filter((n): n is number => n !== null && n > 0 && n !== 2024 && n !== 2025 && n !== 2026);

  if (total === null && subtotal !== null) {
    const expected = subtotal + (tax || 0);
    const reconciled = allCurrencyAmounts.find(a => Math.abs(a - expected) < 0.05);
    if (reconciled) {
      total = reconciled;
    } else if (allCurrencyAmounts.length > 0) {
      total = allCurrencyAmounts[allCurrencyAmounts.length - 1]; // Often the last currency figure is the bottom total
    }
  } else if (total === null && allCurrencyAmounts.length > 0) {
    // Pick the last currency amount or the largest plausible invoice figure
    total = allCurrencyAmounts[allCurrencyAmounts.length - 1];
  }

  // 5. Vendor Name Extraction
  let vendorName: string | null = null;
  // First priority: Match known vendors from registry
  for (const v of knownVendors) {
    const testNames = [v.name, ...v.aliases];
    for (const name of testNames) {
      if (new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(normalized)) {
        vendorName = v.name;
        break;
      }
    }
    if (vendorName) break;
  }

  // Second priority: Look for common corporate legal identifiers in top 10 lines
  if (!vendorName) {
    const topLines = lines.slice(0, 12);
    const vendorCandidate = topLines.find(line =>
      /(?:ltd|llp|inc|llc|gmbh|technologies|logistics|services|solutions|enterprises|studio|agency|corp|pvt)/i.test(line) &&
      !/(?:invoice|bill\s+to|ship\s+to|remit\s+to|payment|date|bank)/i.test(line) &&
      line.length > 3 &&
      line.length < 80
    );

    if (vendorCandidate) {
      vendorName = vendorCandidate.replace(/^(from|vendor|billed\s+by)\s*[:\-]?\s*/i, '').trim();
    }
  }

  // Third priority: Derived from filename if recognizable
  if (!vendorName && filename) {
    const base = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (!/^(invoice|bill|receipt|scan|doc|image|statement)/i.test(base) && base.trim().length > 3) {
      vendorName = base.trim().slice(0, 60);
    }
  }

  // 6. Bank & Remittance Details Extraction
  let bankName: string | null = null;
  let accountNumberLast4: string | null = null;
  let routingNumber: string | null = null;

  const bankMatch = normalized.match(/(?:bank\s+name|wire\s+to|remit\s+to|beneficiary\s+bank|bank)\s*[:=\-]?\s*([A-Za-z0-9 &.,'-]{3,50})/i);
  if (bankMatch) {
    const candidate = bankMatch[1].trim();
    if (!/^(account|no|num|iban|routing)/i.test(candidate)) {
      bankName = candidate;
    }
  }

  const acctMatch = normalized.match(/(?:account\s*(?:no\.?|number|#)?|a\/c\s*(?:no\.?)?|iban)[^\d\n]{0,20}(?:x+|\*+)?(\d{4,18})/i);
  if (acctMatch && acctMatch[1]) {
    accountNumberLast4 = acctMatch[1].slice(-4);
  }

  const routingMatch = normalized.match(/(?:routing|ifsc|swift|sort\s+code)[^\w\n]{0,10}([A-Z0-9]{4,11})/i);
  if (routingMatch) {
    routingNumber = routingMatch[1].trim();
  }

  // 7. Visual & Forensic Risk Signals
  const visualFlags: string[] = [];
  for (const [label, regex] of SUSPICIOUS_PAYMENT_PATTERNS) {
    if (regex.test(normalized)) {
      visualFlags.push(label);
    }
  }

  // 8. Run Uncertainty Analysis
  const uncertaintyReport = calculateOcrUncertainty({
    vendorName,
    invoiceNumber,
    date: invoiceDate,
    total,
    subtotal,
    tax,
    bankName,
    accountNumberLast4,
    rawText: normalized,
    baseConfidence,
    visualFlags,
    knownVendors,
    existingInvoices,
  });

  return {
    vendorName,
    invoiceNumber,
    date: invoiceDate,
    currency,
    subtotal,
    tax,
    discount: null,
    total,
    bankName,
    accountNumberLast4,
    routingNumber,
    visualFlags: Array.from(new Set([...visualFlags, ...uncertaintyReport.visualFlags])),
    rawText: normalized,
    confidenceScore: uncertaintyReport.overallScore,
    uncertaintyReport,
    notes: `OCR recognized ${lines.length} lines. Uncertainty level: ${uncertaintyReport.uncertaintyLevel.toUpperCase()} (${Math.round(uncertaintyReport.uncertaintyScore)}% uncertainty).`,
  };
}

/**
 * Calculates comprehensive OCR Uncertainty & Confidence
 */
export function calculateOcrUncertainty(input: {
  vendorName: string | null;
  invoiceNumber: string | null;
  date: string | null;
  total: number | null;
  subtotal: number | null;
  tax: number | null;
  bankName: string | null;
  accountNumberLast4: string | null;
  rawText: string;
  baseConfidence: number;
  visualFlags: string[];
  knownVendors: VendorRecord[];
  existingInvoices: InvoiceRecord[];
}): OcrUncertaintyReport {
  const risks: string[] = [];
  const addedFlags: string[] = [];
  let uncertaintyPenalty = 0;

  // 1. Text Quality Penalty
  if (input.baseConfidence < 0.70) {
    const penalty = Math.round((0.70 - input.baseConfidence) * 60);
    uncertaintyPenalty += penalty;
    risks.push(`Low OCR text quality / low DPI scan (confidence: ${Math.round(input.baseConfidence * 100)}%)`);
    addedFlags.push('Low-confidence character scan');
  }

  // 2. Vendor Confidence
  const vendorConf: FieldConfidence = {
    value: input.vendorName,
    confidence: 0.95,
    status: 'verified',
  };

  if (!input.vendorName || input.vendorName === 'Unknown Vendor' || input.vendorName === 'Unidentified Vendor') {
    vendorConf.confidence = 0.20;
    vendorConf.status = 'missing';
    vendorConf.note = 'Vendor entity could not be recognized from document header';
    uncertaintyPenalty += 25;
    risks.push('Vendor identity is unverified or missing from invoice');
    addedFlags.push('Vendor identification unverified');
  } else {
    const matchedVendor = input.knownVendors.find(
      v => v.name.toLowerCase() === input.vendorName!.toLowerCase() ||
           v.aliases.some(a => a.toLowerCase() === input.vendorName!.toLowerCase())
    );
    if (!matchedVendor) {
      vendorConf.confidence = 0.65;
      vendorConf.status = 'inferred';
      vendorConf.note = 'Extracted vendor is not in your verified vendor master directory';
      uncertaintyPenalty += 10;
      risks.push(`Vendor '${input.vendorName}' is new or unverified in company ledger`);
    } else {
      vendorConf.confidence = 0.95;
      vendorConf.status = 'verified';
    }
  }

  // 3. Invoice Number Confidence & Duplicate Check
  const invConf: FieldConfidence = {
    value: input.invoiceNumber,
    confidence: 0.95,
    status: 'valid',
  };

  if (!input.invoiceNumber) {
    invConf.confidence = 0.15;
    invConf.status = 'missing';
    invConf.note = 'No invoice identifier or serial number detected';
    uncertaintyPenalty += 20;
    risks.push('Missing or unreadable invoice number');
    addedFlags.push('Invoice reference number missing');
  } else {
    // Check for duplicate in existing ledger
    const isDup = input.existingInvoices.some(
      inv => inv.invoiceNumber.toLowerCase() === input.invoiceNumber!.toLowerCase()
    );
    if (isDup) {
      invConf.status = 'suspicious';
      invConf.confidence = 0.40;
      invConf.note = `Invoice #${input.invoiceNumber} already exists in your records`;
      uncertaintyPenalty += 30;
      risks.push(`Duplicate Invoice Number: #${input.invoiceNumber} was previously processed`);
      addedFlags.push(`Duplicate invoice number detected (#${input.invoiceNumber})`);
    }
  }

  // 4. Total Amount Confidence
  const totalConf: FieldConfidence = {
    value: input.total,
    confidence: 0.90,
    status: 'labelled',
  };

  if (input.total === null || input.total <= 0) {
    totalConf.confidence = 0.10;
    totalConf.status = 'missing';
    totalConf.note = 'Total amount payable could not be determined';
    uncertaintyPenalty += 35;
    risks.push('Total amount payable could not be read from document');
    addedFlags.push('Unreadable invoice total');
  }

  // 5. Arithmetic Check: Subtotal + Tax = Total
  let arithmeticCheck: OcrUncertaintyReport['fieldConfidences']['arithmetic'] = {
    status: 'unverifiable',
    note: 'Subtotal or tax figures not itemized',
  };

  if (input.subtotal != null && input.tax != null && input.total != null) {
    const computed = Math.round((input.subtotal + input.tax) * 100) / 100;
    const diff = Math.abs(computed - Math.round(input.total * 100) / 100);
    if (diff > 0.05) {
      arithmeticCheck = {
        status: 'discrepancy',
        discrepancy: diff,
        note: `Subtotal (${input.subtotal}) + Tax (${input.tax}) = ${computed}, but stated Total is ${input.total} (Variance: ${diff.toFixed(2)})`,
      };
      uncertaintyPenalty += 25;
      risks.push(`Arithmetic discrepancy of ${diff.toFixed(2)} between stated total and line items`);
      addedFlags.push(`Line-item arithmetic discrepancy (${diff.toFixed(2)})`);
    } else {
      arithmeticCheck = {
        status: 'passed',
        note: 'Subtotal + Tax perfectly reconciles with Total',
      };
    }
  }

  // 6. Remittance / Bank Account Verification
  const remitConf: FieldConfidence = {
    value: input.accountNumberLast4 ? `${input.bankName || 'Bank'} (*${input.accountNumberLast4})` : null,
    confidence: 0.85,
    status: 'verified',
  };

  if (input.accountNumberLast4 && input.vendorName) {
    const vendorRecord = input.knownVendors.find(
      v => v.name.toLowerCase() === input.vendorName!.toLowerCase()
    );
    if (vendorRecord && vendorRecord.availableIdentifiers.verifiedBankAccounts.length > 0) {
      const match = vendorRecord.availableIdentifiers.verifiedBankAccounts.some(
        a => a.last4 === input.accountNumberLast4
      );
      if (!match) {
        remitConf.status = 'suspicious';
        remitConf.confidence = 0.25;
        remitConf.note = `Account *${input.accountNumberLast4} does not match verified historical records for ${vendorRecord.name}`;
        uncertaintyPenalty += 35;
        risks.push(`Remittance account mismatch: *${input.accountNumberLast4} is not on file for ${vendorRecord.name}`);
        addedFlags.push('Unverified remittance destination');
      }
    }
  }

  // 7. Visual / Fraud flags penalty
  if (input.visualFlags.length > 0) {
    uncertaintyPenalty += input.visualFlags.length * 15;
    for (const flag of input.visualFlags) {
      risks.push(`Forensic signal: ${flag}`);
    }
  }

  // Final Score Aggregation
  const uncertaintyScore = Math.min(100, Math.max(5, uncertaintyPenalty));
  const overallScore = Math.max(0.05, Math.min(0.99, (100 - uncertaintyScore) / 100));

  const uncertaintyLevel: 'low' | 'medium' | 'high' =
    uncertaintyScore >= 50 ? 'high' : uncertaintyScore >= 25 ? 'medium' : 'low';

  const isAnomaly = uncertaintyScore >= 30 || risks.length > 0 || arithmeticCheck.status === 'discrepancy';

  // Determine suggested anomaly category
  let suggestedAnomalyCategory: OcrUncertaintyReport['suggestedAnomalyCategory'] = 'VISUAL_OR_DOMAIN_IRREGULARITY';
  if (arithmeticCheck.status === 'discrepancy') {
    suggestedAnomalyCategory = 'ARITHMETIC_INCONSISTENCY';
  } else if (remitConf.status === 'suspicious') {
    suggestedAnomalyCategory = 'BENEFICIARY_ALTERATION';
  } else if (invConf.status === 'suspicious') {
    suggestedAnomalyCategory = 'DUPLICATE_INVOICE';
  }

  return {
    overallScore,
    uncertaintyScore,
    uncertaintyLevel,
    fieldConfidences: {
      vendorName: vendorConf,
      invoiceNumber: invConf,
      date: {
        value: input.date,
        confidence: input.date ? 0.90 : 0.40,
        status: input.date ? 'verified' : 'missing',
        note: input.date ? undefined : 'Invoice date is missing or illegible',
      },
      totalAmount: totalConf,
      subtotal: {
        value: input.subtotal,
        confidence: input.subtotal ? 0.85 : 0.50,
        status: input.subtotal ? 'verified' : 'inferred',
      },
      tax: {
        value: input.tax,
        confidence: input.tax !== null ? 0.85 : 0.50,
        status: input.tax !== null ? 'verified' : 'inferred',
      },
      remittance: remitConf,
      arithmetic: arithmeticCheck,
    },
    detectedRisks: risks,
    visualFlags: addedFlags,
    isAnomaly,
    suggestedAnomalyCategory,
    suggestedSeverity: uncertaintyLevel === 'high' ? 'high' : 'medium',
  };
}

/**
 * Creates a forensic AnomalyRecord from an OCR uncertainty report
 */
export function createOcrAnomalyRecord(
  doc: DocumentRecord,
  parsed: ParsedOcrResult,
  vendorId?: string,
  invoiceId?: string
): AnomalyRecord {
  const report = parsed.uncertaintyReport;
  const isArithmetic = report.suggestedAnomalyCategory === 'ARITHMETIC_INCONSISTENCY';
  const isBeneficiary = report.suggestedAnomalyCategory === 'BENEFICIARY_ALTERATION';
  const isDuplicate = report.suggestedAnomalyCategory === 'DUPLICATE_INVOICE';

  let title = `OCR Extraction Uncertainty Flagged: ${parsed.invoiceNumber || doc.filename}`;
  if (isArithmetic) {
    title = `OCR Arithmetic Inconsistency: Stated Total (${parsed.currency} ${parsed.total}) disagrees with Line Items`;
  } else if (isBeneficiary) {
    title = `Suspicious Remittance Destination on Scanned Invoice: ${parsed.invoiceNumber || doc.filename}`;
  } else if (isDuplicate) {
    title = `Potential Duplicate Invoice Scan Detected: #${parsed.invoiceNumber}`;
  } else if (report.uncertaintyLevel === 'high') {
    title = `High Forensic Uncertainty in Scanned Document: ${parsed.vendorName || doc.filename}`;
  }

  const supportingRecordIds = [doc.id];
  if (invoiceId) supportingRecordIds.push(invoiceId);
  if (vendorId) supportingRecordIds.push(vendorId);

  return {
    id: `anom-ocr-${doc.id}`,
    title,
    category: report.suggestedAnomalyCategory,
    severity: report.suggestedSeverity,
    amountInDispute: isArithmetic && report.fieldConfidences.arithmetic.discrepancy
      ? report.fieldConfidences.arithmetic.discrepancy
      : (parsed.total || undefined),
    currency: parsed.currency || 'INR',
    explanation: `AuditLens Multimodal OCR scanned this document with ${Math.round(report.overallScore * 100)}% confidence (${Math.round(report.uncertaintyScore)}% uncertainty score). Critical forensic findings: ${report.detectedRisks.join('; ')}.`,
    supportingRecordIds,
    detectionMethod: 'Autonomous OCR Uncertainty & Forensic Integrity Classifier (Rule #9)',
    detectionRule: isArithmetic
      ? 'RULE_INVOICE_LINE_ITEM_ARITHMETIC'
      : isBeneficiary
      ? 'RULE_BENEFICIARY_ALTERATION_AND_SPOOFING'
      : isDuplicate
      ? 'RULE_DUPLICATE_INVOICE_NUMBER'
      : 'RULE_OCR_EXTRACTION_UNCERTAINTY',
    uncertainty: `Document uncertainty rated ${report.uncertaintyLevel.toUpperCase()}. Optical character extraction detected ambiguities in ${
      Object.entries(report.fieldConfidences)
        .filter(([, v]) => (v as any).status === 'missing' || (v as any).status === 'suspicious' || (v as any).status === 'discrepancy')
        .map(([k]) => k)
        .join(', ') || 'payment instructions'
    }.`,
    verificationChecklist: [
      'Examine the original high-resolution scan against extracted fields.',
      'Confirm vendor name and remittance bank details with an established corporate contact.',
      ...(isArithmetic ? ['Reconcile individual line-item tax and discounts with vendor.'] : []),
      'Verify authorization in internal ERP prior to approving payment.',
    ],
    status: 'NEEDS_REVIEW',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
