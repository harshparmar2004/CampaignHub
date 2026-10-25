import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @param plainText The plaintext to encrypt.
 * @param encryptionKeyHex A 64-character hex string representing a 32-byte key.
 * @returns Serialized format: "iv:authTag:ciphertext" (all in hex)
 */
export function encryptSecret(plainText: string, encryptionKeyHex: string): string {
  if (!plainText) return '';
  const key = Buffer.from(encryptionKeyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a serialized "iv:authTag:ciphertext" string using AES-256-GCM.
 * @param cipherString Serialized encrypted string.
 * @param encryptionKeyHex A 64-character hex string representing a 32-byte key.
 * @returns Decrypted plaintext string.
 */
export function decryptSecret(cipherString: string, encryptionKeyHex: string): string {
  if (!cipherString) return '';
  const parts = cipherString.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format. Expected iv:authTag:ciphertext');
  }
  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = Buffer.from(encryptionKeyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Masks a secret string showing only the last 4 characters.
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return '';
  if (secret.length <= 4) return '••••';
  return `••••••••${secret.slice(-4)}`;
}

/**
 * Generates an HMAC-signed one-click unsubscribe token.
 */
export function generateUnsubscribeToken(contactId: string, secretKey: string): string {
  const timestamp = Date.now().toString();
  const dataToSign = `${contactId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', secretKey).update(dataToSign).digest('hex');
  const payload = `${dataToSign}:${hmac}`;
  return Buffer.from(payload, 'utf8').toString('base64url');
}

/**
 * Verifies an HMAC-signed unsubscribe token.
 */
export function verifyUnsubscribeToken(token: string, secretKey: string, maxAgeMs: number = 90 * 24 * 60 * 60 * 1000): {
  valid: boolean;
  contactId?: string;
  error?: string;
} {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed token' };
    }
    const [contactId, timestampStr, hmacHex] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return { valid: false, error: 'Invalid timestamp' };
    }
    if (Date.now() - timestamp > maxAgeMs) {
      return { valid: false, error: 'Token expired' };
    }

    const expectedHmac = crypto.createHmac('sha256', secretKey).update(`${contactId}:${timestampStr}`).digest('hex');
    const isValid = crypto.timingSafeEqual(Buffer.from(hmacHex, 'hex'), Buffer.from(expectedHmac, 'hex'));
    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true, contactId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Token verification failed';
    return { valid: false, error: message };
  }
}
