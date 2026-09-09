import api from "./api";

export const razorpayOrderPayment = async (amount, currency = "INR") => {
  const res = await api.post("/payment/create-razorpay-order", { amount, currency });
  return res.data;
};

export const verifyRazorpayPayment = async (paymentData) => {
  const res = await api.post("/payment/verify-payment", paymentData);
  return res.data;
};

export const fetchPaymentDetails = async (paymentId) => {
  const res = await api.get(`/payment/details/${paymentId}`);
  return res.data;
};

export const requestOrderRefund = async (refundPayload) => {
  const res = await api.post("/payment/refund", refundPayload);
  return res.data;
};
