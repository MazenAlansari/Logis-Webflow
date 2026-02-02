import type { Express } from "express";
import { requireAdmin } from "../middleware/auth.middleware";
import {
  getUsers,
  getUsersPaginatedController,
  createUser,
  updateUser,
  updateUserEmail,
  resetUserPassword,
  getAvailableContactsController,
} from "../controllers/adminUsers.controller";

/**
 * Register admin user management routes
 */
export function registerAdminUserRoutes(app: Express) {
  // All routes require admin authentication
  app.get("/api/admin/users", requireAdmin, getUsers);
  app.get("/api/admin/users/paginated", requireAdmin, getUsersPaginatedController);
  app.get("/api/admin/users/contacts/available", requireAdmin, getAvailableContactsController);
  app.post("/api/admin/users", requireAdmin, createUser);
  app.patch("/api/admin/users/:id", requireAdmin, updateUser);
  app.patch("/api/admin/users/:id/email", requireAdmin, updateUserEmail);
  app.post("/api/admin/users/:id/reset-password", requireAdmin, resetUserPassword);
}
