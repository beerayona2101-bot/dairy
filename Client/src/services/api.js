import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9000"
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

export default api;