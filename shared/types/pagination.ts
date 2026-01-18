import { z } from "zod";

/**
 * Pagination query parameters schema
 * Used for parsing and validating query string parameters
 */
export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  // search is optional and entity-specific, so we don't include it in base schema
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

/**
 * Pagination metadata returned in API responses
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/**
 * Standard paginated response structure
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

/**
 * Pagination meta schema for Zod validation
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

/**
 * Helper to create a paginated response schema
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    pagination: paginationMetaSchema,
  });
}

