import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'payroll_default_encryption_key_32_bytes_long')
  .digest(); // 32 bytes
const IV_LENGTH = 16;

/**
 * Encrypts plain text with AES-256-CBC.
 * Returns in format: iv:encryptedData
 */
export function encryptField(text) {
  if (!text || typeof text !== 'string') return text;
  // If already encrypted, skip
  if (text.startsWith('enc:')) return text;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `enc:${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('Encryption error:', err);
    return text;
  }
}

/**
 * Decrypts text encrypted with encryptField.
 * Safely handles unencrypted plaintext legacy values.
 */
export function decryptField(text) {
  if (!text || typeof text !== 'string') return text;
  if (!text.startsWith('enc:')) return text;

  try {
    const parts = text.split(':');
    if (parts.length !== 3) return text;
    const iv = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return text;
  }
}
