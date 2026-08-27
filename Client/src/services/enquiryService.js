import api from "./api";

/**
 * Submit customer enquiry from contact form
 */
export const submitEnquiryApi = async (formData) => {
  const res = await api.post("/api/enquiry/submit", formData);
  return res?.data;
};

/**
 * Fetch all customer enquiries for Admin
 */
export const fetchEnquiriesApi = async () => {
  const res = await api.get("/api/enquiry/all");
  return res?.data;
};

/**
 * Send 1-Click Email Reply from Admin
 */
export const replyEnquiryApi = async (replyData) => {
  const res = await api.post("/api/enquiry/reply", replyData);
  return res?.data;
};
