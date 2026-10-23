import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import Tesseract from 'tesseract.js';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

import {
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
  MOCK_COMPANY,
} from '../src/data/mockData';
import { AnomalyEngine } from '../src/engine/anomalyEngine';
import { parseOcrText, calculateOcrUncertainty, createOcrAnomalyRecord, ParsedOcrResult } from '../src/engine/ocrEngine';
import {
  DocumentRecord,
  InvestigationRecord,
  AnomalyRecord,
  ReviewEvent,
  EvidenceEdgeRecord,
  VendorRecord,
  InvoiceRecord,
  TransactionRecord,
  EmailRecord,
  SubscriptionRecord,
} from '../src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
});

// In-Memory Repository initialized with PixelCraft Studio demo data
let state = {
  documents: JSON.parse(JSON.stringify(MOCK_DOCUMENTS)) as DocumentRecord[],
  vendors: JSON.parse(JSON.stringify(MOCK_VENDORS)) as VendorRecord[],
  invoices: JSON.parse(JSON.stringify(MOCK_INVOICES)) as InvoiceRecord[],
  transactions: JSON.parse(JSON.stringify(MOCK_TRANSACTIONS)) as TransactionRecord[],
  emails: JSON.parse(JSON.stringify(MOCK_EMAILS)) as EmailRecord[],
  subscriptions: JSON.parse(JSON.stringify(MOCK_SUBSCRIPTIONS)) as SubscriptionRecord[],
  anomalies: JSON.parse(JSON.stringify(MOCK_ANOMALIES)) as AnomalyRecord[],
  edges: JSON.parse(JSON.stringify(MOCK_EVIDENCE_EDGES)) as EvidenceEdgeRecord[],
  investigations: JSON.parse(JSON.stringify(MOCK_INVESTIGATIONS)) as InvestigationRecord[],
  metrics: { ...MOCK_METRICS },
  company: { ...MOCK_COMPANY },
  customGeminiKey: process.env.GEMINI_API_KEY || '',
};

// Zod Schema for Structured Extraction Validation
const ExtractionSchema = z.object({
  vendorName: z.string().optional().nullable(),
  invoiceNumber: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  currency: z.string().default('INR'),
  subtotal: z.number().optional().nullable(),
  tax: z.number().optional().nullable(),
  total: z.number().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountNumberLast4: z.string().optional().nullable(),
  routingNumber: z.string().optional().nullable(),
  visualFlags: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1).default(0.85),
  notes: z.string().optional(),
});

// Helper: Get active Gemini Client if key exists
function getGeminiClient() {
  const apiKey = state.customGeminiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing Gemini client:', err);
    return null;
  }
}

const suspiciousSignalRules: Array<[string, RegExp]> = [
  ['Changed or altered remittance instructions', /changed?\s+(?:bank|payment|remittance)|altered\s+(?:bank|payment|remittance)/i],
  ['Urgent payment instruction requires verification', /urgent|immediate payment|pay immediately/i],
  ['Offshore or unusual beneficiary detected', /offshore|cayman|escrow|crypto|wallet/i],
  ['Unverified account-change language detected', /new\s+(?:bank|account)|updated\s+(?:bank|account)|account\s+change/i],
  ['Possible duplicate invoice language detected', /duplicate|already paid|second invoice/i],
  ['Amount discrepancy language detected', /mismatch|discrepancy|different amount/i],
];

async function extractLocalDocumentText(file?: Express.Multer.File, pastedText?: string) {
  if (pastedText?.trim()) return { text: pastedText.trim(), source: 'Pasted text extraction', confidence: 0.98 };
  if (!file) return { text: '', source: 'No local content', confidence: 0 };

  if (file.mimetype.includes('pdf')) {
    const pdf = await getDocument({ data: new Uint8Array(file.buffer), useSystemFonts: true, isEvalSupported: false }).promise;
    const pageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pageTexts.push(content.items.map((item: any) => `${item.str || ''}${item.hasEOL ? '\n' : ' '}`).join('').trim());
      page.cleanup();
    }
    const text = pageTexts.join('\n').trim();
    await pdf.destroy();
    return { text, source: `Local PDF extraction (${pageTexts.length} page${pageTexts.length === 1 ? '' : 's'})`, confidence: text ? 0.94 : 0 };
  }
  if (file.mimetype.includes('image')) {
    const result = await Tesseract.recognize(file.buffer, 'eng');
    return { text: result.data.text.trim(), source: 'Local Tesseract OCR', confidence: Math.max(0, Math.min(1, result.data.confidence / 100)) };
  }
  if (file.mimetype.includes('text') || file.mimetype.includes('csv')) {
    return { text: file.buffer.toString('utf-8').trim(), source: 'Local text extraction', confidence: 0.98 };
  }
  return { text: '', source: 'Unsupported local binary format', confidence: 0 };
}

function parseInvoiceText(text: string, filename: string, confidence: number): z.infer<typeof ExtractionSchema> {
  const normalized = text.replace(/\r/g, '').replace(/[ \t]+/g, ' ');
  const lines = normalized.split('\n').map(line => line.trim()).filter(Boolean);
  const amountPattern = /(?:₹|INR|Rs\.?|USD|\$)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/ig;
  const labelledTotal = normalized.match(/^\s*(?:grand\s+total|invoice\s+total|amount\s+due|total\s+due|net\s+payable|total)\b[^\d₹$]{0,18}(?:₹|INR|Rs\.?|USD|\$)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/im);
  const amounts = Array.from(normalized.matchAll(amountPattern)).map(match => Number(match[1].replace(/,/g, ''))).filter(Number.isFinite);
  const subtotal = normalized.match(/subtotal[^\d₹$]{0,15}(?:₹|INR|Rs\.?|USD|\$)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i)?.[1];
  const tax = normalized.match(/(?:gst|vat|tax)[^\d₹$]{0,15}(?:₹|INR|Rs\.?|USD|\$)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i)?.[1];
  const invoiceNumber = normalized.match(/invoice\s*(?:no\.?|number|#)\s*[:#-]?\s*([a-z0-9][a-z0-9\/-]*)/i)?.[1]
    || normalized.match(/(?:invoice|inv)\s*[:#-]\s*([a-z0-9][a-z0-9\/-]*)/i)?.[1];
  const date = normalized.match(/(?:invoice\s+date|date)[\s:#-]*(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i)?.[1];
  const accountNumberLast4 = normalized.match(/(?:account|acct|a\/c)[^\d]{0,20}(?:x+|\*+)?(\d{4})(?!\d)/i)?.[1];
  const vendorLine = lines.find(line => /(?:ltd|llp|inc|llc|logistics|technologies|services|solutions|enterprises|company|corp)/i.test(line) && line.length < 90);
  const fallbackVendor = filename.replace(/\.[^/.]+$/, '').split(/[-_]/).filter(Boolean).slice(0, 3).join(' ');
  const signals = suspiciousSignalRules.filter(([, pattern]) => pattern.test(normalized)).map(([label]) => label);
  const total = labelledTotal ? Number(labelledTotal[1].replace(/,/g, '')) : (amounts.length > 0 ? Math.max(...amounts) : null);
  const bankLine = lines.find(line => /bank|beneficiary|remit/i.test(line));

  return {
    vendorName: vendorLine?.replace(/^(from|vendor|bill from)\s*[:\-]?\s*/i, '').slice(0, 100) || fallbackVendor || 'Unknown Vendor',
    invoiceNumber: invoiceNumber || null,
    date: date || null,
    currency: /\$|USD/i.test(normalized) ? 'USD' : 'INR',
    subtotal: subtotal ? Number(subtotal.replace(/,/g, '')) : null,
    tax: tax ? Number(tax.replace(/,/g, '')) : null,
    total,
    bankName: bankLine?.slice(0, 100) || null,
    accountNumberLast4: accountNumberLast4 || null,
    visualFlags: signals.length > 0 ? signals : ['No high-risk payment language detected'],
    confidenceScore: confidence,
    notes: `Extracted from ${lines.length} recognized text lines.`,
  };
}

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------

// 1. Health & Config status
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(state.customGeminiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  res.json({
    status: 'online',
    version: '1.0.0',
    service: 'AuditLens Multimodal Forensic Core',
    geminiConfigured: hasKey,
    mode: hasKey ? 'live_gemini' : 'demo_synthetic',
    activeRecords: {
      documents: state.documents.length,
      anomalies: state.anomalies.length,
      investigations: state.investigations.length,
    }
  });
});

// 2. Fetch full repository data
app.get('/api/data', (req, res) => {
  res.json({
    company: state.company,
    documents: state.documents,
    vendors: state.vendors,
    invoices: state.invoices,
    transactions: state.transactions,
    emails: state.emails,
    subscriptions: state.subscriptions,
    anomalies: state.anomalies,
    edges: state.edges,
    investigations: state.investigations,
    metrics: state.metrics,
  });
});

// 3. Save or Test Gemini API Key
app.post('/api/settings/key', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Valid apiKey string required.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    const testResult = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Echo test: AuditLens online.',
    });
    const responseText = testResult.text || '';

    state.customGeminiKey = apiKey;
    res.json({
      success: true,
      message: 'Gemini API Key verified and active for live multimodal extraction.',
      sampleEcho: responseText.trim(),
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: `Gemini API Key verification failed: ${err.message || 'Invalid key'}`,
    });
  }
});

// 4. Multimodal File Ingestion & Processing
app.post('/api/upload', upload.single('file') as any, async (req: any, res) => {
  try {
    const file = req.file;
    const { pastedText, source = 'Manual Upload' } = req.body;

    if (!file && !pastedText) {
      return res.status(400).json({ error: 'Please provide a file or pasted text.' });
    }

    const docId = `doc-${Date.now()}`;
    const filename = file ? file.originalname : `Pasted_Communication_${new Date().toISOString().slice(0, 10)}.txt`;
    const mimeType = file ? file.mimetype : 'text/plain';

    let docType: DocumentRecord['type'] = 'invoice_pdf';
    if (mimeType.includes('image')) docType = 'receipt_img';
    else if (mimeType.includes('csv')) docType = 'csv_transactions';
    else if (filename.toLowerCase().includes('statement')) docType = 'bank_statement';
    else if (mimeType.includes('text') || pastedText) docType = 'vendor_email';

    let localExtraction = { text: '', source: 'No local content', confidence: 0 };
    try {
      localExtraction = await extractLocalDocumentText(file, pastedText);
    } catch (extractionError: any) {
      console.warn('Local document extraction failed:', extractionError.message);
      localExtraction.source = `Local extraction failed: ${extractionError.message}`;
    }

    // 1. Run deterministic OCR recognition & uncertainty analysis
    let parsedOcr = parseOcrText(
      localExtraction.text,
      filename,
      localExtraction.confidence,
      state.vendors,
      state.invoices
    );
    let extractionSource = localExtraction.source;
    let geminiExtracted = false;
    const ai = getGeminiClient();

    // 2. Multimodal Gemini augmentation if available
    if (ai) {
      try {
        const prompt = `You are the AuditLens Multimodal Financial Forensics parser.
Analyze this financial document or communication thoroughly.
Extract the following fields in strict JSON format:
{
  "vendorName": string or null,
  "invoiceNumber": string or null,
  "date": "YYYY-MM-DD" or null,
  "currency": "USD" or "INR" or "EUR" (3 letter code),
  "subtotal": number or null,
  "tax": number or null,
  "total": number or null,
  "bankName": string or null,
  "accountNumberLast4": string or null,
  "routingNumber": string or null,
  "visualFlags": array of string observations (e.g. "Font misalignment", "Suspicious remittance address", "DPI variation", or "Clean layout"),
  "confidenceScore": number between 0.5 and 1.0,
  "notes": brief plain-English summary of what this document represents
}
Only output the JSON object. Do not wrap in markdown or backticks if possible.`;

        const contents: any[] = [];
        if (file && (mimeType.includes('image') || mimeType.includes('pdf'))) {
          contents.push({
            inlineData: {
              data: file.buffer.toString('base64'),
              mimeType: file.mimetype,
            },
          });
        } else {
          contents.push({
            text: `Document Content:\n${pastedText || (file ? file.buffer.toString('utf-8') : '')}`,
          });
        }
        contents.push({ text: prompt });

        const result = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              responseMimeType: 'application/json',
            },
          }),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API call timed out after 5000ms')), 5000)
          ),
        ]);
        const rawResponse = result.text || '';
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedGemini = JSON.parse(jsonMatch[0]);
          const validated = ExtractionSchema.parse(parsedGemini);

          // Re-evaluate uncertainty with Gemini's high-fidelity multimodal readings
          const reevaluatedUncertainty = calculateOcrUncertainty({
            vendorName: validated.vendorName || parsedOcr.vendorName,
            invoiceNumber: validated.invoiceNumber || parsedOcr.invoiceNumber,
            date: validated.date || parsedOcr.date,
            total: validated.total ?? parsedOcr.total,
            subtotal: validated.subtotal ?? parsedOcr.subtotal,
            tax: validated.tax ?? parsedOcr.tax,
            bankName: validated.bankName || parsedOcr.bankName,
            accountNumberLast4: validated.accountNumberLast4 || parsedOcr.accountNumberLast4,
            rawText: localExtraction.text,
            baseConfidence: validated.confidenceScore || 0.92,
            visualFlags: Array.from(new Set([...(validated.visualFlags || []), ...parsedOcr.visualFlags])),
            knownVendors: state.vendors,
            existingInvoices: state.invoices,
          });

          parsedOcr = {
            ...parsedOcr,
            vendorName: validated.vendorName || parsedOcr.vendorName,
            invoiceNumber: validated.invoiceNumber || parsedOcr.invoiceNumber,
            date: validated.date || parsedOcr.date,
            currency: validated.currency || parsedOcr.currency,
            subtotal: validated.subtotal ?? parsedOcr.subtotal,
            tax: validated.tax ?? parsedOcr.tax,
            total: validated.total ?? parsedOcr.total,
            bankName: validated.bankName || parsedOcr.bankName,
            accountNumberLast4: validated.accountNumberLast4 || parsedOcr.accountNumberLast4,
            routingNumber: validated.routingNumber || parsedOcr.routingNumber,
            visualFlags: Array.from(new Set([...parsedOcr.visualFlags, ...(validated.visualFlags || [])])),
            confidenceScore: reevaluatedUncertainty.overallScore,
            uncertaintyReport: reevaluatedUncertainty,
            notes: validated.notes || parsedOcr.notes,
          };
          extractionSource = 'Gemini 3.8 Flash Multimodal Ingestion';
          geminiExtracted = true;
        }
      } catch (geminiErr: any) {
        console.warn('Gemini extraction error, falling back to deterministic local OCR engine:', geminiErr.message);
        extractionSource = `${localExtraction.source} (Local OCR Engine active: ${geminiErr.message})`;
      }
    }

    const report = parsedOcr.uncertaintyReport;
    const isFlagged = report.isAnomaly || report.uncertaintyLevel !== 'low' || parsedOcr.confidenceScore < 0.75;

    // Create the document record
    const newDoc: DocumentRecord = {
      id: docId,
      filename,
      type: docType,
      uploadDate: new Date().toISOString().slice(0, 10),
      processingStatus: isFlagged ? 'flagged' : 'parsed',
      fileSize: file ? file.size : pastedText.length,
      extractedFields: {
        vendorName: parsedOcr.vendorName,
        invoiceNumber: parsedOcr.invoiceNumber,
        date: parsedOcr.date,
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
      sourceReference: `${source} (Via ${extractionSource})`,
      rawContent: localExtraction.text.slice(0, 12000),
      visualFlags: parsedOcr.visualFlags,
    };

    state.documents.unshift(newDoc);

    let createdInvoiceId: string | undefined = undefined;
    let matchedVendorId: string | undefined = undefined;

    // Synchronize vendor and invoice ONLY when genuine fields were extracted (never random placeholders)
    if (parsedOcr.total && parsedOcr.total > 0 && parsedOcr.vendorName && parsedOcr.vendorName !== 'Unknown Vendor' && parsedOcr.vendorName !== 'Unidentified Vendor') {
      const extractedVendorName = parsedOcr.vendorName.toLowerCase();
      let vendor = state.vendors.find(v =>
        v.name.toLowerCase() === extractedVendorName || v.aliases.some(alias => alias.toLowerCase() === extractedVendorName)
      );
      if (!vendor) {
        vendor = {
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
        state.vendors.push(vendor);
      }
      matchedVendorId = vendor.id;
      if (!vendor.associatedRecordIds.includes(docId)) vendor.associatedRecordIds.push(docId);
      if (isFlagged) vendor.riskRating = 'high';

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
      state.invoices.push(newInvoice);
      vendor.associatedRecordIds.push(invId);

      // Add Evidence Edges
      state.edges.push({
        id: `edge-${Date.now()}-1`,
        sourceNodeId: docId,
        targetNodeId: invId,
        relationship: 'MATCHES',
        explanation: `Document processed with OCR extracted invoice #${newInvoice.invoiceNumber}`,
        supportingRecordIds: [docId, invId],
      });
      state.edges.push({
        id: `edge-${Date.now()}-2`,
        sourceNodeId: invId,
        targetNodeId: vendor.id,
        relationship: 'ISSUED_BY',
        explanation: `Invoice issued by ${vendor.name}`,
        supportingRecordIds: [invId, vendor.id],
      });
    }

    // If flagged due to OCR uncertainty, arithmetic failure, or forensic risks, create the anomaly record & investigation!
    if (isFlagged) {
      const anomalyRecord = createOcrAnomalyRecord(newDoc, parsedOcr, matchedVendorId, createdInvoiceId);
      state.anomalies.unshift(anomalyRecord);

      const investigationId = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      state.investigations.unshift({
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
            notes: `Flagged by Autonomous OCR Uncertainty & Forensic Integrity Classifier (${anomalyRecord.detectionRule}). Detected: ${report.detectedRisks.join('; ')}`,
            author: 'AuditLens Autonomous Sentinel',
            timestamp: new Date().toISOString(),
          }
        ]
      });

      // Add Evidence Edge for Anomaly
      state.edges.push({
        id: `edge-${Date.now()}-anom`,
        sourceNodeId: docId,
        targetNodeId: anomalyRecord.id,
        relationship: 'SUPPORTS_ANOMALY',
        explanation: `OCR uncertainty rated ${report.uncertaintyLevel.toUpperCase()} with ${Math.round(report.uncertaintyScore)}% risk score.`,
        supportingRecordIds: [docId, anomalyRecord.id],
        isFlagged: true,
      });

      newDoc.extractedFields.forensicFindings = [
        {
          id: anomalyRecord.id,
          title: anomalyRecord.title,
          severity: anomalyRecord.severity,
          explanation: anomalyRecord.explanation,
          category: anomalyRecord.category,
          uncertainty: anomalyRecord.uncertainty,
          investigationId,
        }
      ];

      // Recalculate metrics
      const unresolved = state.anomalies.filter(a => a.status === 'NEEDS_REVIEW' || a.status === 'ESCALATED').length;
      state.metrics.unresolvedAnomalies = unresolved;
      state.metrics.overallScore = Math.max(82, Math.min(99.5, 99.5 - (unresolved * 1.6)));
    }

    res.json({
      success: true,
      document: newDoc,
      extractionSource,
    });
  } catch (err: any) {
    console.error('Upload processing error:', err);
    res.status(500).json({ error: err.message || 'Error processing document.' });
  }
});

// 5. Update Investigation Review Status
app.post('/api/investigations/:id/review', (req, res) => {
  const { id } = req.params;
  const { action, notes, author = 'Reviewer' } = req.body;

  const investigation = state.investigations.find(inv => inv.id === id);
  if (!investigation) {
    return res.status(404).json({ error: 'Investigation not found.' });
  }

  const validActions = ['NEEDS_REVIEW', 'VERIFIED_LEGITIMATE', 'ESCALATED', 'RESOLVED', 'NOTE_ADDED'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
  }

  // Create review event
  const reviewEvent: ReviewEvent = {
    id: `rev-${Date.now()}`,
    investigationId: id,
    anomalyId: investigation.anomalyIds[0] || '',
    action: action as any,
    notes: notes || `Status updated to ${action}`,
    author,
    timestamp: new Date().toISOString(),
  };

  investigation.reviewHistory.push(reviewEvent);

  if (action !== 'NOTE_ADDED') {
    investigation.status = action as any;
    investigation.updatedAt = new Date().toISOString();

    // Update the corresponding anomalies
    for (const anomId of investigation.anomalyIds) {
      const anom = state.anomalies.find(a => a.id === anomId);
      if (anom) {
        anom.status = action as any;
        anom.updatedAt = new Date().toISOString();
      }
    }
  }

  // Recalculate metrics
  const unresolved = state.anomalies.filter(a => a.status === 'NEEDS_REVIEW' || a.status === 'ESCALATED').length;
  state.metrics.unresolvedAnomalies = unresolved;
  state.metrics.overallScore = Math.max(88, Math.min(99.5, 99.5 - (unresolved * 1.8)));

  res.json({
    success: true,
    investigation,
    reviewEvent,
  });
});

// 6. Reset dataset to initial pristine PixelCraft demo state
app.post('/api/reset', (req, res) => {
  state.documents = JSON.parse(JSON.stringify(MOCK_DOCUMENTS));
  state.vendors = JSON.parse(JSON.stringify(MOCK_VENDORS));
  state.invoices = JSON.parse(JSON.stringify(MOCK_INVOICES));
  state.transactions = JSON.parse(JSON.stringify(MOCK_TRANSACTIONS));
  state.emails = JSON.parse(JSON.stringify(MOCK_EMAILS));
  state.subscriptions = JSON.parse(JSON.stringify(MOCK_SUBSCRIPTIONS));
  state.anomalies = JSON.parse(JSON.stringify(MOCK_ANOMALIES));
  state.edges = JSON.parse(JSON.stringify(MOCK_EVIDENCE_EDGES));
  state.investigations = JSON.parse(JSON.stringify(MOCK_INVESTIGATIONS));
  state.metrics = { ...MOCK_METRICS };
  state.company = { ...MOCK_COMPANY };

  res.json({
    success: true,
    message: 'Reset data to pristine PixelCraft Studio baseline.',
  });
});

export { app };
