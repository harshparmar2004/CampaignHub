import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone } from '../utils/phone.js';

describe('Phone Normalization (E.164 with +91 default)', () => {
  test('normalizes standard 10-digit Indian mobile number', () => {
    const res = normalizePhone('9876543210');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
  });

  test('strips leading 0 from domestic Indian number', () => {
    const res = normalizePhone('09876543210');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
  });

  test('normalizes 12-digit number starting with 91 but missing plus', () => {
    const res = normalizePhone('919876543210');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
  });

  test('preserves already normalized +91 number', () => {
    const res = normalizePhone('+919876543210');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
  });

  test('strips spaces, hyphens, and brackets', () => {
    const res = normalizePhone('+91 (987) 654-3210');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
  });

  test('preserves valid international number (+1 for US)', () => {
    const res = normalizePhone('+14155552671');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+14155552671');
  });

  test('handles 00 international prefix', () => {
    const res = normalizePhone('00919876543210');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+919876543210');
  });

  test('rejects empty or whitespace-only input', () => {
    const res1 = normalizePhone('');
    assert.equal(res1.isValid, false);
    const res2 = normalizePhone('   ');
    assert.equal(res2.isValid, false);
  });

  test('rejects letters and invalid strings', () => {
    const res = normalizePhone('invalid-phone');
    assert.equal(res.isValid, false);
  });
});
