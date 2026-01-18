import type { Express } from "express";
import { api } from "@shared/routes";
import { login, logout, getCurrentUser, changePassword } from "../controllers/auth.controller";
import { verifyEmail, resendVerification } from "../controllers/emailVerification.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { loginRateLimiter } from "../middleware/rateLimit.middleware";

/**
 * Register authentication routes
 */
export function registerAuthRoutes(app: Express) {
  // SECURITY HARDENING: Login endpoint improvements
  // 1. Returns SafeUser (no password hash) instead of full user object
  // 2. Rate limited to prevent brute force attacks
  // 3. Inactive users are rejected at authentication (handled in passport strategy)
  app.post(api.auth.login.path, loginRateLimiter, login);
  app.post(api.auth.logout.path, logout);
  app.get(api.auth.user.path, requireAuth, getCurrentUser);
  app.post(api.auth.changePassword.path, requireAuth, changePassword);
  
  // Email verification endpoints
  app.post(api.auth.verifyEmail.path, verifyEmail); // Can be used with or without auth (link click)
  app.get(api.auth.verifyEmail.path, verifyEmail); // Support GET for link clicks
  app.post(api.auth.resendVerificationEmail.path, requireAuth, resendVerification);
}
