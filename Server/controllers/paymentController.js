import Razorpay from "razorpay";

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key_id",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret",
  });
};

export const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;

  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key_id";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret";

  if (!keyId || keyId.includes("dummy") || !keySecret || keySecret.includes("dummy")) {
    return res.status(200).json({
      success: true,
      isMock: true,
      keyId,
      orderId: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: "INR",
    });
  }

  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `order_rcptid_${Date.now()}`,
  };

  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.warn("Razorpay API notice:", err.message);
    return res.status(200).json({
      success: true,
      isMock: true,
      keyId,
      orderId: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: "INR",
    });
  }
};
