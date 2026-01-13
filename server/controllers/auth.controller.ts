import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import { getSafeUser } from "../services/auth.service";
import { changePassword as changePasswordService } from "../services/auth.service";

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
