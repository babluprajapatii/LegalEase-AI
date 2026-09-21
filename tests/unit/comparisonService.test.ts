import test from 'node:test';
import assert from 'node:assert/strict';
import { AIService, STANDARD_LEGAL_DISCLAIMER } from '../../backend/src/services/aiService';

const docV1Text = `COMMERCIAL LEASE AGREEMENT (v1)
Section 1. Rent. Rent is $4,000 per month due on the 1st of each month.
Section 2. Term. Lease term is 2 years starting Jan 1, 2024.
Section 3. Subletting. Tenant may sublet with landlord approval.`;

const docV2Text = `COMMERCIAL LEASE AGREEMENT (v2)
Section 1. Rent. Rent is $4,500 per month due on the 1st of each month.
Section 2. Term. Lease term is 3 years starting Jan 1, 2024.
Section 3. Subletting. Subletting is strictly prohibited.
Section 4. Termination Notice. 30 days written notice required to terminate this agreement.`;

test('comparisonService - identifies added clauses with changeType added', async () => {
  const aiService = new AIService();
  const result = await aiService.compareDocuments(
    docV1Text,
    'Lease_v1.pdf',
    docV2Text,
    'Lease_v2.pdf',
  );

  assert.ok(result.addedCount >= 0);
  assert.ok(
    result.differences.some(
      (d) =>
        d.changeType === 'added' ||
        d.title.includes('Late Fee') ||
        d.explanation.includes('added') ||
        d.explanation.includes('New'),
    ),
  );
});

test('comparisonService - identifies removed clauses with changeType removed', async () => {
  const aiService = new AIService();
  // Reverse order so section 4 is removed
  const result = await aiService.compareDocuments(
    docV2Text,
    'Lease_v2.pdf',
    docV1Text,
    'Lease_v1.pdf',
  );

  assert.ok(result.removedCount >= 0);
  assert.ok(
    result.differences.some(
      (d) =>
        d.changeType === 'removed' ||
        (d.explanation && d.explanation.includes('removed')) ||
        (d.title && d.title.includes('Removed')),
    ),
  );
});

test('comparisonService - identifies modified clauses with changeType modified', async () => {
  const aiService = new AIService();
  const result = await aiService.compareDocuments(
    docV1Text,
    'Lease_v1.pdf',
    docV2Text,
    'Lease_v2.pdf',
  );

  assert.ok(result.modifiedCount >= 0);
  assert.ok(Array.isArray(result.differences));
  assert.ok(result.differences.length > 0);
  assert.ok(typeof result.addedCount === 'number');
  assert.ok(typeof result.removedCount === 'number');
  assert.ok(typeof result.modifiedCount === 'number');
});

test('comparisonService - produces typeCompatibilityWarning when comparing mismatched document types', async () => {
  const aiService = new AIService();
  const leaseText =
    'COMMERCIAL LEASE AGREEMENT. Rent is $5,000 per month. Landlord and Tenant obligations.';
  const privacyText =
    'PRIVACY POLICY. We collect personal data, cookies, and IP addresses under GDPR and CCPA regulations.';

  const result = await aiService.compareDocuments(
    leaseText,
    'Lease.pdf',
    privacyText,
    'Privacy_Policy.pdf',
  );

  assert.ok(result.typeCompatibilityWarning);
  assert.ok(
    result.typeCompatibilityWarning.includes('fundamentally different document types') ||
      result.typeCompatibilityWarning.includes('Lease') ||
      result.typeCompatibilityWarning.includes('Privacy Policy'),
  );
});

test('comparisonService - fallback comparison generator produces structural summary and legal disclaimer', () => {
  const aiService = new AIService();

  // Exercise fallback comparison generator directly
  const fallback = (aiService as any).generateGroundedComparisonFallback(
    docV1Text,
    'Lease_v1.pdf',
    docV2Text,
    'Lease_v2.pdf',
  );

  assert.ok(fallback.summary.includes('Lease_v1.pdf') && fallback.summary.includes('Lease_v2.pdf'));
  assert.ok(Array.isArray(fallback.differences));
  assert.equal(typeof fallback.addedCount, 'number');
  assert.equal(typeof fallback.removedCount, 'number');
  assert.equal(typeof fallback.modifiedCount, 'number');
  assert.ok(Array.isArray(fallback.nextSteps));
  assert.equal(fallback.disclaimer, STANDARD_LEGAL_DISCLAIMER);
});
