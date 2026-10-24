# AuditLens

AI- assisted financial document review for Small and Medium-sized businesses

## 1. Overview

AuditLens is a project designed to help small and medium-sized businesses review financial documents and identify potential inconsistencies.

It aims to make checking invoices, receipts, and bank transaction records easier by organizing information, comparing records, and highlighting items that may need human review.

## 2. Problem Statement

Small businesses often manage financial documents manually. 

This can make it difficult to identify duplicate invoices, incorrect totals, missing information, or inconsistencies between records.

AuditLens aims to simplify this process and help users review potential issues more efficiently and quickly.

## 3. Users and context
Our main users are small and medium-sized business owners, accountants, and finance teams.

They often work with multiple financial documents and need a simpler way to check records, identify mistakes, and investigate unusual transactions.

## 3. Solution overview
AuditLens is an AI-assisted tool that reads financial documents, extracts important information, and checks for possible inconsistencies within the records.

The planned workflow is:
1. Upload invoices, receipts, and bank transaction files.
2. Extract dates, amounts, invoice numbers, and supplier names.
3. Organize the extracted information.
4. Compare records and check calculations.
5. Highlight potential duplicates, mismatches, and missing information.
6. Generate a report explaining the highlighted issues and its evidences.

A human reviews the findings before taking action.


## 4. Setup and run
Open the AuditLens project in a web browser or development environment.

Install the required dependencies.

Configure the necessary API keys.

Start the application using the provided development instructions.

Upload a sample financial document to test the analysis.

## 5. Models and data
AuditLens may use an AI model to extract information from documents or explain potential inconsistencies.

For the prototype, we plan to use synthetic financial documents or other appropriately licensed data.
Models used :
- Frontend: React, TypeScript, Vite
- Backend: Node.js
- AI model/API: OpenAI API
- Document processing: PDF and image text extraction
- Database: PostgreSQL
- Development tools: Google AI sstudio, Antigravity IDE, VS code


## 6. Evaluation and guardrails
We will test AuditLens using different examples, including:
- Correct invoices.
- Duplicate invoice numbers.
- Incorrect totals.
- Missing information.
- Documents with unclear or incomplete text.

AuditLens highlights potential inconsistencies, it does not independently establish fraud, or legal non-compliance. Results should be verified by a human reviewer.

## 7. Known limitations and risks
- Poor-quality images may lead to incorrect text extraction.
- Some errors may go undetected.
- Valid transactions may sometimes be flagged incorrectly.
- AI-generated explanations may contain mistakes.
- The prototype cannot guarantee that every financial or compliance issue will be identified.
- Sensitive financial documents must be handled securely.


## 8. Data Sources and Licensing

The prototype uses synthetic financial documents created for demonstration and testing. No real customer financial data is required for the demo.

Synthetic demo data will be used where appropriate. Any external datasets, libraries, models, and other resources will be acknowledged along with their applicable licenses.


## 9. Team
- Harikrishnan K R 
- Haridev Satheesh



## 10. Product Demo

The AuditLens demo demonstrates uploading financial documents, extracting key information, identifying potential inconsistencies, and generating an evidence-based report for human review.

Demo inputs include sample invoices and financial documents containing both valid records and deliberately introduced anomalies.
https://auditlensss.vercel.app/dashboard
presentation link: https://www.canva.com/design/DAHYv4yDrHw/238S75ZOP9q-HTyKM6FJSg/edit


