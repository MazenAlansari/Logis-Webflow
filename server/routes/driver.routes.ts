import type { Express } from "express";
import { api } from "@shared/routes";
import { getDriverProfile } from "../controllers/driver.controller";
import { requireAuthUniversal } from "../middleware/auth.middleware";

/**
 * Register driver routes
 * Uses requireAuthUniversal to support both session (web) and JWT (mobile) authentication
 */
export function registerDriverRoutes(app: Express) {
  // Driver profile endpoint
  // Supports both web (session) and mobile (JWT) authentication
  app.get(api.driver.profile.path, requireAuthUniversal, getDriverProfile);
}

