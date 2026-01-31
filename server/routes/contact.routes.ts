import type { Express } from "express";
import { requireAdmin } from "../middleware/auth.middleware";
import {
  getContactsPaginatedController,
  getContactController,
  createContactController,
  updateContactController,
  activateContactController,
  deactivateContactController,
} from "../controllers/contact.controller";
import { getAllPartners } from "../services/partner.service";
import { getCompany } from "../services/company.service";
import type { Request, Response, NextFunction } from "express";

/**
 * Register contact management routes
 * Admin only - handles contacts for both COMPANY and PARTNER organizations
 */
export function registerContactRoutes(app: Express) {
  // All routes require admin authentication
  app.get(
    "/api/admin/contacts/paginated",
    requireAdmin,
    getContactsPaginatedController
  );
  app.get("/api/admin/contacts/:id", requireAdmin, getContactController);
  app.post("/api/admin/contacts", requireAdmin, createContactController);
  app.patch("/api/admin/contacts/:id", requireAdmin, updateContactController);
  app.patch(
    "/api/admin/contacts/:id/activate",
    requireAdmin,
    activateContactController
  );
  app.patch(
    "/api/admin/contacts/:id/deactivate",
    requireAdmin,
    deactivateContactController
  );

  // Helper endpoints for organization selection
  app.get(
    "/api/admin/organizations/partners",
    requireAdmin,
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const partners = await getAllPartners();
        res.status(200).json(partners);
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    "/api/admin/organizations/company",
    requireAdmin,
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const company = await getCompany();
        if (!company) {
          return res.status(404).json({
            message: "Company not found",
          });
        }
        res.status(200).json(company);
      } catch (error) {
        next(error);
      }
    }
  );
}
