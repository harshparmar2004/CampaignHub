import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateWhatsAppCost } from '../utils/template.js';
import { DEFAULT_PRICING_INR } from '../constants/index.js';

describe('WhatsApp India Cost Calculations', () => {
  test('calculates marketing cost accurately with default rate (0.9926 INR)', () => {
    const cost = calculateWhatsAppCost(1000, 'MARKETING');
    assert.equal(cost, 992.6);
  });

  test('calculates utility cost accurately with default rate (0.1323 INR)', () => {
    const cost = calculateWhatsAppCost(1000, 'UTILITY');
    assert.equal(cost, 132.3);
  });

  test('returns 0 when recipient count is 0', () => {
    const cost = calculateWhatsAppCost(0, 'MARKETING');
    assert.equal(cost, 0);
  });

  test('applies custom pricing overrides when supplied', () => {
    const cost = calculateWhatsAppCost(500, 'MARKETING', { marketing: 1.25 });
    assert.equal(cost, 625.0);
  });
});
