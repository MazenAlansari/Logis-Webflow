import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { env } from "../config/env";

/**
 * Seed initial admin user
 * Creates default admin user if it doesn't exist
 */
export async function seedAdmin() {
  const existingAdmin = await storage.getUserByUsername(env.adminEmail);
  if (!existingAdmin) {
    console.log("Seeding initial Admin user...");
    const hashedPassword = await bcrypt.hash(env.adminPassword, 10);
    await storage.createUser({
      username: env.adminEmail,
      password: hashedPassword,
      fullName: env.adminName,
      role: "ADMIN",
      isActive: true,
      mustChangePassword: false, // Initial seeded admin doesn't need to change password immediately
    });
    console.log("Admin seeded successfully.");
  }
}
