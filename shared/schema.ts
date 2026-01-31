import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Role Enum
export const UserRole = {
  ADMIN: "ADMIN",
  DRIVER: "DRIVER",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(), // email
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["ADMIN", "DRIVER"] }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  mustChangePassword: boolean("must_change_password").default(true).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"), // nullable, set when token is used
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Custom Auth Schemas
export const loginSchema = z.object({
  username: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;

// Organization Type Enum
export const OrganizationType = {
  COMPANY: "COMPANY",
  PARTNER: "PARTNER",
} as const;

export type OrganizationTypeType =
  (typeof OrganizationType)[keyof typeof OrganizationType];

// Organizations Table
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameEn: text("name_en").notNull(), // English name
  nameAr: text("name_ar").notNull(), // Arabic name
  type: text("type", { enum: ["COMPANY", "PARTNER"] }).notNull(),
  taxId: text("tax_id"), // Tax ID (nullable)
  registrationNumber: text("registration_number"), // Registration number (nullable)
  address: text("address"), // Address (nullable)
  city: text("city"), // City (nullable)
  country: text("country"), // Country (nullable)
  phone: text("phone"), // Phone (nullable)
  email: text("email"), // Email (nullable)
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"), // Notes (nullable)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  },
);

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

// Contact Type Enum
export const ContactType = {
  DRIVER: "DRIVER",
  STAFF: "STAFF",
  MANAGER: "MANAGER",
  CUSTOMER_SERVICE: "CUSTOMER_SERVICE",
  SALES: "SALES",
  ACCOUNTANT: "ACCOUNTANT",
  OTHER: "OTHER",
} as const;

export type ContactTypeType =
  (typeof ContactType)[keyof typeof ContactType];

// Contacts Table
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "set null" }), // Nullable, unique constraint handled in service
  nameEn: text("name_en").notNull(), // English name
  nameAr: text("name_ar").notNull(), // Arabic name
  contactType: text("contact_type", {
    enum: [
      "DRIVER",
      "STAFF",
      "MANAGER",
      "CUSTOMER_SERVICE",
      "SALES",
      "ACCOUNTANT",
      "OTHER",
    ],
  }).notNull(),
  mobile: text("mobile"), // Mobile (nullable)
  email: text("email"), // Email (nullable)
  nationality: text("nationality"), // Nationality (nullable)
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"), // Notes (nullable)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
