import type { Express, NextFunction, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { insertUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import passport from "passport";

// Seed Admin Function
async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@logistics.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminName = process.env.ADMIN_NAME || "System Admin";

  const existingAdmin = await storage.getUserByUsername(adminEmail);
  if (!existingAdmin) {
    console.log("Seeding initial Admin user...");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await storage.createUser({
      username: adminEmail,
      password: hashedPassword,
      fullName: adminName,
      role: "ADMIN",
      isActive: true,
      mustChangePassword: false, // Initial seeded admin doesn't need to change password immediately for simplicity, or set true if strict.
    });
    console.log("Admin seeded successfully.");
  }
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  await seedAdmin();

  // Auth Routes
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.user.path, isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.changePassword.path, isAuthenticated, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = req.user!;
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.updateUser(user.id, { 
      password: hashedPassword,
      mustChangePassword: false 
    });

    res.json({ message: "Password updated successfully" });
  });

  return httpServer;
}
