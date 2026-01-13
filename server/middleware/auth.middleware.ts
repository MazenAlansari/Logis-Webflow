import type { Request, Response, NextFunction } from "express";

/**
 * Authorization Middleware
 * 
 * requireAuth: Ensures user is authenticated (has valid session)
 * requireAdmin: Ensures user is authenticated AND has ADMIN role
 */

/**
 * Middleware to require authentication
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
