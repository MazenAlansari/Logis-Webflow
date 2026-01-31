import type { Express } from "express";
import { requireAdmin } from "../middleware/auth.middleware";
import {
  getPartners,
  getPartnersPaginatedController,
  getPartner,
  createPartnerController,
  updatePartnerController,
  activatePartnerController,
  deactivatePartnerController,
  deletePartnerController,
} from "../controllers/partner.controller";

/**
 * Register partner management routes
 * Admin only - handles PARTNER type organizations
 */
export function registerPartnerRoutes(app: Express) {
  // All routes require admin authentication
  app.get("/api/admin/partners", requireAdmin, getPartners);
  app.get("/api/admin/partners/paginated", requireAdmin, getPartnersPaginatedController);
  app.get("/api/admin/partners/:id", requireAdmin, getPartner);
  app.post("/api/admin/partners", requireAdmin, createPartnerController);
  app.patch("/api/admin/partners/:id", requireAdmin, updatePartnerController);
  app.patch("/api/admin/partners/:id/activate", requireAdmin, activatePartnerController);
  app.patch("/api/admin/partners/:id/deactivate", requireAdmin, deactivatePartnerController);
  app.delete("/api/admin/partners/:id", requireAdmin, deletePartnerController);
}
