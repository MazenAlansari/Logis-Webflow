import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getAllUsers,
  createUser as createUserService,
  updateUser as updateUserService,
  resetUserPassword as resetUserPasswordService,
  getUserSafeFields,
  createUserSchema,
  updateUserSchema,
} from "../services/user.service";

/**
 * Admin Users Controllers
 * Handle HTTP requests/responses for admin user management endpoints
 */

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export async function getUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const userList = await getAllUsers();
    res.status(200).json(userList);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 */
export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate input
    const validated = createUserSchema.parse(req.body);
    
    // Create user
    const { user, tempPassword } = await createUserService(validated);

    // Return safe user fields + temporary password (only time it's returned)
    res.status(201).json({
      ...getUserSafeFields(user),
      tempPassword, // IMPORTANT: Return tempPassword once in response
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    if (error instanceof Error && error.message === "User with this email already exists") {
      return res.status(409).json({
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * PATCH /api/admin/users/:id
 * Update user (admin only)
 */
export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id;
    const currentUserId = req.user!.id;

    // Validate input
    const validated = updateUserSchema.parse(req.body);

    // Update user
    const updatedUser = await updateUserService(userId, validated, currentUserId);

    res.status(200).json(getUserSafeFields(updatedUser));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === "You cannot deactivate your own account") {
        return res.status(400).json({ message: error.message });
      }
    }
    next(error);
  }
}

/**
 * POST /api/admin/users/:id/reset-password
 * Reset user password (admin only)
 */
export async function resetUserPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id;
    const result = await resetUserPasswordService(userId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}
