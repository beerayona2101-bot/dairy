import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - new Date()) / 1000); // in seconds
    const minutes = Math.ceil(retryAfter / 60);
    res.status(429).json({
      status: 429,
      message: `Too many login attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
    });
  }
});
