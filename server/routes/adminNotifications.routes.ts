/**
 * Admin Notifications Routes
 * Defines admin-only notification API endpoints
 */

import type { Express } from "express";
import { sendWelcomeEmail } from "../controllers/adminNotifications.controller";
import { requireAdmin } from "../middleware/auth.middleware";

/**
 * Register admin notification routes
 */
export function registerAdminNotificationRoutes(app: Express) {
  // POST /api/admin/notifications/send-welcome
  app.post(
    "/api/admin/notifications/send-welcome",
    requireAdmin,
    sendWelcomeEmail
  );
}

