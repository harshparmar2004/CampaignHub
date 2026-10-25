import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  encryptSecret,
  decryptSecret,
  maskSecret,
  generateUnsubscribeToken,
  verifyUnsubscribeToken
} from '../utils/crypto.js';

describe('AES-256-GCM Encryption & Cryptographic Utilities', () => {
  // 32-byte hex test key (64 characters)
  const TEST_KEY_HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  test('encrypts and decrypts secrets matching original text', () => {
    const plain = 'EAAGm0PX4ZB...test-meta-token-12345';
    const encrypted = encryptSecret(plain, TEST_KEY_HEX);

    assert.notEqual(encrypted, plain);
    assert.equal(encrypted.split(':').length, 3); // iv:authTag:ciphertext

    const decrypted = decryptSecret(encrypted, TEST_KEY_HEX);
    assert.equal(decrypted, plain);
  });

  test('detects tampered ciphertext with GCM authentication tag mismatch', () => {
    const plain = 'super-secret-key';
    const encrypted = encryptSecret(plain, TEST_KEY_HEX);
    const [iv, authTag, ciphertext] = encrypted.split(':');

    // Tamper with one character of ciphertext
    const tamperedCiphertext = ciphertext.slice(0, -2) + (ciphertext.slice(-2) === 'aa' ? 'bb' : 'aa');
    const tampered = `${iv}:${authTag}:${tamperedCiphertext}`;

    assert.throws(() => {
      decryptSecret(tampered, TEST_KEY_HEX);
    });
  });

  test('masks secret displaying only last 4 characters', () => {
    assert.equal(maskSecret('re_1234567890abcdef'), '••••••••cdef');
    assert.equal(maskSecret('abcd'), '••••');
    assert.equal(maskSecret(''), '');
  });

  test('signs and validates unsubscribe tokens with expiration and HMAC', () => {
    const contactId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const token = generateUnsubscribeToken(contactId, TEST_KEY_HEX);

    const verified = verifyUnsubscribeToken(token, TEST_KEY_HEX);
    assert.equal(verified.valid, true);
    assert.equal(verified.contactId, contactId);

    // Tampered token check
    const badToken = token.slice(0, -4) + 'zzzz';
    const failed = verifyUnsubscribeToken(badToken, TEST_KEY_HEX);
    assert.equal(failed.valid, false);
  });
});
