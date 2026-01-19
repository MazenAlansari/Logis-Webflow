import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import { getSafeUser } from "../services/auth.service";
import { changePassword as changePasswordService } from "../services/auth.service";
import { generateToken, revokeToken } from "../services/jwt.service";

/**
 * Authentication Controllers
 * Handle HTTP requests/responses for authentication endpoints
 */

/**
 * Login controller
 * Uses Passport local strategy for authentication
 * Returns safe user object (no password hash)
 */
export function login(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      // SECURITY: Return safe user object (whitelist) - no password hash
      return res.json(getSafeUser(user));
    });
  })(req, res, next);
}

/**
 * Logout controller
 */
export function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
}

/**
 * Get current user controller
 * Returns safe user object for authenticated user
 */
export function getCurrentUser(req: Request, res: Response) {
  // SECURITY: Return safe user object (whitelist) - no password hash
  res.json(getSafeUser(req.user!));
}

/**
 * Mobile login controller
 * Uses Passport local strategy for authentication (same validation as web)
 * Returns JWT token instead of creating session
 * Used by Flutter mobile app
 */
export function loginMobile(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    try {
      // Generate JWT token instead of creating session
      const safeUser = getSafeUser(user);
      const token = generateToken(safeUser);

      // Return token and user data
      res.json({
        token,
        user: safeUser,
      });
    } catch (error: any) {
      // Handle JWT generation errors (e.g., JWT_SECRET not configured)
      if (error.message.includes("JWT_SECRET")) {
        return res.status(500).json({
          message: "Authentication service is not configured. Please contact administrator.",
        });
      }
      next(error);
    }
  })(req, res, next);
}

/**
 * Mobile logout controller
 * Invalidates JWT token by adding it to blacklist
 * Used by Flutter mobile app
 * 
 * Requires Authorization header with Bearer token
 * Returns 400 if no token is provided
 */
export function logoutMobile(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ 
        message: "Authorization token is required for logout" 
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Revoke the token (add to blacklist)
    revokeToken(token);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

/**
 * Change password controller
 */
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    await changePasswordService(userId, {
      currentPassword,
      newPassword,
    });

    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    if (error.message === "Incorrect current password") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}
