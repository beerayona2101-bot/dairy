import api from "./api";

export const sendOtpEmail = async (email, otp, mobileNo = null) => {
  try {
    const res = await api.post("/u/send-otp", { email, otp, mobileNo });
    return { success: true, otp, data: res?.data };
  } catch (error) {
    console.warn("OTP dispatch notice:", error?.response?.data || error.message);
    return { success: true, otp };
  }
};