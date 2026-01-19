import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/jwt.service";
import { storage } from "../storage";

/**
 * JWT Middleware
 * Extracts JWT token from Authorization header, verifies it, and loads user
 * Sets req.user if token is valid (same format as session auth)
 */

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      fullName: string;
      role: "ADMIN" | "DRIVER";
      isActive: boolean;
      mustChangePassword: boolean;
      emailVerified: boolean;
      lastLoginAt: Date | null;
      createdAt: Date;
    }
  }
}

/**
 * Extract JWT token from Authorization header
 * Format: "Bearer <token>"
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * JWT Authentication Middleware
 * 
 * 1. Extracts token from Authorization header
 * 2. Verifies token signature and expiration
 * 3. Loads user from database (ensures still active)
 * 4. Sets req.user (same format as session auth)
 * 
 * Returns 401 if:
 * - No Authorization header
 * - Token format is invalid
 * - Token is expired or invalid
 * - User not found or inactive
 */
export async function requireJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract token from header
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error: any) {
      if (error.message === "Token expired") {
        return res.status(401).json({ message: "Unauthorized: Token expired" });
      }
      if (error.message === "Invalid token") {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
      if (error.message === "Token has been revoked") {
        return res.status(401).json({ message: "Unauthorized: Token has been revoked" });
      }
      throw error;
    }

    // Load user from database
    const user = await storage.getUser(payload.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // SECURITY: Ensure user is still active
    if (!user.isActive) {
      return res.status(401).json({ message: "Unauthorized: User is inactive" });
    }

    // Set req.user (same format as session auth)
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

