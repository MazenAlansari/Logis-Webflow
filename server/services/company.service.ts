import { db } from "../config/database";
import { organizations, OrganizationType } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * Company Service
 * Business logic for company management operations
 * Note: Only handles COMPANY type organizations (only one company allowed)
 */

// Validation schemas (same as partners)
export const createCompanySchema = z.object({
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

export const updateCompanySchema = z.object({
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

export type CreateCompanyRequest = z.infer<typeof createCompanySchema>;
export type UpdateCompanyRequest = z.infer<typeof updateCompanySchema>;

/**
 * Get the company (COMPANY type only)
 * Returns null if company doesn't exist yet
 */
export async function getCompany() {
  const company = await db
    .select()
    .from(organizations)
    .where(eq(organizations.type, OrganizationType.COMPANY))
    .limit(1);

  return company.length > 0 ? company[0] : null;
}

/**
 * Create the company
 * Enforces uniqueness: only one COMPANY allowed
 * Throws error if company already exists
 */
export async function createCompany(data: CreateCompanyRequest) {
  // Check if company already exists
  const existingCompany = await getCompany();
  if (existingCompany) {
    throw new Error("Company already exists. Use update instead.");
  }

  // Validate input
  const validatedData = createCompanySchema.parse(data);

  // Create company with type = COMPANY
  const newCompany = await db
    .insert(organizations)
    .values({
      ...validatedData,
      type: OrganizationType.COMPANY,
      isActive: true, // Company is always active
      email: validatedData.email || null,
    })
    .returning();

  return newCompany[0];
}

/**
 * Update the company
 * Ensures company exists and type remains COMPANY
 */
export async function updateCompany(data: UpdateCompanyRequest) {
  // Verify company exists
  const existingCompany = await getCompany();
  if (!existingCompany) {
    throw new Error("Company not found. Create company first.");
  }

  // Validate input
  const validatedData = updateCompanySchema.parse(data);

  // Prepare update data (ensure type stays COMPANY)
  const updateData: Partial<typeof organizations.$inferInsert> = {
    ...validatedData,
    type: OrganizationType.COMPANY, // Always COMPANY
    email: validatedData.email || null,
  };

  // Update company
  const updated = await db
    .update(organizations)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, existingCompany.id))
    .returning();

  if (updated.length === 0) {
    throw new Error("Company not found");
  }

  return updated[0];
}

/**
 * Get or create company
 * Returns existing company or creates a default one
 * Useful for initialization
 */
export async function getOrCreateCompany() {
  let company = await getCompany();

  if (!company) {
    // Create default company
    company = await createCompany({
      nameEn: "My Company",
      nameAr: "شركتي",
    });
  }

  return company;
}
