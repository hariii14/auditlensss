# AuditLens — Autonomous Multimodal Financial Forensics & Waste Recovery

> **"Every transaction has a story. Find what doesn't add up."**

AuditLens is an autonomous multimodal financial forensics and waste recovery platform built for SMBs, agencies, and fast-growing service firms. It reconciles multimodal financial streams—including PDF invoices, mobile receipt photos, bank statement feeds, corporate credit card debits, and inbound vendor emails—to uncover silent SaaS overlaps, wire redirection fraud, and tax write-off leakage in plain English.

---

## 🌟 Key Features

1. **Interactive Evidence Graph (`@xyflow/react`):**
   - Signature visual network linking **Vendors**, **Invoices**, **Transactions**, **Vendor Emails**, **SaaS Contracts**, and **Anomalies**.
   - **Mode A: Vendor Investigation**: Select any vendor (CloudBox, Figma, Apex Logistics, etc.) to isolate their full billing cluster.
   - **Mode B: Anomaly Path Focus**: Focus on any discrepancy finding to light up the exact supporting record path.
   - **Slide-Out Inspector Drawer**: Inspect raw source documents, extracted fields, and confidence scores.

2. **Deterministic Forensic Anomaly Engine:**
   - 8 testable, reproducible forensic rules:
     1. Duplicate Invoices (`RULE_DUPLICATE_INVOICES`)
     2. Duplicate Payments Across Cards (`RULE_DUPLICATE_PAYMENTS_CROSS_ACCOUNTS`)
     3. Invoice-to-Transaction Amount Mismatches (`RULE_INVOICE_TRANSACTION_AMOUNT_MISMATCH`)
     4. Conflicting Vendor Remittance Details (`RULE_CONFLICTING_PAYMENT_DETAILS`)
     5. Beneficiary Alteration & Redirection (`RULE_BENEFICIARY_ALTERATION_AND_SPOOFING`)
     6. SaaS Subscription Overlap & Zombie License Leakage (`RULE_SAAS_DUPLICATE_SUBSCRIPTION_OVERLAP`, `RULE_ZOMBIE_SUBSCRIPTION_INACTIVE_USERS`)
     7. Arithmetic & Tax Inconsistencies (`RULE_INVOICE_LINE_ITEM_ARITHMETIC`)
     8. Typosquatting & Email Homoglyphs (`RULE_DOMAIN_HOMOGLYPH_SPOOF`)

3. **Multimodal Ingestion Pipeline:**
   - Real drag-and-drop file upload supporting PDF, PNG, JPG, JPEG, WEBP, CSV, and TXT.
   - Smart Viewfinder simulator with real-time edge detection, auto-shutter, glare compensation, and 300+ DPI validation.
   - Inbound email forwarding simulator (`receipts@auditlens.com`).
   - Powered by **Google Gemini 1.5 Flash** via `@google/generative-ai` with structured Zod schema validation.
   - Seamless fallback to local deterministic parser in synthetic demo mode when no API key is provided.

4. **Human-in-the-Loop Investigation Workspace:**
   - Plain-English forensic findings without cryptic hash alerts.
   - Side-by-side remittance comparison (Historical Verified Bank vs Proposed Offshore Wire).
   - 1-tap phone dialer for verified vendor contact on file.
   - Interactive verification checklist.
   - Decision Action Bar: `[Needs Review]`, `[I Verified This — Approve]`, `[Pause Payment & Escalate]`.
   - Chronological audit log with timestamps and author signatures.

5. **CPA Audit Reports & Immutable Cryptographic Ledger:**
   - Client-side PDF investigation report compiler (`jspdf`).
   - CSV export for Schedule C tax compliance.
   - SHA-256 Ledger Verification Hash for tamper-proof mathematical provenance.
   - **Zero Disruption Guarantee:** AuditLens never alters external subscriptions or pauses payments without explicit user approval.

---

## 🏗 Tech Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS (Warm off-white `#F7F7F4`, Forest green `#176B4D`, Deep charcoal `#20231F`, Cobalt blue `#2B59FF`)
  - `@xyflow/react` (React Flow)
  - Recharts (Area & Bar financial charts)
  - Lucide React
  - jsPDF
- **Backend:**
  - Node.js & Express
  - Google Gen AI SDK (`@google/generative-ai` - Gemini 1.5 Flash)
  - Multer (Multimodal buffer ingestion)
  - Zod (Runtime validation)
  - tsx & concurrently

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 2. Installation
```bash
npm install
```

### 3. Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key if you wish to run live multimodal document extraction:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```
*(Note: If no API key is set, AuditLens automatically runs in full synthetic demo mode with the PixelCraft Studio dataset).*

### 4. Running the Forensic Engine Tests
Verify all 8 deterministic rules and the 6 key findings on the PixelCraft Studio dataset:
```bash
npm run test:engine
```

### 5. Running the Application
Launch both the Express API server (port 3001) and the Vite frontend dev server (port 5173):
```bash
npm run dev
```

Open your browser to:
- **Landing Page:** `http://localhost:5173/`
- **Overview Radar Dashboard:** `http://localhost:5173/dashboard`
- **Evidence Graph:** `http://localhost:5173/graph`
- **Investigations:** `http://localhost:5173/investigations`
- **Document Vault:** `http://localhost:5173/documents`
- **Transactions:** `http://localhost:5173/transactions`
- **Vendor Vault:** `http://localhost:5173/vendors`
- **CPA Reports & Tax Export:** `http://localhost:5173/reports`
- **Settings & Gemini Config:** `http://localhost:5173/settings`

---

## 🏢 Synthetic Dataset: PixelCraft Studio

AuditLens comes pre-loaded with the **PixelCraft Studio** dataset (a 24-person digital agency):
- **CloudBox Inc (`CB-101`):** Dual ₹999 debits across Chase Card *4491 and Amex Platinum *1004.
- **Apex Logistics (`INV-8821`):** Spoofed email (`@apex-loglstics.com` with 'l' not 'i'), altered wire instructions to Cayman Trust (*9012) vs historical Chase (*4491), and a ₹3,000 wire amount inflation.
- **Figma Inc:** Figma Enterprise ($450/mo, 15 seats) on corporate Amex overlapping with Figma Pro ($45/mo, 3 seats) on an employee Chase card.
- **InVision Technologies:** Zombie Enterprise license ($380/mo) with 0 active logins in 112 days ($4,560/yr waste).
- **Delta Air Lines & Notion:** Legitimate business expenses cleanly reconciled against bank debits (100% tax compliant).

---

## 🔒 Security & Data Integrity

- Read-only banking feeds (Plaid API compatible schema).
- No hardcoded secrets; API keys managed through environment variables or secure session configuration.
- SHA-256 pre-computed ledger hashes for all verified receipts and approvals.
