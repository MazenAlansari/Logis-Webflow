import type { Express } from "express";
import type { Server } from "http";
import { registerAuthRoutes } from "./auth.routes";
import { registerAdminUserRoutes } from "./adminUsers.routes";
import { registerAdminNotificationRoutes } from "./adminNotifications.routes";
import { seedAdmin } from "../scripts/seed";

/**
 * Main route registration
 * Registers all application routes
 */
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed admin user if it doesn't exist
  await seedAdmin();

  // Register all route modules
  registerAuthRoutes(app);
  registerAdminUserRoutes(app);
  registerAdminNotificationRoutes(app);

  return httpServer;
}
