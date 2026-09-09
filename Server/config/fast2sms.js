import fetch from "node-fetch";

/**
 * Sends OTP or Transactional SMS via Fast2SMS API
 * @param {Object} params - { mobileNo, otp, message }
 */
export const sendSMS = async ({ mobileNo, otp, message }) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ FAST2SMS_API_KEY is not configured in Server/.env");
    return { success: false, message: "FAST2SMS_API_KEY is not set in environment." };
  }

  if (!mobileNo) {
    console.warn("⚠️ Fast2SMS: Mobile number is missing.");
    return { success: false, message: "Mobile number is required." };
  }

  // Sanitize to 10-digit Indian mobile number
  const cleanMobile = mobileNo.toString().replace(/[^0-9]/g, "").slice(-10);
  if (cleanMobile.length !== 10) {
    console.warn(`⚠️ Fast2SMS: Invalid mobile number ${mobileNo}`);
    return { success: false, message: "Invalid 10-digit mobile number." };
  }

  try {
    const url = "https://www.fast2sms.com/dev/bulkV2";
    let bodyPayload = {};

    if (otp) {
      bodyPayload = {
        variables_values: otp.toString(),
        route: "otp",
        numbers: cleanMobile,
      };
    } else {
      bodyPayload = {
        message: message || "MADHU Dairy notification",
        language: "english",
        route: "q",
        numbers: cleanMobile,
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await response.json();
    console.log(`📱 [Fast2SMS] Dispatched to ${cleanMobile}:`, data);

    if (data?.return || data?.status_code === 200 || data?.request_id) {
      return { success: true, data };
    } else {
      return { success: false, message: data?.message || "SMS delivery failed.", data };
    }
  } catch (error) {
    console.error("📱 [Fast2SMS] API Error:", error?.message);
    return { success: false, error: error.message };
  }
};
