const CryptoJS = require('crypto-js');

// This key encrypts every customer's WhatsApp access token at rest. Falling
// back to a hardcoded default here would mean anyone who reads this source
// file (or the public repo) could decrypt every stored token — fail loudly
// instead of silently using a known key.
if (!process.env.ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required and not set');
}
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

const encrypt = (text) => {
  if (!text) return null;
  const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  return encrypted;
};

const decrypt = (cipherText) => {
  if (!cipherText) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (err) {
    return null;
  }
};

module.exports = { encrypt, decrypt };
