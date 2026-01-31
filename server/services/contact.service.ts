import { db } from "../config/database";
import {
  contacts,
  organizations,
  ContactType,
  OrganizationType,
  users,
} from "@shared/schema";
import { eq, desc, asc, count, and, or, like } from "drizzle-orm";
import { z } from "zod";
import type { PaginatedResponse } from "@shared/types/pagination";
import { buildPaginationMeta, getOffset } from "../utils/pagination";

/**
 * Contact Service
 * Business logic for contact management operations
 * Handles contacts for both COMPANY and PARTNER organizations
 */

// Validation schemas
export const createContactSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  userId: z.string().uuid("Invalid user ID").optional(),
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  contactType: z.enum([
    "DRIVER",
    "STAFF",
    "MANAGER",
    "CUSTOMER_SERVICE",
    "SALES",
    "ACCOUNTANT",
    "OTHER",
  ]),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  nationality: z.string().optional(),
  notes: z.string().optional(),
});

export const updateContactSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID").optional(),
  userId: z.string().uuid("Invalid user ID").optional().nullable(),
  nameEn: z.string().min(1, "English name is required").optional(),
  nameAr: z.string().min(1, "Arabic name is required").optional(),
  contactType: z
    .enum([
      "DRIVER",
      "STAFF",
      "MANAGER",
      "CUSTOMER_SERVICE",
      "SALES",
      "ACCOUNTANT",
      "OTHER",
    ])
    .optional(),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  nationality: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

export type CreateContactRequest = z.infer<typeof createContactSchema>;
export type UpdateContactRequest = z.infer<typeof updateContactSchema>;

/**
 * Get contacts with pagination
 * Supports filtering by organization type, contact type, and search
 */
export async function getContactsPaginated(params: {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
  organizationType?: "COMPANY" | "PARTNER";
  contactType?: string;
  search?: string;
}): Promise<PaginatedResponse<typeof contacts.$inferSelect & { organization: typeof organizations.$inferSelect }>> {
  const {
    page,
    limit,
    sortBy = "nameEn",
    sortOrder = "asc",
    organizationType,
    contactType,
    search,
  } = params;
  const offset = getOffset(page, limit);

  // Build where conditions
  const conditions = [];

  // Filter by organization type
  if (organizationType) {
    conditions.push(eq(organizations.type, organizationType));
  }

  // Filter by contact type
  if (contactType) {
    conditions.push(eq(contacts.contactType, contactType as any));
  }

  // Search by name (English or Arabic)
  if (search) {
    conditions.push(
      or(
        like(contacts.nameEn, `%${search}%`),
        like(contacts.nameAr, `%${search}%`)
      )!
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const totalResult = await db
    .select({ count: count() })
    .from(contacts)
    .innerJoin(organizations, eq(contacts.organizationId, organizations.id))
    .where(whereClause);
  const total = totalResult[0]?.count || 0;

  // Build sorting
  let orderByClause;
  const sortField =
    sortBy === "nameAr"
      ? contacts.nameAr
      : sortBy === "contactType"
        ? contacts.contactType
        : sortBy === "mobile"
          ? contacts.mobile
          : contacts.nameEn;
  orderByClause = sortOrder === "asc" ? asc(sortField) : desc(sortField);

  // Get paginated data with organization join
  const data = await db
    .select({
      contact: contacts,
      organization: organizations,
    })
    .from(contacts)
    .innerJoin(organizations, eq(contacts.organizationId, organizations.id))
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // Transform to include organization in contact object
  const transformedData = data.map((item) => ({
    ...item.contact,
    organization: item.organization,
  }));

  return {
    data: transformedData as any,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

/**
 * Get contact by ID
 * Includes organization data
 */
export async function getContactById(id: string) {
  const result = await db
    .select({
      contact: contacts,
      organization: organizations,
    })
    .from(contacts)
    .innerJoin(organizations, eq(contacts.organizationId, organizations.id))
    .where(eq(contacts.id, id))
    .limit(1);

  if (result.length === 0) {
    throw new Error("Contact not found");
  }

  return {
    ...result[0].contact,
    organization: result[0].organization,
  };
}

/**
 * Validate organization exists and is active
 */
async function validateOrganization(organizationId: string) {
  const org = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (org.length === 0) {
    throw new Error("Organization not found");
  }

  if (!org[0].isActive) {
    throw new Error("Organization is not active");
  }

  return org[0];
}

/**
 * Validate user exists and doesn't have another contact (if userId provided)
 */
async function validateUser(userId: string | undefined) {
  if (!userId) return;

  // Check if user exists
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    throw new Error("User not found");
  }

  // Check if user already has a contact
  const existingContact = await db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, userId))
    .limit(1);

  if (existingContact.length > 0) {
    throw new Error("User already has a contact linked");
  }
}

/**
 * Create a new contact
 */
export async function createContact(data: CreateContactRequest) {
  // Validate input
  const validatedData = createContactSchema.parse(data);

  // Validate organization
  await validateOrganization(validatedData.organizationId);

  // Validate user (if provided)
  await validateUser(validatedData.userId);

  // Create contact
  const newContact = await db
    .insert(contacts)
    .values({
      organizationId: validatedData.organizationId,
      userId: validatedData.userId || null,
      nameEn: validatedData.nameEn,
      nameAr: validatedData.nameAr,
      contactType: validatedData.contactType as any,
      mobile: validatedData.mobile || null,
      email: validatedData.email || null,
      nationality: validatedData.nationality || null,
      notes: validatedData.notes || null,
      isActive: true,
    })
    .returning();

  return newContact[0];
}

/**
 * Update contact
 */
export async function updateContact(id: string, data: UpdateContactRequest) {
  // Verify contact exists
  const existingContact = await getContactById(id);

  // Validate input
  const validatedData = updateContactSchema.parse(data);

  // Validate organization if changed
  if (validatedData.organizationId) {
    await validateOrganization(validatedData.organizationId);
  }

  // Validate user if changed (and not null)
  if (validatedData.userId !== undefined) {
    if (validatedData.userId === null) {
      // Unlinking user - allowed
    } else if (validatedData.userId !== existingContact.userId) {
      // Changing user - validate new user doesn't have contact
      await validateUser(validatedData.userId);
    }
  }

  // Prepare update data
  const updateData: Partial<typeof contacts.$inferInsert> = {
    ...(validatedData.organizationId && {
      organizationId: validatedData.organizationId,
    }),
    ...(validatedData.userId !== undefined && {
      userId: validatedData.userId,
    }),
    ...(validatedData.nameEn && { nameEn: validatedData.nameEn }),
    ...(validatedData.nameAr && { nameAr: validatedData.nameAr }),
    ...(validatedData.contactType && {
      contactType: validatedData.contactType as any,
    }),
    ...(validatedData.mobile !== undefined && {
      mobile: validatedData.mobile || null,
    }),
    ...(validatedData.email !== undefined && {
      email: validatedData.email || null,
    }),
    ...(validatedData.nationality !== undefined && {
      nationality: validatedData.nationality || null,
    }),
    ...(validatedData.notes !== undefined && {
      notes: validatedData.notes || null,
    }),
  };

  // Update contact
  const updated = await db
    .update(contacts)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, id))
    .returning();

  if (updated.length === 0) {
    throw new Error("Contact not found");
  }

  return updated[0];
}

/**
 * Activate contact (set isActive = true)
 */
export async function activateContact(id: string) {
  const contact = await getContactById(id);

  const updated = await db
    .update(contacts)
    .set({
      isActive: true,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, id))
    .returning();

  return updated[0];
}

/**
 * Deactivate contact (soft delete - set isActive = false)
 */
export async function deactivateContact(id: string) {
  const contact = await getContactById(id);

  const updated = await db
    .update(contacts)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, id))
    .returning();

  return updated[0];
}
