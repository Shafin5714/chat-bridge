import rateLimit from "express-rate-limit";

// Rate limiter for authentication routes (login, register)
// 10 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many authentication attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for sending messages
// 60 messages per minute per IP
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    message: "You are sending messages too fast. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
