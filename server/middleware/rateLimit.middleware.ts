import rateLimit from "express-rate-limit";

/**
 * Rate limiting middleware configurations
 */

/**
 * Login rate limiter
 * Limits: 10 attempts per 15 minutes per IP
 * Prevents brute force attacks on login
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
