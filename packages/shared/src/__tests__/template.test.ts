import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractWhatsAppVariables,
  interpolateWhatsApp,
  interpolateEmail
} from '../utils/template.js';

describe('Template Interpolation Logic', () => {
  test('extracts variable indices from WhatsApp template body', () => {
    const text = 'Hello {{1}}, your order {{2}} has been confirmed. Thank you {{1}}!';
    const vars = extractWhatsAppVariables(text);
    assert.deepEqual(vars, ['1', '2']);
  });

  test('interpolates WhatsApp variables with contact fields', () => {
    const body = 'Hello {{1}}, your account {{2}} is active.';
    const varMap = { '1': 'name', '2': 'phone' };
    const contact = { name: 'Priya Sharma', phone: '+919876543210' };

    const result = interpolateWhatsApp(body, varMap, contact);
    assert.equal(result, 'Hello Priya Sharma, your account +919876543210 is active.');
  });

  test('interpolates WhatsApp variables with fixed values', () => {
    const body = 'Offer: {{1}} off on your order!';
    const varMap = { '1': 'fixed:50% discount' };
    const contact = { name: 'Rahul' };

    const result = interpolateWhatsApp(body, varMap, contact);
    assert.equal(result, 'Offer: 50% discount off on your order!');
  });

  test('interpolates Email HTML with {{name}} and fallback', () => {
    const html = '<h1>Welcome, {{name}}!</h1><p>We are glad you are here.</p>';
    const resultWithName = interpolateEmail(html, { name: 'Vikram' });
    assert.equal(resultWithName, '<h1>Welcome, Vikram!</h1><p>We are glad you are here.</p>');

    const resultWithoutName = interpolateEmail(html, {});
    assert.equal(resultWithoutName, '<h1>Welcome, Friend!</h1><p>We are glad you are here.</p>');
  });
});
