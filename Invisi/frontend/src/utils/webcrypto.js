/**
 * webcrypto.js — Shared encryption utilities using the browser-native Web Crypto API
 *
 * Algorithm: AES-256-GCM (authenticated encryption — more secure than AES-CBC)
 * Key derivation: PBKDF2 with SHA-256, 100,000 iterations
 *
 * Why AES-GCM over AES-CBC (CryptoJS default)?
 * - GCM provides built-in authentication (detects tampering)
 * - CBC requires separate HMAC — GCM does it in one step
 * - GCM is faster on modern hardware with AES-NI support
 */

/* ── HELPERS ── */

/** Convert ArrayBuffer → Base64 string for storage */
const bufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

/** Convert Base64 string → Uint8Array for decryption */
const base64ToBuffer = (b64) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/* ── KEY DERIVATION ── */

/**
 * Derive an AES-256-GCM key from a passphrase + salt using PBKDF2
 * @param {string} passphrase
 * @param {Uint8Array} salt
 * @param {"encrypt"|"decrypt"} usage
 * @returns {Promise<CryptoKey>}
 */
const deriveKey = async (passphrase, salt, usage) => {
  const keyMaterial = await crypto.subtle.importKey(
   
    "raw",

    new TextEncoder().encode(passphrase), 
    "PBKDF2", 
    false, 
    ["deriveKey"]   
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    [usage]
  );
};

/* ── ENCRYPT ── */

/**
 * Encrypt a plaintext message with a passphrase
 * @param {string} message
 * @param {string} passphrase
 * @returns {Promise<{ cipherText: string, iv: string, salt: string }>}
 * All values are Base64 strings safe for JSON/MongoDB storage
 */
export const encryptMessage = async (message, passphrase) => {
  // Generating Randomness (The "Entropy")
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

// Deriving the Key, It takes your human passphrase and the new salt to "stretch" them into a 256-bit AES key.
  const key = await deriveKey(passphrase, salt, "encrypt");

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    // The TextEncoder() converts your text message into bytes so the algorithm can process it
    new TextEncoder().encode(message)
  );

  return {
    // Computers handle encryption in "ArrayBuffers" (raw binary), but MongoDB and JSON prefer strings.

// This converts the raw binary data into Base64 strings.
// Crucial Logic: To decrypt this later, you must store the iv and the salt alongside the cipherText. These are not secret (it's okay to store them in plain text), but they are required to rebuild the key and unlock the message.
    cipherText: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
  };
};

/* ── DECRYPT ── */

/**
 * Decrypt a cipherText with a passphrase
 * @param {string} cipherText — Base64
 * @param {string} iv — Base64
 * @param {string} salt — Base64
 * @param {string} passphrase
 * @returns {Promise<string>} decrypted plaintext
 * @throws if passphrase is wrong or data is tampered (GCM auth tag fails)
 */
export const decryptMessage = async (cipherText, iv, salt, passphrase) => {
  const saltBuffer = base64ToBuffer(salt);
  const ivBuffer = base64ToBuffer(iv);
  const cipherBuffer = base64ToBuffer(cipherText);

  const key = await deriveKey(passphrase, saltBuffer, "decrypt");

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuffer },
    key,
    cipherBuffer
  );

  return new TextDecoder().decode(plainBuffer); 
};