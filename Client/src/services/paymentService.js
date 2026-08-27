import api from "./api";

export const razorpayOrderPayment = async (amount) => {
  const res = await api.post("/payment/create-razorpay-order", { amount });
  return res.data;
};
