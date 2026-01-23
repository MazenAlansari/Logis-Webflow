import type { Request, Response } from "express";
import { getSafeUser } from "../services/auth.service";

/**
 * Driver Controllers
 * Handle HTTP requests/responses for driver-specific endpoints
 */

/**
 * Get driver profile
 * Returns safe user object for authenticated driver
 * Supports both session (web) and JWT (mobile) authentication
 */
export function getDriverProfile(req: Request, res: Response) {
  // SECURITY: Return safe user object (whitelist) - no password hash
  res.json(getSafeUser(req.user!));
}

