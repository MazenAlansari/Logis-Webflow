import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getCompany,
  createCompany,
  updateCompany,
  createCompanySchema,
  updateCompanySchema,
} from "../services/company.service";

/**
 * Company Controllers
 * Handle HTTP requests/responses for company management endpoints
 * Admin only - handles COMPANY type organization (only one company)
 */

/**
 * GET /api/admin/company
 * Get company info (admin only)
 */
export async function getCompanyController(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const company = await getCompany();
    
    if (!company) {
      return res.status(404).json({
        message: "Company not found. Please create the company first.",
      });
    }

    res.status(200).json(company);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/company
 * Create company (admin only)
 * Only succeeds if no company exists yet
 */
export async function createCompanyController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate input
    const validated = createCompanySchema.parse(req.body);

    // Create company
    const newCompany = await createCompany(validated);

    res.status(201).json(newCompany);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    if (error instanceof Error && error.message === "Company already exists. Use update instead.") {
      return res.status(409).json({
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * PATCH /api/admin/company
 * Update company (admin only)
 */
export async function updateCompanyController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate input
    const validated = updateCompanySchema.parse(req.body);

    // Update company
    const updated = await updateCompany(validated);

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    if (error instanceof Error && error.message === "Company not found. Create company first.") {
      return res.status(404).json({
        message: error.message,
      });
    }
    next(error);
  }
}
