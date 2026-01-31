import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getContactsPaginated,
  getContactById,
  createContact,
  updateContact,
  activateContact,
  deactivateContact,
  createContactSchema,
  updateContactSchema,
} from "../services/contact.service";
import { parsePaginationParams } from "../utils/pagination";

/**
 * Contact Controllers
 * Handle HTTP requests/responses for contact management endpoints
 * Admin only - handles contacts for both COMPANY and PARTNER organizations
 */

/**
 * GET /api/admin/contacts/paginated
 * List contacts with pagination (admin only)
 */
export async function getContactsPaginatedController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = parsePaginationParams(req);
    
    // Get optional filters from query
    const organizationType = req.query.organizationType as
      | "COMPANY"
      | "PARTNER"
      | undefined;
    const contactType = req.query.contactType as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await getContactsPaginated({
      ...params,
      organizationType,
      contactType,
      search,
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid pagination parameters",
        errors: error.errors,
      });
    }
    next(error);
  }
}

/**
 * GET /api/admin/contacts/:id
 * Get contact by ID (admin only)
 */
export async function getContactController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const contact = await getContactById(id);
    res.status(200).json(contact);
  } catch (error) {
    if (error instanceof Error && error.message === "Contact not found") {
      return res.status(404).json({
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * POST /api/admin/contacts
 * Create a new contact (admin only)
 */
export async function createContactController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate input
    const validated = createContactSchema.parse(req.body);

    // Create contact
    const newContact = await createContact(validated);

    res.status(201).json(newContact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    if (
      error instanceof Error &&
      (error.message === "Organization not found" ||
        error.message === "Organization is not active" ||
        error.message === "User not found" ||
        error.message === "User already has a contact linked")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * PATCH /api/admin/contacts/:id
 * Update contact (admin only)
 */
export async function updateContactController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    // Validate input
    const validated = updateContactSchema.parse(req.body);

    // Update contact
    const updated = await updateContact(id, validated);

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    if (
      error instanceof Error &&
      (error.message === "Contact not found" ||
        error.message === "Organization not found" ||
        error.message === "Organization is not active" ||
        error.message === "User not found" ||
        error.message === "User already has a contact linked")
    ) {
      const statusCode =
        error.message === "Contact not found" ? 404 : 400;
      return res.status(statusCode).json({
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * PATCH /api/admin/contacts/:id/activate
 * Activate contact (set isActive = true) (admin only)
 */
export async function activateContactController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const contact = await activateContact(id);
    res.status(200).json(contact);
  } catch (error) {
    if (error instanceof Error && error.message === "Contact not found") {
      return res.status(404).json({
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * PATCH /api/admin/contacts/:id/deactivate
 * Deactivate contact (soft delete - set isActive = false) (admin only)
 */
export async function deactivateContactController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const contact = await deactivateContact(id);
    res.status(200).json(contact);
  } catch (error) {
    if (error instanceof Error && error.message === "Contact not found") {
      return res.status(404).json({
        message: error.message,
      });
    }
    next(error);
  }
}
