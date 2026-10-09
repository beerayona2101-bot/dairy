import axios from "axios";
import { getFriendlyErrorMessage } from "../utils/errorHelper";

export const getBaseUrl = () => {
  // 1. If VITE_API_URL is configured in environment, use it directly
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // 2. In browser environments:
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    // Local development (localhost, 127.0.0.1, or local WiFi network IP)
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.")
    ) {
      const protocol = window.location.protocol === "https:" ? "https:" : "http:";
      return `${protocol}//${hostname}:9000`;
    }

    // Cloud deployment (Vercel, Netlify, Render, or custom domain):
    // Use the origin without appending :9000
    return window.location.origin.replace(/\/+$/, "");
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
