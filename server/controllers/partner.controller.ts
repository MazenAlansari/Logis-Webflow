import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getAllPartners,
  getPartnersPaginated,
  getPartnerById,
  createPartner,
  updatePartner,
  activatePartner,
  deactivatePartner,
  deletePartner,
  createPartnerSchema,
  updatePartnerSchema,
} from "../services/partner.service";
import { parsePaginationParams } from "../utils/pagination";

/**
 * Partner Controllers
 * Handle HTTP requests/responses for partner management endpoints
 * Admin only - handles PARTNER type organizations
 */

/**
 * GET /api/admin/partners
 * List all partners (admin only)
 */
export async function getPartners(_req: Request, res: Response, next: NextFunction) {
  try {
    const partners = await getAllPartners();
    res.status(200).json(partners);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/partners/paginated
 * List partners with pagination (admin only)
 */
export async function getPartnersPaginatedController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const params = parsePaginationParams(req);
    const result = await getPartnersPaginated(params);
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
 * GET /api/admin/partners/:id
 * Get partner by ID (admin only)
 */
export async function getPartner(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const partner = await getPartnerById(id);
    res.status(200).json(partner);
  } catch (error) {
    if (error instanceof Error && error.message === "Partner not found") {
      return res.status(404).json({
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * POST /api/admin/partners
 * Create a new partner (admin only)
 */
export async function createPartnerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate input
    const validated = createPartnerSchema.parse(req.body);

    // Create partner
    const newPartner = await createPartner(validated);

    res.status(201).json(newPartner);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    next(error);
  }
}

/**
 * PATCH /api/admin/partners/:id
 * Update partner (admin only)
 */
export async function updatePartnerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    // Validate input
    const validated = updatePartnerSchema.parse(req.body);

    // Update partner
    const updated = await updatePartner(id, validated);

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    if (error instanceof Error && error.message === "Partner not found") {
      return res.status(404).json({
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * PATCH /api/admin/partners/:id/activate
 * Activate partner (set isActive = true) (admin only)
 */
export async function activatePartnerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const partner = await activatePartner(id);
    res.status(200).json(partner);
  } catch (error) {
    if (error instanceof Error && error.message === "Partner not found") {
      return res.status(404).json({
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * PATCH /api/admin/partners/:id/deactivate
 * Deactivate partner (soft delete - set isActive = false) (admin only)
 */
export async function deactivatePartnerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const partner = await deactivatePartner(id);
    res.status(200).json(partner);
  } catch (error) {
    if (error instanceof Error && error.message === "Partner not found") {
      return res.status(404).json({
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * DELETE /api/admin/partners/:id
 * Delete partner (hard delete - permanent removal) (admin only)
 */
export async function deletePartnerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    await deletePartner(id);
    res.status(200).json({ message: "Partner deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "Partner not found") {
      return res.status(404).json({
        message: error.message,
      });
    }
    next(error);
  }
}
