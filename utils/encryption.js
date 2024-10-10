const crypto = require("crypto");

// Decrypt function for AES-256-ECB
function decrypt(encryptedText) {
  const sk = process.env.SECRET_KEY;
  if (sk) {
    const secretKey = Buffer.from(sk, "hex");
    const decipher = crypto.createDecipheriv("aes-256-ecb", secretKey, null);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
  return null;
}

// Encrypt data using AES-256-ECB
function encrypt(text) {
  const sk = process.env.SECRET_KEY;
  if (sk) {
    const secretKey = Buffer.from(sk, "hex");
    const cipher = crypto.createCipheriv("aes-256-ecb", secretKey, null);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }
  return null;
}

// Function to check if cookies have expired
function isCookieExpired(cookie) {
  if (!cookie || !cookie.expires) {
    return true;  // If no expiry date is provided, consider the cookie as expired.
  }
  
  const expiryDate = cookie.expires * 1000; // Puppeteer stores expiry in seconds, convert to milliseconds
  const currentTime = Date.now();
  
  return currentTime > expiryDate;
}

module.exports = {
  encrypt,
  decrypt,
  isCookieExpired,
};
