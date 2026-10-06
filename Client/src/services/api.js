import axios from "axios";
import { getFriendlyErrorMessage } from "../utils/errorHelper";

const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    return `${protocol}//${window.location.hostname}:9000`;
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
