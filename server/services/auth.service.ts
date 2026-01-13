import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { toSafeUser } from "../utils/safeUser";
import type { User } from "@shared/schema";

/**
 * Authentication Service
 * Business logic for authentication operations
 */

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Verify user password
 */
export async function verifyPassword(
  userId: string,
  password: string
): Promise<boolean> {
  const user = await storage.getUser(userId);
  if (!user) {
    return false;
  }
  return bcrypt.compare(password, user.password);
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  data: ChangePasswordRequest
): Promise<void> {
  // Verify current password
  const isValid = await verifyPassword(userId, data.currentPassword);
  if (!isValid) {
    throw new Error("Incorrect current password");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  await storage.updateUser(userId, {
    password: hashedPassword,
    mustChangePassword: false,
  });
}

/**
 * Get safe user object (without password)
 */
export function getSafeUser(user: User) {
  return toSafeUser(user);
}
