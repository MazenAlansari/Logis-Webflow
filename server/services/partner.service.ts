import { db } from "../config/database";
import { organizations, OrganizationType } from "@shared/schema";
import { eq, desc, asc, count, and } from "drizzle-orm";
import { z } from "zod";
import type { PaginatedResponse } from "@shared/types/pagination";
import { buildPaginationMeta, getOffset } from "../utils/pagination";

/**
 * Partner Service
 * Business logic for partner management operations
 * Note: Only handles PARTNER type organizations (not COMPANY)
 */

// Validation schemas
export const createPartnerSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const updatePartnerSchema = z.object({
  nameEn: z.string().min(1, "English name is required").optional(),
  nameAr: z.string().min(1, "Arabic name is required").optional(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  notes: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

export type CreatePartnerRequest = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerRequest = z.infer<typeof updatePartnerSchema>;

/**
 * Get all partners (PARTNER type only)
 * Returns all active and inactive partners
 */
export async function getAllPartners() {
  const partners = await db
    .select()
    .from(organizations)
    .where(eq(organizations.type, OrganizationType.PARTNER))
    .orderBy(asc(organizations.nameEn));

  return partners;
}

/**
 * Get partners with pagination
 * Sorted by name (nameEn) ascending by default
 */
export async function getPartnersPaginated(params: {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
}): Promise<PaginatedResponse<typeof organizations.$inferSelect>> {
  const { page, limit, sortBy = "nameEn", sortOrder = "asc" } = params;
  const offset = getOffset(page, limit);

  // Get total count (only PARTNERS)
  const totalResult = await db
    .select({ count: count() })
    .from(organizations)
    .where(eq(organizations.type, OrganizationType.PARTNER));
  const total = totalResult[0]?.count || 0;

  // Build sorting (default to nameEn asc)
  let orderByClause;
  const sortField =
    sortBy === "nameAr"
      ? organizations.nameAr
      : sortBy === "city"
        ? organizations.city
        : sortBy === "country"
          ? organizations.country
          : organizations.nameEn;
  orderByClause = sortOrder === "asc" ? asc(sortField) : desc(sortField);

  // Get paginated data (only PARTNERS)
  const data = await db
    .select()
    .from(organizations)
    .where(eq(organizations.type, OrganizationType.PARTNER))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  return {
    data,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

/**
 * Get partner by ID
 * Only returns if type is PARTNER
 */
export async function getPartnerById(id: string) {
  const partner = await db
    .select()
    .from(organizations)
    .where(
      and(
        eq(organizations.id, id),
        eq(organizations.type, OrganizationType.PARTNER)
      )
    )
    .limit(1);

  if (partner.length === 0) {
    throw new Error("Partner not found");
  }

  return partner[0];
}

/**
 * Create a new partner
 * Automatically sets type to PARTNER
 */
export async function createPartner(data: CreatePartnerRequest) {
  // Validate input
  const validatedData = createPartnerSchema.parse(data);

  // Create partner with type = PARTNER
  const newPartner = await db
    .insert(organizations)
    .values({
      ...validatedData,
      type: OrganizationType.PARTNER,
      isActive: true,
      email: validatedData.email || null,
    })
    .returning();

  return newPartner[0];
}

/**
 * Update partner
 * Ensures type remains PARTNER
 */
export async function updatePartner(id: string, data: UpdatePartnerRequest) {
  // Verify partner exists and is PARTNER type
  const existingPartner = await getPartnerById(id);

  // Validate input
  const validatedData = updatePartnerSchema.parse(data);

  // Prepare update data (ensure type stays PARTNER)
  const updateData: Partial<typeof organizations.$inferInsert> = {
    ...validatedData,
    type: OrganizationType.PARTNER, // Always PARTNER
    email: validatedData.email || null,
  };

  // Update partner
  const updated = await db
    .update(organizations)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, id))
    .returning();

  if (updated.length === 0) {
    throw new Error("Partner not found");
  }

  return updated[0];
}

/**
 * Activate partner (set isActive = true)
 */
export async function activatePartner(id: string) {
  const partner = await getPartnerById(id);

  const updated = await db
    .update(organizations)
    .set({
      isActive: true,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, id))
    .returning();

  return updated[0];
}

/**
 * Deactivate partner (soft delete - set isActive = false)
 */
export async function deactivatePartner(id: string) {
  const partner = await getPartnerById(id);

  const updated = await db
    .update(organizations)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, id))
    .returning();

  return updated[0];
}

/**
 * Delete partner (hard delete - permanent removal)
 */
export async function deletePartner(id: string) {
  const partner = await getPartnerById(id);

  await db.delete(organizations).where(eq(organizations.id, id));

  return { success: true };
}
