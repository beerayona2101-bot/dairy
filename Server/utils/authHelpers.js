/**
 * Authentication & Identity Helpers
 * Ensures strict uniqueness and clean formatting for Email and Mobile Numbers.
 */

export const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
};

export const normalizeMobile = (mobile) => {
  if (!mobile) return "";
  const cleaned = String(mobile).trim().replace(/\D/g, "");
  // Indian phone number normalization: strip leading +91 or 0
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return cleaned.slice(2);
  }
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return cleaned.slice(1);
  }
  return cleaned;
};

export const isValidMobile = (mobile) => {
  const norm = normalizeMobile(mobile);
  // Valid standard 10-digit mobile number starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(norm);
};

export const isValidEmail = (email) => {
  const norm = normalizeEmail(email);
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(norm);
};
