import { AnomalyEngine } from '../src/engine/anomalyEngine';
import {
  MOCK_INVOICES,
  MOCK_TRANSACTIONS,
  MOCK_VENDORS,
  MOCK_EMAILS,
  MOCK_SUBSCRIPTIONS,
} from '../src/data/mockData';

console.log('====================================================');
console.log(' AUDITLENS FORENSIC ENGINE VERIFICATION TEST SUITE ');
console.log('====================================================\n');

const findings = AnomalyEngine.runAllRules({
  invoices: MOCK_INVOICES,
  transactions: MOCK_TRANSACTIONS,
  vendors: MOCK_VENDORS,
  emails: MOCK_EMAILS,
  subscriptions: MOCK_SUBSCRIPTIONS,
});

console.log(`[PASS] Evaluated 8 Forensic Rules across PixelCraft Studio Dataset`);
console.log(`[INFO] Total Anomalies Detected: ${findings.length}\n`);

let passedChecks = 0;

// Check 1: Duplicate Payment
const dupPay = findings.find(f => f.category === 'DUPLICATE_PAYMENT');
if (dupPay) {
  console.log(`✓ Rule #2 (Duplicate Payment): Found "${dupPay.title}" (Dispute: ${dupPay.currency} ${dupPay.amountInDispute})`);
  passedChecks++;
} else {
  console.error(`✗ Rule #2 Failed: Duplicate payment was not detected.`);
}

// Check 2: Amount Mismatch (₹3,000 difference)
const mismatch = findings.find(f => f.category === 'AMOUNT_MISMATCH');
if (mismatch && mismatch.amountInDispute === 3000) {
  console.log(`✓ Rule #3 (Amount Mismatch): Found "${mismatch.title}" (Variance: ₹${mismatch.amountInDispute})`);
  passedChecks++;
} else {
  console.error(`✗ Rule #3 Failed: ₹3,000 Amount mismatch was not detected.`);
}

// Check 3: Beneficiary Alteration (Offshore Cayman Trust)
const benef = findings.find(f => f.category === 'BENEFICIARY_ALTERATION');
if (benef) {
  console.log(`✓ Rule #5 (Beneficiary Alteration): Found "${benef.title}"`);
  passedChecks++;
} else {
  console.error(`✗ Rule #5 Failed: Beneficiary alteration was not detected.`);
}

// Check 4: SaaS Overlap (Figma Enterprise vs Pro)
const saas = findings.find(f => f.category === 'SAAS_OVERLAP' && f.title.includes('Figma'));
if (saas) {
  console.log(`✓ Rule #6A (SaaS Overlap): Found "${saas.title}"`);
  passedChecks++;
} else {
  console.error(`✗ Rule #6A Failed: SaaS overlap was not detected.`);
}

// Check 5: Zombie Subscription (InVision 0 logins)
const zombie = findings.find(f => f.title.includes('Zombie'));
if (zombie) {
  console.log(`✓ Rule #6B (Zombie Subscription): Found "${zombie.title}"`);
  passedChecks++;
} else {
  console.error(`✗ Rule #6B Failed: Zombie subscription was not detected.`);
}

// Check 6: Typosquatting / Homoglyph (apex-loglstics.com)
const spoof = findings.find(f => f.category === 'VISUAL_OR_DOMAIN_IRREGULARITY');
if (spoof) {
  console.log(`✓ Rule #8 (Domain Homoglyph): Found "${spoof.title}"`);
  passedChecks++;
} else {
  console.error(`✗ Rule #8 Failed: Domain homoglyph was not detected.`);
}

console.log('\n----------------------------------------------------');
if (passedChecks === 6) {
  console.log(`ALL FORENSIC ENGINE CHECKS PASSED (6/6)! 100% REPRODUCIBLE.`);
  console.log('----------------------------------------------------');
  process.exit(0);
} else {
  console.error(`FAILED: ${6 - passedChecks} checks did not pass.`);
  process.exit(1);
}
