/**
 * Email Verification Controller
 * Handle HTTP requests/responses for email verification endpoints
 */

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  verifyEmailToken,
  resendVerificationEmail,
} from "../services/emailVerification.service";
import { requireAuth } from "../middleware/auth.middleware";

/**
 * Request schema for verify email endpoint
 */
const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;

/**
 * POST /api/auth/verify-email or GET /api/auth/verify-email?token=xxx
 * Verify email using token (from link or manual entry)
 */
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from query string (for GET/link clicks) or request body (for POST/manual entry)
    const token = (req.method === "GET" ? req.query.token : req.body?.token) as string;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    // Verify token
    const result = await verifyEmailToken(token);

    if (!result.success) {
      return res.status(400).json({
        message: result.message,
      });
    }

    // Return success
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("[EmailVerification] Error verifying email:", error);
    next(error);
  }
}

/**
 * POST /api/auth/resend-verification-email
 * Resend verification email (authenticated endpoint)
 */
export async function resendVerification(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;

    // Resend verification email (with rate limiting)
    const result = await resendVerificationEmail(userId);

    if (!result.success) {
      return res.status(400).json({
        message: result.message,
      });
    }

    // Return success
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("[EmailVerification] Error resending verification email:", error);
    next(error);
  }
}

