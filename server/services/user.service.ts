import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { db } from "../config/database";
import { users } from "@shared/schema";
import { eq, desc, asc, count, sql } from "drizzle-orm";
import { z } from "zod";
import { generateAndSendVerificationToken } from "./emailVerification.service";
import type { PaginatedResponse } from "@shared/types/pagination";
import { buildPaginationMeta, getOffset } from "../utils/pagination";

/**
 * User Service
 * Business logic for user management operations
 */

// Validation schemas
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["ADMIN", "DRIVER"]).default("DRIVER"),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  role: z.enum(["ADMIN", "DRIVER"]).optional(),
  isActive: z.boolean().optional(),
  email: z.string().email("Invalid email address").optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

/**
 * Generate a secure temporary password
 * 12 characters, mix of letters and numbers, no ambiguous characters
 */
export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Get all users (safe fields only)
 */
export async function getAllUsers() {
  return db.select({
    id: users.id,
    username: users.username,
    fullName: users.fullName,
    role: users.role,
    isActive: users.isActive,
    mustChangePassword: users.mustChangePassword,
    emailVerified: users.emailVerified,
    lastLoginAt: users.lastLoginAt,
    createdAt: users.createdAt,
  })
    .from(users)
    .orderBy(desc(users.createdAt));
}

/**
 * Get users with pagination
 * Supports search by fullName (client-side filtering for now, but structured for server-side)
 */
export async function getUsersPaginated(params: {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
}): Promise<PaginatedResponse<{
  id: string;
  username: string;
  fullName: string;
  role: "ADMIN" | "DRIVER";
  isActive: boolean;
  mustChangePassword: boolean;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}>> {
  const { page, limit, sortBy = "createdAt", sortOrder } = params;
  const offset = getOffset(page, limit);

  // Base query for user fields
  const userFields = {
    id: users.id,
    username: users.username,
    fullName: users.fullName,
    role: users.role,
    isActive: users.isActive,
    mustChangePassword: users.mustChangePassword,
    emailVerified: users.emailVerified,
    lastLoginAt: users.lastLoginAt,
    createdAt: users.createdAt,
  };

  // Get total count
  const totalResult = await db.select({ count: count() }).from(users);
  const total = totalResult[0]?.count || 0;

  // Build sorting (default to createdAt desc)
  let orderByClause;
  const sortField = sortBy === "fullName" ? users.fullName : users.createdAt;
  orderByClause = sortOrder === "asc" ? asc(sortField) : desc(sortField);

  // Get paginated data
  const data = await db
    .select(userFields)
    .from(users)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  return {
    data,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

/**
 * Create a new user
 * Returns user with temporary password
 */
export async function createUser(data: CreateUserRequest) {
  // Check if email already exists
  const existingUser = await storage.getUserByUsername(data.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Generate secure temporary password
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Create user (emailVerified defaults to false)
  const newUser = await storage.createUser({
    username: data.email,
    password: hashedPassword,
    fullName: data.fullName,
    role: data.role || "DRIVER",
    isActive: data.isActive !== undefined ? data.isActive : true,
    mustChangePassword: true, // Always require password change on creation
    emailVerified: false, // Email must be verified
  });

  // Generate and send verification token (non-blocking)
  try {
    await generateAndSendVerificationToken(newUser);
  } catch (error) {
    // Log error but don't fail user creation
    // Token can be sent later via resend endpoint
    console.error(
      `[UserService] Failed to send verification email for new user ${newUser.id}:`,
      error
    );
  }

  return {
    user: newUser,
    tempPassword,
  };
}

/**
 * Update user
 */
export async function updateUser(userId: string, data: UpdateUserRequest, currentUserId: string) {
  // Check if user exists
  const userToUpdate = await storage.getUser(userId);
  if (!userToUpdate) {
    throw new Error("User not found");
  }

  // Prevent admin from deactivating themselves
  if (currentUserId === userId && data.isActive === false) {
    throw new Error("You cannot deactivate your own account");
  }

  // Prevent admin from editing their own email (to avoid lockout)
  if (currentUserId === userId && data.email) {
    throw new Error("You cannot change your own email address");
  }

  // Check email uniqueness if email is being updated
  if (data.email && data.email !== userToUpdate.username) {
    const existingUser = await storage.getUserByUsername(data.email);
    if (existingUser && existingUser.id !== userId) {
      throw new Error("User with this email already exists");
    }
  }

  // Update user
  const updateData: any = {
    ...(data.fullName && { fullName: data.fullName }),
    ...(data.role && { role: data.role }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
    ...(data.email && { username: data.email }),
  };

  // If email is changed, reset email verification status
  if (data.email && data.email !== userToUpdate.username) {
    updateData.emailVerified = false;
  }

  const updatedUser = await storage.updateUser(userId, updateData);

  // If email was changed, generate and send verification token
  if (data.email && data.email !== userToUpdate.username) {
    try {
      await generateAndSendVerificationToken(updatedUser);
    } catch (error) {
      // Log error but don't fail update
      console.error(
        `[UserService] Failed to send verification email for user ${updatedUser.id}:`,
        error
      );
    }
  }

  return updatedUser;
}

/**
 * Reset user password
 * Returns new temporary password
 */
export async function resetUserPassword(userId: string) {
  // Check if user exists
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Generate new temporary password
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Update user password and require change
  await storage.updateUser(userId, {
    password: hashedPassword,
    mustChangePassword: true,
  });

  return {
    userId: user.id,
    tempPassword,
  };
}

/**
 * Get safe user fields (excluding password hash)
 */
export function getUserSafeFields(user: typeof users.$inferSelect) {
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
