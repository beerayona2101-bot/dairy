/**
 * Centralized User-Friendly Error Helper
 * Transforms server, Axios, or network errors into clean, human-readable error messages.
 * Never leaks backend database details, driver errors, or internal code jargon to users.
 */

const TECHNICAL_PATTERNS = [
  "findOne",
  "buffering timed out",
  "bufferTimeoutMS",
  "mongodb",
  "mongo",
  "mongoose",
  "econn",
  "etimedout",
  "casterror",
  "validationerror",
  "node_modules",
  "stack",
  "sql",
  "topology",
  "pool",
  "replicaSet",
  "internal server error",
];

function isTechnicalError(msg) {
  if (typeof msg !== "string") return false;
  const lower = msg.toLowerCase();
  return TECHNICAL_PATTERNS.some((pattern) => lower.includes(pattern.toLowerCase()));
}

export function getFriendlyErrorMessage(error, defaultFallback = "Something went wrong. Please try again.") {
  if (!error) return defaultFallback;

  // 1. If error is a plain string
  if (typeof error === "string") {
    if (isTechnicalError(error)) {
      return "500 Error: Server error. Please try again later.";
    }
    return error;
  }

  // 2. Network error, timeout, or backend not reachable (no error.response)
  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
      return "504 Error: Server timed out. Please try again shortly.";
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return "Network Error: You appear to be offline. Please check your internet connection.";
    }
    return "Server not responding. Please check your connection or try again shortly.";
  }

  const status = Number(error.response.status) || 0;
  const rawMsg = error.response.data?.message || error.response.data?.error;

  // 3. If backend returned a friendly, non-technical message
  if (rawMsg && typeof rawMsg === "string" && !isTechnicalError(rawMsg)) {
    // Check if it already has a status prefix like "400 Error: ..."
    if (/^\d{3}\s+Error:/i.test(rawMsg.trim())) {
      return rawMsg.trim();
    }
    return status > 0 ? `${status} Error: ${rawMsg.trim()}` : rawMsg.trim();
  }

  // 4. Standard clean messages based on HTTP status code
  switch (status) {
    case 400:
      return "400 Error: Invalid input. Please check the entered information.";
    case 401:
      return "401 Error: Invalid email or password. Please try again.";
    case 403:
      return "403 Error: Access denied. You do not have permission.";
    case 404:
      return "404 Error: User account not found. Please register an account first.";
    case 409:
      return "409 Error: An account already exists with this email address.";
    case 422:
      return "422 Error: Input data format is invalid.";
    case 429:
      return "429 Error: Too many login attempts. Please wait a few minutes.";
    case 500:
      return "500 Error: Server error occurred. Please try again later.";
    case 502:
    case 503:
    case 504:
      return `${status} Error: Server not responding. Please try again shortly.`;
    default:
      return status > 0
        ? `${status} Error: Something went wrong. Please try again.`
        : "Server not responding. Please try again.";
  }
}
