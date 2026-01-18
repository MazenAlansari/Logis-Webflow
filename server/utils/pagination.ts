import type { Request } from "express";
import { paginationParamsSchema, type PaginationMeta } from "@shared/types/pagination";

/**
 * Parse and validate pagination parameters from Express request query
 */
export function parsePaginationParams(req: Request): {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
} {
  return paginationParamsSchema.parse(req.query);
}

/**
 * Calculate pagination metadata from query params and total count
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Calculate SQL OFFSET from page number and limit
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

