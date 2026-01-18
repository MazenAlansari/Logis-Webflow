import type { User } from "@shared/schema";

/**
 * SafeUser type - User object without password hash
 * Whitelist approach to ensure we never leak sensitive fields
 */
export type SafeUser = {
  id: string;
  username: string;
  fullName: string;
  role: "ADMIN" | "DRIVER";
  isActive: boolean;
  mustChangePassword: boolean;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

/**
 * Maps a User object to SafeUser by whitelisting safe fields only.
 * This ensures password hash and any other sensitive fields are never returned.
 * 
 * SECURITY: Using whitelist approach instead of blacklist (deleting password)
 * to prevent accidental exposure of future sensitive fields.
 */
export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}