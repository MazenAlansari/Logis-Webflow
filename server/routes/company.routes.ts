import type { Express } from "express";
import { requireAdmin } from "../middleware/auth.middleware";
import {
  getCompanyController,
  createCompanyController,
  updateCompanyController,
} from "../controllers/company.controller";

/**
 * Register company management routes
 * Admin only - handles COMPANY type organization (only one company)
 */
export function registerCompanyRoutes(app: Express) {
  // All routes require admin authentication
  app.get("/api/admin/company", requireAdmin, getCompanyController);
  app.post("/api/admin/company", requireAdmin, createCompanyController);
  app.patch("/api/admin/company", requireAdmin, updateCompanyController);
}
