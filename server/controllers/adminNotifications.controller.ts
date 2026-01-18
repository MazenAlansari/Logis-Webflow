/**
 * Admin Notifications Controller
 * Handle HTTP requests/responses for admin notification endpoints
 */

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { triggerWorkflow } from "../services/novuEmail.service";
import { env } from "../config/env";

/**
 * Request schema for send-welcome endpoint
 */
const sendWelcomeSchema = z.object({
  userId: z.string().uuid("userId must be a valid UUID"),
  tempPassword: z.string().min(1, "tempPassword is required"),
});

type SendWelcomeRequest = z.infer<typeof sendWelcomeSchema>;

/**
 * POST /api/admin/notifications/send-welcome
 * Send welcome email to a user (admin only)
 */
export async function sendWelcomeEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate request body
    const body = sendWelcomeSchema.parse(req.body);
    const { userId, tempPassword } = body as SendWelcomeRequest;

    // Load user from database
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Validate user is active
    if (!user.isActive) {
      return res.status(400).json({
        message: "Cannot send welcome email to inactive user",
      });
    }

    // Build payload for Novu workflow
    const payload = {
      fullName: user.fullName,
      email: user.username,
      tempPassword: tempPassword,
      loginUrl: env.appLoginUrl,
      instruction: "Login with the temporary password and change it on first login.",
    };

    // Generate unique transaction ID to avoid duplicate sends on retries
    const transactionId = `welcome-${user.id}-${Date.now()}`;

    // Trigger Novu workflow
    await triggerWorkflow("welcome-user", user, payload, transactionId);

    // Return success
    res.status(200).json({
      ok: true,
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors,
      });
    }

    // Handle Novu configuration errors
    if (error instanceof Error && error.message.includes("NOVU_API_KEY")) {
      console.error("[AdminNotifications] Novu configuration error:", error.message);
      return res.status(500).json({
        message: "Email service is not configured. Please contact administrator.",
      });
    }

    // Handle other errors (including Novu API errors)
    console.error("[AdminNotifications] Error sending welcome email:");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    if (error && typeof error === 'object' && 'response' in error) {
      console.error("Novu API Response:", JSON.stringify((error as any).response?.data || (error as any).response, null, 2));
    }
    if (error && typeof error === 'object' && 'status' in error) {
      console.error("Status code:", (error as any).status);
    }
    console.error("Full error object:", error);
    next(error);
  }
}

