import axios from "axios";
import { getFriendlyErrorMessage } from "../utils/errorHelper";

export const isProductionMode = () => {
  const envVal = import.meta.env.VITE_IS_PRODUCTION;
  if (envVal === "true") return true;
  if (envVal === "false") return false;
  return Boolean(import.meta.env.PROD);
};

export const getBaseUrl = () => {
  const isProd = isProductionMode();

  // In browser environments:
  if (typeof window !== "undefined" && window.location) {
    const { hostname, protocol, origin } = window.location;

    // 1. In Production Mode: Open / connect to application on ANY server or domain
    if (isProd) {
      const envUrl = import.meta.env.VITE_API_URL;
      if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
        const trimmed = envUrl.trim().replace(/\/+$/, "");
        const isEnvLocal = trimmed.includes("localhost") || trimmed.includes("127.0.0.1");
        // If a non-local production URL is specified in .env, use it
        if (!isEnvLocal) {
          return trimmed;
        }
      }
      // When deployed or accessed on any server IP/domain, use the active origin
      return origin.replace(/\/+$/, "");
    }

    // 2. In Local Mode: Strictly connect to local backend server
    const isLanIp =
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

    if (isLanIp) {
      const scheme = protocol === "https:" ? "https:" : "http:";
      return `${scheme}//${hostname}:9000`;
    }

    return "http://localhost:9000";
  }

  // Non-browser fallback
  if (isProd) {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
      return envUrl.trim().replace(/\/+$/, "");
    }
  }

  return "http://localhost:9000";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const userToken = sessionStorage.getItem("userToken");
    const adminToken = sessionStorage.getItem("adminToken");

    if (adminToken && (
      config.url.startsWith("/admin") ||
      config.url.startsWith("/admin-profile") ||
      config.url.startsWith("/store") ||
      config.url.startsWith("/page-content") ||
      config.url.startsWith("/enquiry") ||
      config.url.startsWith("/api/enquiry") ||
      config.url === "/u/customers"
    )) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      config.headers["x-admin-token"] = adminToken;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
      config.headers["x-user-token"] = userToken;
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      config.headers["x-admin-token"] = adminToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const friendly = getFriendlyErrorMessage(error);
    error.friendlyMessage = friendly;
    if (error.response?.data) {
      error.response.data.message = friendly;
    }
    return Promise.reject(error);
  }
);

export default api;
