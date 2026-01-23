import type { Request, Response, NextFunction } from "express";
import { requireJWT } from "./jwt.middleware";

/**
 * Authorization Middleware
 * 
 * requireAuth: Ensures user is authenticated (has valid session)
 * requireAuthUniversal: Supports both session (web) and JWT (mobile) authentication
 * requireAdmin: Ensures user is authenticated AND has ADMIN role
 */

/**
 * Middleware to require authentication (session-based, for web)
 * Checks if req.isAuthenticated() and req.user exists
 * Returns 401 if not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

/**
 * Universal authentication middleware
 * Supports both session-based (web) and JWT-based (mobile) authentication
 * 
 * Flow:
 * 1. Check for JWT token in Authorization header → use JWT auth
 * 2. Otherwise, check for session → use session auth
 * 
 * Sets req.user in same format for both methods
 */
export function requireAuthUniversal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Check for JWT token first (mobile)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Use JWT authentication
    return requireJWT(req, res, next);
  }

  // Otherwise, use session authentication (web)
  return requireAuth(req, res, next);
}

/**
 * Middleware to require ADMIN role
 * Extends requireAuth and checks req.user.role === 'ADMIN'
 * Returns 403 if user is not an admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
}
