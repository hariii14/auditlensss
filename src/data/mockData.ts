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
} from '../types';

export const MOCK_COMPANY = {
  name: "PixelCraft Studio",
  legalName: "PixelCraft Digital LLC",
  currency: "INR", // Primary demo currency (with USD cross-border transactions)
  employeeCount: 24,
  connectedAccounts: [
    { name: "Chase Corporate Checking (*4491)", balance: "₹4,28,450", status: "Active" },
    { name: "Amex Corporate Platinum (*1004)", balance: "₹1,85,200", status: "Active" },
    { name: "Silicon Valley Bank Reserve (*8823)", balance: "₹12,40,000", status: "Active" }
  ]
};

export const MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: "doc-cb-101",
    filename: "CloudBox_Oct2026_Invoice_CB-101.pdf",
    type: "invoice_pdf",
    uploadDate: "2026-10-10",
    processingStatus: "parsed",
    fileSize: 142800,
    extractedFields: {
      vendorName: "CloudBox Inc",
      invoiceNumber: "CB-101",
      date: "2026-10-10",
      currency: "INR",
      subtotal: 846.61,
      tax: 152.39,
      total: 999.00,
      bankName: "HDFC Tech Banking",
      accountNumberLast4: "5512",
      confidenceScore: 0.98,
      notes: "Cloud Storage Tier 2 - October 2026",
    },
    sourceReference: "Workspace Gmail Sync / Billing Inbox",
    rawContent: "CloudBox Inc. Invoice CB-101\nBilled to: PixelCraft Studio\nDate: 10-Oct-2026\nDescription: Enterprise Storage 10TB - Oct 2026\nSubtotal: ₹846.61\nGST (18%): ₹152.39\nTotal: ₹999.00\nPayment Terms: Auto-debit via linked corporate card.",
    visualFlags: ["Verified Digital Signature", "Standard DPI 300+"],
  },
  {
    id: "doc-apex-8821",
    filename: "ApexLogistics_INV-8821_UrgentRemittance.pdf",
    type: "invoice_pdf",
    uploadDate: "2026-10-14",
    processingStatus: "flagged",
    fileSize: 312500,
    extractedFields: {
      vendorName: "Apex Logistics",
      invoiceNumber: "INV-8821",
      date: "2026-10-14",
      currency: "INR",
      subtotal: 4237.29,
      tax: 762.71,
      total: 5000.00,
      bankName: "Cayman Trust Offshore Bank",
      accountNumberLast4: "9012",
      routingNumber: "CYM-88219",
      confidenceScore: 0.74,
      notes: "Altered wire instructions detected in remittance block.",
    },
    sourceReference: "Pasted Email Attachment from accounts@apex-loglstics.com",
    rawContent: "APEX LOGISTICS INTERNATIONAL\nInvoice No: INV-8821 | Date: 14-Oct-2026\nTo: PixelCraft Studio\nItem: Expedited Hardware Freight to Mumbai Hub\nAmount Due: ₹5,000.00\nIMPORTANT BANK REMITTANCE UPDATE:\nPlease note our updated offshore wire instructions:\nBank: Cayman Trust Offshore Bank\nAccount: 0984-9012\nRouting: CYM-88219\nSwift: CYTRKYXX",
    visualFlags: [
      "Font DPI mismatch (Arial 144 DPI pasted over Helvetica 300 DPI)",
      "Remittance box compression artifact (ELA variance 24.8%)",
      "Sender domain typosquat: 'apex-loglstics.com' (letter 'l' instead of 'i')"
    ],
  },
  {
    id: "doc-figma-ent",
    filename: "Figma_Enterprise_Billing_Oct2026.pdf",
    type: "invoice_pdf",
    uploadDate: "2026-10-01",
    processingStatus: "parsed",
    fileSize: 98400,
    extractedFields: {
      vendorName: "Figma Inc",
      invoiceNumber: "FIG-9021",
      date: "2026-10-01",
      currency: "INR",
      subtotal: 450.00,
      tax: 0.00,
      total: 450.00,
      confidenceScore: 0.99,
      notes: "Figma Organization Plan - 15 Editor Seats",
    },
    sourceReference: "Amex Corporate Statement Attachment",
    rawContent: "Figma Inc - Invoice FIG-9021\nCustomer: PixelCraft Studio (Primary Org)\nPlan: Figma Enterprise / Org\nSeats: 15 active editors @ ₹30/mo\nTotal Billed: ₹450.00 INR\nPaid via Amex Platinum *1004",
  },
  {
    id: "doc-figma-pro",
    filename: "Figma_Pro_Receipt_Chase_Card.pdf",
    type: "receipt_img",
    uploadDate: "2026-10-05",
    processingStatus: "flagged",
    fileSize: 84200,
    extractedFields: {
      vendorName: "Figma Inc",
      invoiceNumber: "FIG-PRO-114",
      date: "2026-10-05",
      currency: "INR",
      total: 45.00,
      confidenceScore: 0.96,
      notes: "Figma Professional Plan - 3 Seats expensed separately",
    },
    sourceReference: "Employee Card Expense Report (Chase *4491)",
    rawContent: "Figma Receipt #FIG-PRO-114\nUser: design-lead@pixelcraft.io\nFigma Professional (3 editors)\nTotal: ₹45.00 INR\nPayment: Chase Card *4491",
    visualFlags: ["Duplicate Vendor detected on alternate payment method"],
  },
  {
    id: "doc-invision",
    filename: "InVisionApp_Annual_Renewal_Invoice.pdf",
    type: "contract_doc",
    uploadDate: "2026-09-28",
    processingStatus: "flagged",
    fileSize: 178000,
    extractedFields: {
      vendorName: "InVision Technologies",
      invoiceNumber: "INV-TEC-440",
      date: "2026-09-28",
      currency: "INR",
      total: 380.00,
      confidenceScore: 0.95,
      notes: "Enterprise Collaboration Suite - Auto renewing monthly",
    },
    sourceReference: "Contract Archive",
    rawContent: "InVisionApp Inc. Contract #INV-TEC-440\nProduct: Enterprise Pro Suite\nMonthly Recurring: ₹380.00 INR\nTeam logins last 90 days: 0 active users.",
  },
  {
    id: "doc-delta-receipt",
    filename: "DeltaAirlines_BoardingReceipt_BLR_DEL.pdf",
    type: "receipt_img",
    uploadDate: "2026-10-18",
    processingStatus: "parsed",
    fileSize: 120500,
    extractedFields: {
      vendorName: "Delta Air Lines",
      invoiceNumber: "DL-982187",
      date: "2026-10-18",
      currency: "INR",
      total: 428.00,
      confidenceScore: 0.99,
    },
    sourceReference: "Mobile Camera Quick Scan (AuditLens App)",
    rawContent: "Delta Air Lines Receipt\nPassenger: Sarah Jenkins\nFlight: DL-884 Bangalore -> New Delhi Tech Summit\nTotal Paid: ₹428.00\nCard: Chase Corp *4491\nStatus: 100% Tax Compliant Travel Expense",
  },
  {
    id: "doc-notion",
    filename: "Notion_Technologies_Workspace_Sub.pdf",
    type: "invoice_pdf",
    uploadDate: "2026-10-02",
    processingStatus: "parsed",
    fileSize: 92000,
    extractedFields: {
      vendorName: "Notion Technologies",
      invoiceNumber: "NOT-4912",
      date: "2026-10-02",
      currency: "INR",
      subtotal: 80.00,
      tax: 16.00,
      total: 96.00,
      confidenceScore: 0.99,
    },
    sourceReference: "Automated Gmail Forward",
    rawContent: "Notion Technologies Inc.\nInvoice NOT-4912\nDate: 02-Oct-2026\nWorkspace: pixelcraft.notion.site\nSubtotal: ₹80.00\nSales Tax (20%): ₹16.00\nTotal: ₹96.00\nPayment: Settled on Chase Card *4491",
  }
];

export const MOCK_VENDORS: VendorRecord[] = [
  {
    id: "vend-cloudbox",
    name: "CloudBox Inc",
    category: "Cloud Infrastructure",
    aliases: ["CloudBox", "CloudBox Storage", "CLOUDBOX INC", "CLOUDBOX TECH"],
    availableIdentifiers: {
      verifiedEmailDomains: ["cloudbox.io", "billing.cloudbox.io"],
      verifiedBankAccounts: [
        { bankName: "HDFC Tech Banking", last4: "5512", country: "IN" }
      ],
      phone: "+91 80 4492 1000",
      contactPerson: "CloudBox Enterprise Billing",
    },
    associatedRecordIds: ["doc-cb-101", "tx-cb-1", "tx-cb-2", "email-cb-1", "anom-cb-dup"],
    riskRating: "medium",
    monthlySpend: 999.00,
    currency: "INR",
    lastAuditDate: "2026-10-20",
  },
  {
    id: "vend-apex",
    name: "Apex Logistics",
    category: "Logistics & Shipping",
    aliases: ["Apex Logistics International", "Apex Cargo Systems"],
    availableIdentifiers: {
      verifiedEmailDomains: ["apex-logistics.com"], // Notice genuine domain has 'i'
      verifiedBankAccounts: [
        { bankName: "Chase Commercial Bank", last4: "4491", country: "US", accountHolder: "Apex Logistics International LLC" }
      ],
      phone: "+1 415 890 2200",
      contactPerson: "Elena Rostova (Account Rep)",
    },
    associatedRecordIds: ["doc-apex-8821", "tx-apex-wire", "email-apex-spoof", "anom-apex-mismatch", "anom-apex-beneficiary"],
    riskRating: "high",
    monthlySpend: 5000.00,
    currency: "INR",
    lastAuditDate: "2026-10-21",
  },
  {
    id: "vend-figma",
    name: "Figma Inc",
    category: "Design & Collaboration",
    aliases: ["Figma", "Figma Enterprise", "Figma Design"],
    availableIdentifiers: {
      verifiedEmailDomains: ["figma.com"],
      verifiedBankAccounts: [
        { bankName: "Silicon Valley Bank", last4: "8820", country: "US" }
      ],
      phone: "+1 800 344 6200",
    },
    associatedRecordIds: ["doc-figma-ent", "doc-figma-pro", "tx-figma-corp", "tx-figma-team", "sub-figma-ent", "sub-figma-pro", "anom-saas-figma"],
    riskRating: "medium",
    monthlySpend: 495.00,
    currency: "INR",
    lastAuditDate: "2026-10-18",
  },
  {
    id: "vend-invision",
    name: "InVision Technologies",
    category: "Design & Collaboration",
    aliases: ["InVisionApp", "InVision"],
    availableIdentifiers: {
      verifiedEmailDomains: ["invisionapp.com"],
      verifiedBankAccounts: [
        { bankName: "Citibank US", last4: "3310", country: "US" }
      ],
    },
    associatedRecordIds: ["doc-invision", "tx-invision", "sub-invision", "anom-saas-invision"],
    riskRating: "medium",
    monthlySpend: 380.00,
    currency: "INR",
    lastAuditDate: "2026-10-15",
  },
  {
    id: "vend-delta",
    name: "Delta Air Lines",
    category: "Travel & Hospitality",
    aliases: ["Delta", "DELTA AIR 006"],
    availableIdentifiers: {
      verifiedEmailDomains: ["delta.com"],
      verifiedBankAccounts: [],
    },
    associatedRecordIds: ["doc-delta-receipt", "tx-delta"],
    riskRating: "low",
    monthlySpend: 428.00,
    currency: "INR",
    lastAuditDate: "2026-10-19",
  },
  {
    id: "vend-notion",
    name: "Notion Technologies",
    category: "Productivity & Docs",
    aliases: ["Notion", "Notion Labs"],
    availableIdentifiers: {
      verifiedEmailDomains: ["mktg.notion.so", "notion.so"],
      verifiedBankAccounts: [],
    },
    associatedRecordIds: ["doc-notion", "tx-notion"],
    riskRating: "low",
    monthlySpend: 96.00,
    currency: "INR",
    lastAuditDate: "2026-10-19",
  }
];

export const MOCK_INVOICES: InvoiceRecord[] = [
  {
    id: "inv-cb-101",
    vendorId: "vend-cloudbox",
    invoiceNumber: "CB-101",
    invoiceDate: "2026-10-10",
    dueDate: "2026-10-24",
    currency: "INR",
    subtotal: 846.61,
    tax: 152.39,
    total: 999.00,
    paymentDetails: {
      bankName: "HDFC Tech Banking",
      accountNumberLast4: "5512",
      accountHolder: "CloudBox Inc",
      country: "IN",
      remittanceNotes: "Reference Invoice CB-101 in payment remarks",
    },
    documentId: "doc-cb-101",
  },
  {
    id: "inv-apex-8821",
    vendorId: "vend-apex",
    invoiceNumber: "INV-8821",
    invoiceDate: "2026-10-14",
    dueDate: "2026-10-17",
    currency: "INR",
    subtotal: 4237.29,
    tax: 762.71,
    total: 5000.00,
    paymentDetails: {
      bankName: "Cayman Trust Offshore Bank", // Altered!
      accountNumberLast4: "9012",
      routingNumber: "CYM-88219",
      accountHolder: "Apex Remittance Global (Holdings)",
      country: "KY",
      remittanceNotes: "Urgent wire required due to account audit",
    },
    documentId: "doc-apex-8821",
    visualFlags: [
      "Font misalignment on remittance section",
      "Offshore routing divergent from vendor profile"
    ],
  },
  {
    id: "inv-figma-ent",
    vendorId: "vend-figma",
    invoiceNumber: "FIG-9021",
    invoiceDate: "2026-10-01",
    currency: "INR",
    subtotal: 450.00,
    tax: 0.00,
    total: 450.00,
    paymentDetails: {
      accountHolder: "Figma Inc",
      country: "US",
    },
    documentId: "doc-figma-ent",
  },
  {
    id: "inv-notion-4912",
    vendorId: "vend-notion",
    invoiceNumber: "NOT-4912",
    invoiceDate: "2026-10-02",
    currency: "INR",
    subtotal: 80.00,
    tax: 16.00,
    total: 96.00,
    paymentDetails: {
      accountHolder: "Notion Technologies Inc",
      country: "US",
    },
    documentId: "doc-notion",
  }
];

export const MOCK_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "tx-cb-1",
    date: "2026-10-12",
    description: "POS DEBIT - CLOUDBOX INC REF:CB-101",
    vendorId: "vend-cloudbox",
    currency: "INR",
    amount: 999.00,
    direction: "debit",
    reference: "CHASE-POS-899120",
    accountName: "Chase Corporate Card *4491",
    reconciledInvoiceId: "inv-cb-101",
    status: "flagged", // part of duplicate debit
  },
  {
    id: "tx-cb-2",
    date: "2026-10-15",
    description: "ONLINE PAYMENT - CLOUDBOX TECH INV#CB-101",
    vendorId: "vend-cloudbox",
    currency: "INR",
    amount: 999.00,
    direction: "debit",
    reference: "AMEX-AUTOPAY-44109",
    accountName: "Amex Corporate Platinum *1004",
    reconciledInvoiceId: "inv-cb-101",
    status: "flagged", // duplicate debit!
  },
  {
    id: "tx-apex-wire",
    date: "2026-10-16",
    description: "OUTGOING WIRE - APEX REMITTANCE GLOBAL",
    vendorId: "vend-apex",
    currency: "INR",
    amount: 8000.00, // Discrepancy! Invoice is ₹5,000
    direction: "debit",
    reference: "WIRE-PENDING-99042",
    accountName: "Chase Corporate Checking *4491",
    reconciledInvoiceId: "inv-apex-8821",
    status: "flagged",
  },
  {
    id: "tx-figma-corp",
    date: "2026-10-01",
    description: "FIGMA *ENTERPRISE SUB SAN FRANCISCO CA",
    vendorId: "vend-figma",
    currency: "INR",
    amount: 450.00,
    direction: "debit",
    reference: "AMEX-FIG-8819",
    accountName: "Amex Corporate Platinum *1004",
    reconciledInvoiceId: "inv-figma-ent",
    status: "flagged", // Overlapping with team card
  },
  {
    id: "tx-figma-team",
    date: "2026-10-05",
    description: "FIGMA PRO MONTHLY RECURRING",
    vendorId: "vend-figma",
    currency: "INR",
    amount: 45.00,
    direction: "debit",
    reference: "CHASE-EXP-201",
    accountName: "Chase Corporate Card *4491",
    status: "flagged", // Duplicate seat charge
  },
  {
    id: "tx-invision",
    date: "2026-09-28",
    description: "INVISIONAPP ENTERPRISE AUTOPAY",
    vendorId: "vend-invision",
    currency: "INR",
    amount: 380.00,
    direction: "debit",
    reference: "AMEX-INV-110",
    accountName: "Amex Corporate Platinum *1004",
    status: "flagged", // Zombie subscription
  },
  {
    id: "tx-delta",
    date: "2026-10-18",
    description: "DELTA AIR 0062491024 ATLANTA GA",
    vendorId: "vend-delta",
    currency: "INR",
    amount: 428.00,
    direction: "debit",
    reference: "CHASE-AIR-559",
    accountName: "Chase Corporate Card *4491",
    status: "reconciled", // Clean legitimate match!
  },
  {
    id: "tx-notion",
    date: "2026-10-02",
    description: "NOTION LABS INC SAN FRANCISCO",
    vendorId: "vend-notion",
    currency: "INR",
    amount: 96.00,
    direction: "debit",
    reference: "CHASE-NOT-419",
    accountName: "Chase Corporate Card *4491",
    reconciledInvoiceId: "inv-notion-4912",
    status: "reconciled", // Clean legitimate match!
  }
];

export const MOCK_EMAILS: EmailRecord[] = [
  {
    id: "email-cb-1",
    sender: "billing@cloudbox.io",
    senderDomain: "cloudbox.io",
    recipient: "finance@pixelcraft.io",
    date: "2026-10-09",
    vendorId: "vend-cloudbox",
    subject: "Upcoming billing for October 2026 (Invoice CB-101)",
    body: "Hi PixelCraft Team,\n\nYour October subscription for Cloud Storage Enterprise of ₹999.00 is scheduled for processing on October 12 via your default payment card ending in 4491. No manual action is needed.\n\nBest,\nCloudBox Billing",
    documentId: "doc-cb-101",
    domainFlags: {
      isTyposquatCandidate: false,
      spfDkimPassed: true,
    }
  },
  {
    id: "email-apex-spoof",
    sender: "Elena Rostova <accounts@apex-loglstics.com>", // Notice 'l' instead of 'i'
    senderDomain: "apex-loglstics.com",
    recipient: "sarah@pixelcraft.io",
    date: "2026-10-14",
    vendorId: "vend-apex",
    subject: "URGENT: Updated Remittance Details for Freight Invoice INV-8821",
    body: "Dear Sarah,\n\nPlease see attached revised invoice INV-8821 for expedited hardware transit. Our primary Chase account is undergoing an end-of-year audit hold. Kindly route the pending wire of ₹5,000 (or expedited batch of ₹8,000) directly to our offshore clearing escrow at Cayman Trust (Account #9012).\n\nPlease confirm payment receipt immediately.\n\nWarm regards,\nElena Rostova\nHead of Logistics Billing",
    documentId: "doc-apex-8821",
    domainFlags: {
      isTyposquatCandidate: true,
      similarityToDomain: "apex-logistics.com",
      spfDkimPassed: false,
      headerAlert: "DKIM validation failed. Domain 'apex-loglstics.com' was registered 6 days ago via NameCheap Privacy Guardian."
    }
  }
];

export const MOCK_SUBSCRIPTIONS: SubscriptionRecord[] = [
  {
    id: "sub-figma-ent",
    vendorId: "vend-figma",
    productName: "Figma Enterprise (Primary Org)",
    billingPeriod: "monthly",
    amount: 450.00,
    currency: "INR",
    contractDocumentId: "doc-figma-ent",
    seatCount: 15,
    activeLoginsLast90Days: 14,
    paymentMethodRef: "Amex Corporate *1004",
    renewalDate: "2026-11-01",
    status: "duplicate",
  },
  {
    id: "sub-figma-pro",
    vendorId: "vend-figma",
    productName: "Figma Pro (Design Lead Team)",
    billingPeriod: "monthly",
    amount: 45.00,
    currency: "INR",
    contractDocumentId: "doc-figma-pro",
    seatCount: 3,
    activeLoginsLast90Days: 3,
    paymentMethodRef: "Chase Card *4491",
    renewalDate: "2026-11-05",
    status: "duplicate",
  },
  {
    id: "sub-invision",
    vendorId: "vend-invision",
    productName: "InVision Enterprise Suite",
    billingPeriod: "monthly",
    amount: 380.00,
    currency: "INR",
    contractDocumentId: "doc-invision",
    seatCount: 20,
    activeLoginsLast90Days: 0, // Zombie subscription!
    paymentMethodRef: "Amex Corporate *1004",
    renewalDate: "2026-10-28",
    status: "zombie",
  },
  {
    id: "sub-notion",
    vendorId: "vend-notion",
    productName: "Notion Team Workspace",
    billingPeriod: "monthly",
    amount: 96.00,
    currency: "INR",
    seatCount: 8,
    activeLoginsLast90Days: 8,
    paymentMethodRef: "Chase Card *4491",
    renewalDate: "2026-11-02",
    status: "active",
  }
];

export const MOCK_ANOMALIES: AnomalyRecord[] = [
  {
    id: "anom-cb-dup",
    title: "Possible Duplicate Payment of ₹999 across Multiple Corporate Cards",
    category: "DUPLICATE_PAYMENT",
    severity: "high",
    amountInDispute: 999.00,
    currency: "INR",
    explanation: "Two separate debits of ₹999.00 were processed for the same CloudBox billing period (Oct 2026, Invoice CB-101). The first debit occurred on Chase Card *4491 on Oct 12, followed by a second automatic payment on Amex Platinum *1004 on Oct 15.",
    supportingRecordIds: ["doc-cb-101", "inv-cb-101", "tx-cb-1", "tx-cb-2", "email-cb-1"],
    detectionMethod: "Multi-Card Cross-Reconciliation Engine (Rule #2: Multiple Debits Matching Single Invoice)",
    detectionRule: "RULE_DUPLICATE_PAYMENTS_CROSS_ACCOUNTS",
    uncertainty: "CloudBox may have billed for an unlisted secondary workspace, although the vendor billing notification confirms only one ₹999 charge was anticipated.",
    verificationChecklist: [
      "Confirm whether PixelCraft maintains two distinct CloudBox organizations.",
      "Check CloudBox admin billing history for dual invoices.",
      "Request a ₹999 credit or reversal from CloudBox support if duplicate charge is confirmed."
    ],
    status: "NEEDS_REVIEW",
    createdAt: "2026-10-15T10:30:00Z",
    updatedAt: "2026-10-15T10:30:00Z",
  },
  {
    id: "anom-apex-mismatch",
    title: "Amount Discrepancy: ₹3,000 Divergence Between Invoice Total and Outgoing Wire",
    category: "AMOUNT_MISMATCH",
    severity: "high",
    amountInDispute: 3000.00,
    currency: "INR",
    explanation: "Invoice INV-8821 itemizes an authorized total of ₹5,000.00 for hardware freight. However, an outgoing wire transfer was initiated for ₹8,000.00, resulting in an unverified ₹3,000.00 excess capital leakage.",
    supportingRecordIds: ["doc-apex-8821", "inv-apex-8821", "tx-apex-wire", "email-apex-spoof"],
    detectionMethod: "Invoice-to-Transaction Arithmetic Reconciliation (Rule #3)",
    detectionRule: "RULE_INVOICE_TRANSACTION_AMOUNT_MISMATCH",
    uncertainty: "Wire may have bundled prior outstanding invoices, though no corresponding ledger entries exist for the remaining ₹3,000.",
    verificationChecklist: [
      "Review historical statements to see if prior Apex invoices were unpaid.",
      "Confirm whether additional customs clearance fees were verbally agreed upon.",
      "Halt wire clearance until reconciling invoice is produced."
    ],
    status: "ESCALATED",
    createdAt: "2026-10-16T14:15:00Z",
    updatedAt: "2026-10-16T15:00:00Z",
  },
  {
    id: "anom-apex-beneficiary",
    title: "High Risk: Conflicting Vendor Remittance Details & Typosquatted Domain",
    category: "BENEFICIARY_ALTERATION",
    severity: "high",
    amountInDispute: 5000.00,
    currency: "INR",
    explanation: "Invoice INV-8821 directs wire remittance to an offshore account (Cayman Trust *9012) instead of Apex's verified corporate Chase account (*4491). Additionally, the inbound email came from '@apex-loglstics.com' ('l' instead of 'i') registered 6 days ago with failing DKIM headers.",
    supportingRecordIds: ["doc-apex-8821", "inv-apex-8821", "email-apex-spoof", "vend-apex"],
    detectionMethod: "Vendor Remittance Vault & Domain Homoglyph Analyzer (Rules #4 & #8)",
    detectionRule: "RULE_BENEFICIARY_ALTERATION_AND_SPOOFING",
    uncertainty: "Could represent an urgent legitimate restructuring, but 99.4% heuristic confidence points to an active vendor email compromise (VEC) attack.",
    verificationChecklist: [
      "Do NOT wire funds to the Cayman Trust offshore instructions.",
      "Call verified vendor contact Elena Rostova at +1 (415) 890-2200 on file.",
      "Quarantine the email sender domain 'apex-loglstics.com' in Google Workspace."
    ],
    status: "ESCALATED",
    createdAt: "2026-10-14T11:00:00Z",
    updatedAt: "2026-10-16T15:00:00Z",
  },
  {
    id: "anom-saas-figma",
    title: "SaaS Overlap: Figma Enterprise (₹450/mo) and Figma Pro (₹45/mo) Running Simultaneously",
    category: "SAAS_OVERLAP",
    severity: "medium",
    amountInDispute: 540.00, // Annualized waste: ₹540/yr
    currency: "INR",
    explanation: "PixelCraft is paying ₹450/month for Figma Enterprise on the corporate Amex card (15 seats) while a design lead continues expensing Figma Pro (₹45/month for 3 seats) on their Chase card. All 3 users already have unassigned enterprise licenses.",
    supportingRecordIds: ["doc-figma-ent", "doc-figma-pro", "sub-figma-ent", "sub-figma-pro", "tx-figma-corp", "tx-figma-team"],
    detectionMethod: "Entity-Matched Cross-Card SaaS Detection (Rule #6)",
    detectionRule: "RULE_SAAS_DUPLICATE_SUBSCRIPTION_OVERLAP",
    uncertainty: "The team lead may require an isolated external guest workspace for client-restricted NDA projects.",
    verificationChecklist: [
      "Check if the 3 Pro users are already provisioned under the main Figma Enterprise org.",
      "Invite the 3 users into the central workspace.",
      "Cancel the ₹45/month recurring Chase card subscription (Saves ₹540/year)."
    ],
    status: "NEEDS_REVIEW",
    createdAt: "2026-10-06T09:00:00Z",
    updatedAt: "2026-10-06T09:00:00Z",
  },
  {
    id: "anom-saas-invision",
    title: "Zombie SaaS Leak: InVision Enterprise (₹380/mo) with 0 Logins in 112 Days",
    category: "SAAS_OVERLAP",
    severity: "medium",
    amountInDispute: 4560.00, // Annualized waste: ₹4,560/yr
    currency: "INR",
    explanation: "InVision Enterprise charges ₹380.00/month automatically to Amex Platinum *1004. Telemetry data reveals 0 team members have logged in over the last 112 days, indicating a dormant zombie subscription left after the Figma migration.",
    supportingRecordIds: ["doc-invision", "sub-invision", "tx-invision", "vend-invision"],
    detectionMethod: "SaaS Activity & Usage Telemetry Correlation (Rule #6)",
    detectionRule: "RULE_ZOMBIE_SUBSCRIPTION_INACTIVE_USERS",
    uncertainty: "Archive assets or legacy client prototypes may still be hosted on InVision requiring read-only access.",
    verificationChecklist: [
      "Export legacy prototype archives from InVision.",
      "Downgrade to InVision Free or terminate subscription.",
      "Immediate annualized capital recovery: ₹4,560.00/year."
    ],
    status: "NEEDS_REVIEW",
    createdAt: "2026-09-30T16:00:00Z",
    updatedAt: "2026-10-01T12:00:00Z",
  }
];

export const MOCK_EVIDENCE_EDGES: EvidenceEdgeRecord[] = [
  // CloudBox Cluster
  {
    id: "edge-cb-1",
    sourceNodeId: "doc-cb-101",
    targetNodeId: "inv-cb-101",
    relationship: "MATCHES",
    explanation: "Document OCR extracted Invoice CB-101 for ₹999 with 98% confidence",
    supportingRecordIds: ["doc-cb-101", "inv-cb-101"],
  },
  {
    id: "edge-cb-2",
    sourceNodeId: "inv-cb-101",
    targetNodeId: "vend-cloudbox",
    relationship: "ISSUED_BY",
    explanation: "Invoice CB-101 was issued by vendor CloudBox Inc",
    supportingRecordIds: ["inv-cb-101", "vend-cloudbox"],
  },
  {
    id: "edge-cb-3",
    sourceNodeId: "tx-cb-1",
    targetNodeId: "inv-cb-101",
    relationship: "PAID_BY",
    explanation: "Transaction on Chase *4491 references CB-101 for ₹999 on Oct 12",
    supportingRecordIds: ["tx-cb-1", "inv-cb-101"],
  },
  {
    id: "edge-cb-4",
    sourceNodeId: "tx-cb-2",
    targetNodeId: "inv-cb-101",
    relationship: "PAID_BY",
    explanation: "Second transaction on Amex *1004 references CB-101 for ₹999 on Oct 15",
    supportingRecordIds: ["tx-cb-2", "inv-cb-101"],
    isFlagged: true,
  },
  {
    id: "edge-cb-5",
    sourceNodeId: "tx-cb-2",
    targetNodeId: "tx-cb-1",
    relationship: "POSSIBLE_DUPLICATE_OF",
    explanation: "Two debits matching exact amount (₹999.00) referencing the same invoice within 3 days",
    supportingRecordIds: ["tx-cb-1", "tx-cb-2"],
    detectionRule: "RULE_DUPLICATE_PAYMENTS_CROSS_ACCOUNTS",
    isFlagged: true,
  },
  {
    id: "edge-cb-6",
    sourceNodeId: "email-cb-1",
    targetNodeId: "inv-cb-101",
    relationship: "MENTIONS",
    explanation: "Billing email from billing@cloudbox.io forecasted single ₹999 payment on Oct 12",
    supportingRecordIds: ["email-cb-1", "inv-cb-101"],
  },
  {
    id: "edge-cb-7",
    sourceNodeId: "tx-cb-2",
    targetNodeId: "anom-cb-dup",
    relationship: "SUPPORTS_ANOMALY",
    explanation: "Redundant charge triggered Anomaly: Possible Duplicate Payment",
    supportingRecordIds: ["tx-cb-1", "tx-cb-2", "anom-cb-dup"],
    isFlagged: true,
  },

  // Apex Cluster
  {
    id: "edge-ap-1",
    sourceNodeId: "doc-apex-8821",
    targetNodeId: "inv-apex-8821",
    relationship: "MATCHES",
    explanation: "Extracted Invoice INV-8821 for ₹5,000.00",
    supportingRecordIds: ["doc-apex-8821", "inv-apex-8821"],
  },
  {
    id: "edge-ap-2",
    sourceNodeId: "inv-apex-8821",
    targetNodeId: "vend-apex",
    relationship: "ISSUED_BY",
    explanation: "Purports to be issued by Apex Logistics",
    supportingRecordIds: ["inv-apex-8821", "vend-apex"],
  },
  {
    id: "edge-ap-3",
    sourceNodeId: "inv-apex-8821",
    targetNodeId: "vend-apex",
    relationship: "CONFLICTS_WITH",
    explanation: "Remittance specifies Cayman Trust (*9012) instead of verified Chase Commercial (*4491)",
    supportingRecordIds: ["inv-apex-8821", "vend-apex"],
    detectionRule: "RULE_BENEFICIARY_ALTERATION",
    isFlagged: true,
  },
  {
    id: "edge-ap-4",
    sourceNodeId: "email-apex-spoof",
    targetNodeId: "vend-apex",
    relationship: "CONFLICTS_WITH",
    explanation: "Sender domain 'apex-loglstics.com' is a typosquat of 'apex-logistics.com'",
    supportingRecordIds: ["email-apex-spoof", "vend-apex"],
    detectionRule: "RULE_DOMAIN_HOMOGLYPH_SPOOF",
    isFlagged: true,
  },
  {
    id: "edge-ap-5",
    sourceNodeId: "tx-apex-wire",
    targetNodeId: "inv-apex-8821",
    relationship: "CONFLICTS_WITH",
    explanation: "Wire amount ₹8,000.00 conflicts with invoice total ₹5,000.00 (₹3,000 mismatch)",
    supportingRecordIds: ["tx-apex-wire", "inv-apex-8821"],
    detectionRule: "RULE_INVOICE_TRANSACTION_AMOUNT_MISMATCH",
    isFlagged: true,
  },
  {
    id: "edge-ap-6",
    sourceNodeId: "inv-apex-8821",
    targetNodeId: "anom-apex-beneficiary",
    relationship: "SUPPORTS_ANOMALY",
    explanation: "Redirection to Cayman Trust supports High Severity Beneficiary Alteration finding",
    supportingRecordIds: ["inv-apex-8821", "anom-apex-beneficiary"],
    isFlagged: true,
  },
  {
    id: "edge-ap-7",
    sourceNodeId: "tx-apex-wire",
    targetNodeId: "anom-apex-mismatch",
    relationship: "SUPPORTS_ANOMALY",
    explanation: "Excess ₹3,000 wire transaction supports Amount Mismatch finding",
    supportingRecordIds: ["tx-apex-wire", "anom-apex-mismatch"],
    isFlagged: true,
  },

  // Figma & SaaS Cluster
  {
    id: "edge-fg-1",
    sourceNodeId: "sub-figma-pro",
    targetNodeId: "sub-figma-ent",
    relationship: "POSSIBLE_DUPLICATE_OF",
    explanation: "Figma Pro (3 seats) duplicates central Figma Enterprise (15 seats)",
    supportingRecordIds: ["sub-figma-pro", "sub-figma-ent"],
    detectionRule: "RULE_SAAS_DUPLICATE_SUBSCRIPTION_OVERLAP",
    isFlagged: true,
  },
  {
    id: "edge-fg-2",
    sourceNodeId: "sub-figma-pro",
    targetNodeId: "anom-saas-figma",
    relationship: "SUPPORTS_ANOMALY",
    explanation: "Duplicate subscription supports SaaS overlap anomaly",
    supportingRecordIds: ["sub-figma-pro", "anom-saas-figma"],
    isFlagged: true,
  },
  {
    id: "edge-inv-1",
    sourceNodeId: "sub-invision",
    targetNodeId: "anom-saas-invision",
    relationship: "SUPPORTS_ANOMALY",
    explanation: "0 logins in 112 days supports Zombie License finding",
    supportingRecordIds: ["sub-invision", "anom-saas-invision"],
    isFlagged: true,
  },

  // Legitimate Delta Cluster
  {
    id: "edge-dl-1",
    sourceNodeId: "doc-delta-receipt",
    targetNodeId: "tx-delta",
    relationship: "MATCHES",
    explanation: "Boarding receipt (₹428.00) matches cleared debit (₹428.00) on Chase *4491 exactly",
    supportingRecordIds: ["doc-delta-receipt", "tx-delta"],
  },
  {
    id: "edge-dl-2",
    sourceNodeId: "tx-delta",
    targetNodeId: "vend-delta",
    relationship: "PAID_BY",
    explanation: "Travel expense paid to Delta Air Lines",
    supportingRecordIds: ["tx-delta", "vend-delta"],
  },

  // Legitimate Notion Cluster
  {
    id: "edge-not-1",
    sourceNodeId: "doc-notion",
    targetNodeId: "inv-notion-4912",
    relationship: "MATCHES",
    explanation: "Invoice NOT-4912 parsed with verified tax breakdown (₹80 + ₹16 = ₹96)",
    supportingRecordIds: ["doc-notion", "inv-notion-4912"],
  },
  {
    id: "edge-not-2",
    sourceNodeId: "tx-notion",
    targetNodeId: "inv-notion-4912",
    relationship: "PAID_BY",
    explanation: "Debit matches invoice total ₹96.00 with clean reconciliation",
    supportingRecordIds: ["tx-notion", "inv-notion-4912"],
  }
];

export const MOCK_INVESTIGATIONS: InvestigationRecord[] = [
  {
    id: "inv-1",
    title: "CloudBox Potential Duplicate Charge on Oct 15",
    relatedVendorIds: ["vend-cloudbox"],
    anomalyIds: ["anom-cb-dup"],
    severity: "high",
    status: "NEEDS_REVIEW",
    createdAt: "2026-10-15T10:30:00Z",
    updatedAt: "2026-10-15T10:30:00Z",
    summaryNote: "Multi-card reconciliation identified duplicate ₹999 debits on Chase and Amex for invoice CB-101.",
    reviewHistory: [
      {
        id: "rev-1",
        investigationId: "inv-1",
        anomalyId: "anom-cb-dup",
        action: "NEEDS_REVIEW",
        notes: "Automated forensic engine flagged 2 debits matching invoice CB-101. Requires verification before requesting credit.",
        author: "AuditLens Autonomous Sentinel",
        timestamp: "2026-10-15T10:30:00Z"
      }
    ]
  },
  {
    id: "inv-2",
    title: "Apex Logistics Wire Redirection & Amount Mismatch",
    relatedVendorIds: ["vend-apex"],
    anomalyIds: ["anom-apex-mismatch", "anom-apex-beneficiary"],
    severity: "high",
    status: "ESCALATED",
    createdAt: "2026-10-14T11:00:00Z",
    updatedAt: "2026-10-16T15:00:00Z",
    summaryNote: "CRITICAL: Urgent wire hold recommended. Spoofed domain (@apex-loglstics.com), Cayman Trust redirection, and ₹3,000 wire amount inflation.",
    reviewHistory: [
      {
        id: "rev-2",
        investigationId: "inv-2",
        anomalyId: "anom-apex-beneficiary",
        action: "ESCALATED",
        notes: "Wire halted at Chase bank portal. Phone verification with Elena Rostova at verified number confirmed this was an impersonation attempt.",
        author: "Sarah Jenkins (Founder)",
        timestamp: "2026-10-16T15:00:00Z"
      }
    ]
  },
  {
    id: "inv-3",
    title: "Design Team SaaS Redundancy & Zombie InVision License",
    relatedVendorIds: ["vend-figma", "vend-invision"],
    anomalyIds: ["anom-saas-figma", "anom-saas-invision"],
    severity: "medium",
    status: "NEEDS_REVIEW",
    createdAt: "2026-10-06T09:00:00Z",
    updatedAt: "2026-10-06T09:00:00Z",
    summaryNote: "Annualized waste recovery opportunity of ₹5,100 (₹4,560 InVision zombie seats + ₹540 Figma Pro dual expensing).",
    reviewHistory: [
      {
        id: "rev-3",
        investigationId: "inv-3",
        anomalyId: "anom-saas-invision",
        action: "NEEDS_REVIEW",
        notes: "Workspace telemetry verified 0 active logins on InVision for 112 days. Suggested action: cancel auto-renew and migrate remaining files.",
        author: "AuditLens Subscription Guard",
        timestamp: "2026-10-06T09:00:00Z"
      }
    ]
  }
];

export const MOCK_METRICS: AuditCleanlinessMetric = {
  overallScore: 98.2, // Cleanliness score
  reconciledCount: 26,
  totalTransactions: 28,
  unresolvedAnomalies: 3,
  taxReadinessPercent: 96.4,
  recoveredAmount: 4180.00,
  preventedFraudAmount: 8000.00,
};
