import type { Express } from "express";
import type { Server } from "http";
import { registerAuthRoutes } from "./auth.routes";
import { registerAdminUserRoutes } from "./adminUsers.routes";
import { registerAdminNotificationRoutes } from "./adminNotifications.routes";
import { registerDriverRoutes } from "./driver.routes";
import { registerPartnerRoutes } from "./partner.routes";
import { registerCompanyRoutes } from "./company.routes";
import { registerContactRoutes } from "./contact.routes";
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
  registerDriverRoutes(app);
  registerPartnerRoutes(app);
  registerCompanyRoutes(app);
  registerContactRoutes(app);

  return httpServer;
}
