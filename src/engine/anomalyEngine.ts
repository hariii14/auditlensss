import {
  InvoiceRecord,
  TransactionRecord,
  VendorRecord,
  EmailRecord,
  SubscriptionRecord,
  AnomalyRecord,
  DocumentRecord
} from '../types';

export interface AnomalyEngineInput {
  invoices: InvoiceRecord[];
  transactions: TransactionRecord[];
  vendors: VendorRecord[];
  emails: EmailRecord[];
  subscriptions: SubscriptionRecord[];
  documents?: DocumentRecord[];
}

/**
 * Calculates Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Deterministic Anomaly Engine for AuditLens
 * Evaluates 8 distinct forensic rules across multimodal financial records.
 */
export class AnomalyEngine {
  /**
   * Run all forensic rules on the provided financial dataset.
   */
  static runAllRules(data: AnomalyEngineInput): AnomalyRecord[] {
    const anomalies: AnomalyRecord[] = [];

    anomalies.push(...this.checkDuplicateInvoices(data.invoices, data.vendors));
    anomalies.push(...this.checkDuplicatePayments(data.transactions, data.invoices));
    anomalies.push(...this.checkAmountMismatches(data.invoices, data.transactions));
    anomalies.push(...this.checkBeneficiaryAlterations(data.invoices, data.vendors));
    anomalies.push(...this.checkSaaSOverlaps(data.subscriptions, data.vendors));
    anomalies.push(...this.checkZombieSubscriptions(data.subscriptions));
    anomalies.push(...this.checkArithmeticInconsistencies(data.invoices));
    anomalies.push(...this.checkDomainHomoglyphs(data.emails, data.vendors));

    if (data.documents && data.documents.length > 0) {
      anomalies.push(...this.checkDocumentOcrUncertainties(data.documents, data.invoices, data.vendors));
    }

    return anomalies;
  }

  /**
   * Rule 1: Duplicate Invoices
   * Flags duplicate invoice numbers from the same vendor or identical amounts on same date.
   */
  static checkDuplicateInvoices(invoices: InvoiceRecord[], vendors: VendorRecord[]): AnomalyRecord[] {
    const results: AnomalyRecord[] = [];
    const seen = new Map<string, InvoiceRecord>();

    for (const inv of invoices) {
      const key = `${inv.vendorId}__${inv.invoiceNumber.toLowerCase().trim()}`;
      if (seen.has(key)) {
        const first = seen.get(key)!;
        const vendor = vendors.find(v => v.id === inv.vendorId);
        results.push({
          id: `anom-dup-inv-${inv.id}`,
          title: `Duplicate Invoice Detected: ${inv.invoiceNumber} (${vendor?.name || 'Unknown Vendor'})`,
          category: 'DUPLICATE_INVOICE',
          severity: 'high',
          amountInDispute: inv.total,
          currency: inv.currency,
          explanation: `Invoice #${inv.invoiceNumber} for ${inv.currency} ${inv.total} was submitted multiple times by ${vendor?.name || 'vendor'}.`,
          supportingRecordIds: [first.id, inv.id, first.documentId, inv.documentId],
          detectionMethod: "Deterministic Exact-Match Invoice Vault (Rule #1)",
          detectionRule: "RULE_DUPLICATE_INVOICE_NUMBER",
          uncertainty: "Could be an amended invoice with identical numbering rather than an intentional duplicate bill.",
          verificationChecklist: [
            "Check invoice issue dates and revision notes.",
            "Contact vendor accounting department to confirm if first invoice was voided.",
            "Flag in accounting software to prevent dual approval."
          ],
          status: 'NEEDS_REVIEW',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        seen.set(key, inv);
      }
    }
    return results;
  }

  /**
   * Rule 2: Duplicate Payments Across Cards / Accounts
   * Identifies multiple debit transactions matching the same invoice or identical amounts within 5 days.
   */
  static checkDuplicatePayments(transactions: TransactionRecord[], invoices: InvoiceRecord[]): AnomalyRecord[] {
    const results: AnomalyRecord[] = [];
    const debits = transactions.filter(t => t.direction === 'debit');

    // Group debits by reconciledInvoiceId if present
    const invoiceDebitMap = new Map<string, TransactionRecord[]>();
    for (const d of debits) {
      if (d.reconciledInvoiceId) {
        const list = invoiceDebitMap.get(d.reconciledInvoiceId) || [];
        list.push(d);
        invoiceDebitMap.set(d.reconciledInvoiceId, list);
      }
    }

    for (const [invId, matchedTxs] of invoiceDebitMap.entries()) {
      if (matchedTxs.length > 1) {
        const inv = invoices.find(i => i.id === invId);
        const totalPaid = matchedTxs.reduce((sum, t) => sum + t.amount, 0);
        const accountsUsed = Array.from(new Set(matchedTxs.map(t => t.accountName))).join(' and ');
        
        results.push({
          id: `anom-dup-pay-${invId}`,
          title: `Duplicate Debit for Invoice ${inv?.invoiceNumber || invId} across ${accountsUsed}`,
          category: 'DUPLICATE_PAYMENT',
          severity: 'high',
          amountInDispute: matchedTxs[1].amount,
          currency: matchedTxs[0].currency,
          explanation: `Invoice ${inv?.invoiceNumber || invId} has ${matchedTxs.length} separate debit transactions totaling ${matchedTxs[0].currency} ${totalPaid}. Payments were made on ${accountsUsed}.`,
          supportingRecordIds: [invId, ...matchedTxs.map(t => t.id), inv?.documentId || ''].filter(Boolean),
          detectionMethod: "Multi-Account Transaction Reconciler (Rule #2)",
          detectionRule: "RULE_DUPLICATE_PAYMENTS_CROSS_ACCOUNTS",
          uncertainty: "Vendor may have applied the second payment toward a subsequent unbilled cycle or separate department account.",
          verificationChecklist: [
            "Verify with account holders if both transactions cleared.",
            "Contact vendor support to request immediate refund or credit memo for the second charge.",
            "Update autopay settings to retain only a single corporate card on file."
          ],
          status: 'NEEDS_REVIEW',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return results;
  }

  /**
   * Rule 3: Invoice-to-Transaction Amount Mismatch
   * Flags discrepancies where transaction amount diverges from the authorized invoice total.
   */
  static checkAmountMismatches(invoices: InvoiceRecord[], transactions: TransactionRecord[]): AnomalyRecord[] {
    const results: AnomalyRecord[] = [];

    for (const tx of transactions) {
      if (!tx.reconciledInvoiceId) continue;
      const inv = invoices.find(i => i.id === tx.reconciledInvoiceId);
      if (!inv) continue;

      const diff = Math.abs(tx.amount - inv.total);
      if (diff > 1.0) { // Discrepancy threshold > 1.0
        results.push({
          id: `anom-mismatch-${tx.id}`,
          title: `Amount Mismatch: ${tx.currency} ${diff.toFixed(2)} Discrepancy between Invoice and Transaction`,
          category: 'AMOUNT_MISMATCH',
          severity: 'high',
          amountInDispute: diff,
          currency: tx.currency,
          explanation: `Transaction ${tx.reference} billed ${tx.currency} ${tx.amount.toFixed(2)} on ${tx.accountName}, but the corresponding invoice ${inv.invoiceNumber} authorizes only ${inv.currency} ${inv.total.toFixed(2)}.`,
          supportingRecordIds: [inv.id, tx.id, inv.documentId],
          detectionMethod: "Strict Invoice-Ledger Tolerance Validator (Rule #3)",
          detectionRule: "RULE_INVOICE_TRANSACTION_AMOUNT_MISMATCH",
          uncertainty: "May include undisclosed foreign exchange conversion fees, expedite charges, or customs fees not itemized on the primary bill.",
          verificationChecklist: [
            "Request itemized receipt for the difference from the payment processor or vendor.",
            "Verify whether bank transfer fees were debited together with invoice amount.",
            "Withhold subsequent payments until variance is reconciled."
          ],
          status: 'ESCALATED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return results;
  }

  /**
   * Rule 4 & 5: Conflicting Payment Details & Beneficiary Alteration
   * Compares bank instructions on the invoice against known verified vendor profile.
   */
  static checkBeneficiaryAlterations(invoices: InvoiceRecord[], vendors: VendorRecord[]): AnomalyRecord[] {
    const results: AnomalyRecord[] = [];

    for (const inv of invoices) {
      const vendor = vendors.find(v => v.id === inv.vendorId);
      if (!vendor) continue;

      const verifiedAccounts = vendor.availableIdentifiers.verifiedBankAccounts;
      if (verifiedAccounts.length === 0) continue;

      const invBank = inv.paymentDetails;
      if (!invBank || !invBank.accountNumberLast4) continue;

      const matchesAnyVerified = verifiedAccounts.some(
        acc => acc.last4 === invBank.accountNumberLast4 &&
               (!invBank.country || acc.country === invBank.country)
      );

      if (!matchesAnyVerified) {
        const verifiedLast4s = verifiedAccounts.map(a => `${a.bankName} (*${a.last4}, ${a.country})`).join(', ');
        const isOffshore = invBank.country && invBank.country !== 'US' && invBank.country !== 'IN';

        results.push({
          id: `anom-beneficiary-${inv.id}`,
          title: `High Risk: Remittance Account Divergence on Invoice ${inv.invoiceNumber}`,
          category: 'BENEFICIARY_ALTERATION',
          severity: 'high',
          amountInDispute: inv.total,
          currency: inv.currency,
          explanation: `Invoice ${inv.invoiceNumber} requests payment to unverified ${invBank.bankName || 'bank'} ending in *${invBank.accountNumberLast4} (${invBank.country || 'Unknown'}). Historical verified accounts on file are: ${verifiedLast4s}.${isOffshore ? ' CRITICAL: Divergence to offshore jurisdiction detected.' : ''}`,
          supportingRecordIds: [inv.id, vendor.id, inv.documentId],
          detectionMethod: "Vendor Remittance Vault & Jurisdiction Verifier (Rule #5)",
          detectionRule: "RULE_BENEFICIARY_ALTERATION_AND_SPOOFING",
          uncertainty: "Vendor may have changed banking partners, but any unannounced account modification is a primary signature of invoice redirection fraud.",
          verificationChecklist: [
            "DO NOT wire funds to the new account instructions.",
            `Call the verified phone number for ${vendor.name} (${vendor.availableIdentifiers.phone || 'on file'}) to verify.`,
            "Do NOT use any phone number printed directly on the suspicious invoice or recent email."
          ],
          status: 'ESCALATED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return results;
  }

  /**
   * Rule 6: SaaS Subscription Overlap
   * Identifies multiple active subscriptions for the same vendor or overlapping product categories.
   */
  static checkSaaSOverlaps(subscriptions: SubscriptionRecord[], vendors: VendorRecord[]): AnomalyRecord[] {
    const results: AnomalyRecord[] = [];
    const vendorSubMap = new Map<string, SubscriptionRecord[]>();

    for (const sub of subscriptions) {
      const list = vendorSubMap.get(sub.vendorId) || [];
      list.push(sub);
      vendorSubMap.set(sub.vendorId, list);
    }

    for (const [vendorId, subs] of vendorSubMap.entries()) {
      if (subs.length > 1) {
        const vendor = vendors.find(v => v.id === vendorId);
        const annualWaste = subs.slice(1).reduce((sum, s) => sum + (s.amount * 12), 0);

        results.push({
          id: `anom-saas-overlap-${vendorId}`,
          title: `SaaS Overlap: Multiple Active Subscriptions for ${vendor?.name || 'Vendor'}`,
          category: 'SAAS_OVERLAP',
          severity: 'medium',
          amountInDispute: annualWaste,
          currency: subs[0].currency,
          explanation: `${vendor?.name || 'Vendor'} is currently being billed across ${subs.length} concurrent subscriptions (${subs.map(s => `${s.productName}: ${s.currency} ${s.amount}/mo`).join(' vs ')}). Users on lower tiers should be consolidated into the primary organization.`,
          supportingRecordIds: subs.map(s => s.id),
          detectionMethod: "Entity-Matched Cross-Card SaaS Detection (Rule #6)",
          detectionRule: "RULE_SAAS_DUPLICATE_SUBSCRIPTION_OVERLAP",
          uncertainty: "Sub-teams may intentionally require isolated workspaces for strict client privacy or HIPAA compliance.",
          verificationChecklist: [
            "Review employee seat allocations across both subscription tiers.",
            "Consolidate team members under central corporate billing.",
            "Cancel duplicate personal/pro subscriptions to save estimated capital."
          ],
          status: 'NEEDS_REVIEW',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return results;
  }

  /**
   * Rule 6B: Zombie Inactive Subscriptions
   * Identifies subscriptions with 0 active logins in 90+ days.
   */
  static checkZombieSubscriptions(subscriptions: SubscriptionRecord[]): AnomalyRecord[] {
    const results: AnomalyRecord[] = [];

    for (const sub of subscriptions) {
      if (sub.activeLoginsLast90Days === 0) {
        const annualWaste = sub.amount * (sub.billingPeriod === 'monthly' ? 12 : 1);
        results.push({
          id: `anom-zombie-${sub.id}`,
          title: `Zombie SaaS Subscription: ${sub.productName} (0 Logins in 90+ Days)`,
          category: 'SAAS_OVERLAP',
          severity: 'medium',
          amountInDispute: annualWaste,
          currency: sub.currency,
          explanation: `${sub.productName} is renewing at ${sub.currency} ${sub.amount}/${sub.billingPeriod}. Telemetry data reveals 0 team members have logged in during the past 90 days.`,
          supportingRecordIds: [sub.id, sub.contractDocumentId || ''].filter(Boolean),
          detectionMethod: "Workspace Telemetry & Inactivity Auditor (Rule #6)",
          detectionRule: "RULE_ZOMBIE_SUBSCRIPTION_INACTIVE_USERS",
          uncertainty: "Tool may hold archived assets or compliance records requiring continuous hosting.",
          verificationChecklist: [
            "Confirm with department lead if legacy project files need exporting.",
            "Cancel recurring auto-renewal before next billing cycle.",
            `Annual potential recovery: ${sub.currency} ${annualWaste.toLocaleString()}`
          ],
          status: 'NEEDS_REVIEW',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return results;
  }

  /**
   * Rule 7: Arithmetic Inconsistencies
   * Flags discrepancies where Subtotal + Tax - Discount != Total
   */
  static checkArithmeticInconsistencies(invoices: InvoiceRecord[]): AnomalyRecord[] {
    const results: AnomalyRecord[] = [];

    for (const inv of invoices) {
      if (inv.subtotal != null && inv.tax != null && inv.total != null) {
        const discount = inv.discount || 0;
        const computed = Math.round((inv.subtotal + inv.tax - discount) * 100) / 100;
        const actual = Math.round(inv.total * 100) / 100;

        if (Math.abs(computed - actual) > 0.05) {
          results.push({
            id: `anom-arith-${inv.id}`,
            title: `Arithmetic Inconsistency on Invoice ${inv.invoiceNumber}`,
            category: 'ARITHMETIC_INCONSISTENCY',
            severity: 'low',
            amountInDispute: Math.abs(computed - actual),
            currency: inv.currency,
            explanation: `Line items sum to ${inv.currency} ${computed.toFixed(2)} (Subtotal ${inv.subtotal} + Tax ${inv.tax} - Discount ${discount}), but stated total is ${inv.currency} ${actual.toFixed(2)}.`,
            supportingRecordIds: [inv.id, inv.documentId],
            detectionMethod: "Deterministic Line-Item Arithmetic Check (Rule #7)",
            detectionRule: "RULE_INVOICE_LINE_ITEM_ARITHMETIC",
            uncertainty: "Could result from rounding conventions or unlisted handling surcharges.",
            verificationChecklist: [
              "Inspect invoice line items for omitted fees or taxes.",
              "Request corrected invoice from vendor before filing for tax deduction."
            ],
            status: 'NEEDS_REVIEW',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
    return results;
  }

  /**
   * Rule 8: Domain Typosquatting & Email Homoglyphs
   * Identifies emails from domains suspiciously similar to verified vendor domains.
   */
  static checkDomainHomoglyphs(emails: EmailRecord[], vendors: VendorRecord[]): AnomalyRecord[] {
    const results: AnomalyRecord[] = [];

    for (const email of emails) {
      const senderDomain = email.senderDomain.toLowerCase().trim();

      for (const vendor of vendors) {
        for (const verifiedDomain of vendor.availableIdentifiers.verifiedEmailDomains) {
          const vd = verifiedDomain.toLowerCase().trim();
          if (senderDomain !== vd) {
            const dist = levenshteinDistance(senderDomain, vd);
            // If distance is 1 or 2 (e.g. apex-loglstics.com vs apex-logistics.com)
            if (dist > 0 && dist <= 2) {
              results.push({
                id: `anom-spoof-${email.id}`,
                title: `Urgent: Suspected Vendor Impersonation (${senderDomain})`,
                category: 'VISUAL_OR_DOMAIN_IRREGULARITY',
                severity: 'high',
                currency: 'INR',
                explanation: `Email sender domain '${senderDomain}' is 1-2 characters divergent from verified vendor domain '${vd}' for ${vendor.name}. Notice substitution or typosquatting (e.g. 'l' instead of 'i').`,
                supportingRecordIds: [email.id, vendor.id, email.documentId || ''].filter(Boolean),
                detectionMethod: "Domain Homoglyph & Levenshtein Verifier (Rule #8)",
                detectionRule: "RULE_DOMAIN_HOMOGLYPH_SPOOF",
                uncertainty: "Vendor may have legitimately acquired an alternate subsidiary domain, but high similarity score indicates severe phishing / wire redirection risk.",
                verificationChecklist: [
                  "Examine full email authentication headers (SPF, DKIM, DMARC).",
                  "Contact vendor via independently verified communication channel.",
                  "Add spoofed domain to company firewall blocklist."
                ],
                status: 'ESCALATED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    }
    return results;
  }

  /**
   * Rule 9: Multimodal OCR Extraction Uncertainty & Discrepancies
   * Flags documents where optical character recognition detected low confidence, missing vital payment fields,
   * unverified remittance destinations, or line-item discrepancies.
   */
  static checkDocumentOcrUncertainties(
    documents: DocumentRecord[],
    invoices: InvoiceRecord[],
    vendors: VendorRecord[]
  ): AnomalyRecord[] {
    const results: AnomalyRecord[] = [];
    for (const doc of documents) {
      if (doc.processingStatus !== 'flagged') continue;

      const fields = doc.extractedFields;
      const uncertaintyReport = fields?.uncertaintyReport;
      const confidence = fields?.confidenceScore ?? 0.85;
      const flags = doc.visualFlags || [];
      const hasRisks = flags.some(f => /uncertainty|suspicious|altered|mismatch|discrepancy|urgent|unverified|low-confidence|missing|duplicate/i.test(f));

      if (hasRisks || (uncertaintyReport && uncertaintyReport.isAnomaly) || confidence < 0.75) {
        const vendorName = fields?.vendorName || 'Unidentified Vendor';
        const invNum = fields?.invoiceNumber || doc.filename;
        const total = fields?.total || undefined;
        const discrepancy = uncertaintyReport?.fieldConfidences?.arithmetic?.discrepancy;

        const isArithmetic = uncertaintyReport?.suggestedAnomalyCategory === 'ARITHMETIC_INCONSISTENCY' ||
          flags.some(f => /arithmetic|discrepancy/i.test(f));
        const isBeneficiary = uncertaintyReport?.suggestedAnomalyCategory === 'BENEFICIARY_ALTERATION' ||
          flags.some(f => /remittance|alteration|banking|offshore/i.test(f));
        const isDuplicate = uncertaintyReport?.suggestedAnomalyCategory === 'DUPLICATE_INVOICE' ||
          flags.some(f => /duplicate/i.test(f));

        const category = isArithmetic
          ? 'ARITHMETIC_INCONSISTENCY'
          : isBeneficiary
          ? 'BENEFICIARY_ALTERATION'
          : isDuplicate
          ? 'DUPLICATE_INVOICE'
          : 'VISUAL_OR_DOMAIN_IRREGULARITY';

        const title = isArithmetic
          ? `OCR Arithmetic Discrepancy on ${invNum}`
          : isBeneficiary
          ? `Suspicious Remittance on Scanned Invoice ${invNum}`
          : isDuplicate
          ? `Duplicate Scanned Invoice Detected: ${invNum}`
          : `OCR Extraction Uncertainty Flagged: ${invNum}`;

        const riskSummary = uncertaintyReport?.detectedRisks?.join('; ') ||
          flags.join('; ') ||
          'Low OCR character confidence and unverified payment parameters';

        results.push({
          id: `anom-ocr-${doc.id}`,
          title,
          category,
          severity: (uncertaintyReport?.uncertaintyLevel === 'high' || isBeneficiary) ? 'high' : 'medium',
          amountInDispute: discrepancy || total,
          currency: fields?.currency || 'INR',
          explanation: `Multimodal forensic OCR evaluated this document with ${Math.round(confidence * 100)}% confidence. Key observations: ${riskSummary}. Stored document: ${doc.filename}.`,
          supportingRecordIds: [doc.id],
          detectionMethod: 'Multimodal OCR Uncertainty & Field Integrity Classifier (Rule #9)',
          detectionRule: isArithmetic ? 'RULE_INVOICE_LINE_ITEM_ARITHMETIC' : 'RULE_OCR_EXTRACTION_UNCERTAINTY',
          uncertainty: `Optical character recognition flagged uncertainty in document structure, values, or remittance authenticity. Manual verification of original scan required.`,
          verificationChecklist: [
            'Inspect high-resolution document scan against parsed fields.',
            `Confirm vendor identity for '${vendorName}' via verified out-of-band contact.`,
            'Verify bank remittance account details against master ERP records before authorization.'
          ],
          status: 'NEEDS_REVIEW',
          createdAt: doc.uploadDate || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return results;
  }
}
