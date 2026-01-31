import { z } from "zod";
import { insertUserSchema, users, loginSchema, changePasswordSchema, organizations, contacts } from "./schema";
import { createPaginatedResponseSchema, paginationMetaSchema } from "./types/pagination";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: loginSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },
    user: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    changePassword: {
      method: "POST" as const,
      path: "/api/change-password",
      input: changePasswordSchema,
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    verifyEmail: {
      method: "POST" as const,
      path: "/api/auth/verify-email",
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        400: errorSchemas.validation,
      },
    },
    resendVerificationEmail: {
      method: "POST" as const,
      path: "/api/auth/resend-verification-email",
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    loginMobile: {
      method: "POST" as const,
      path: "/api/auth/login-mobile",
      input: loginSchema,
      responses: {
        200: z.object({
          token: z.string(),
          user: z.custom<typeof users.$inferSelect>(),
        }),
        401: errorSchemas.unauthorized,
        500: errorSchemas.internal,
      },
    },
    logoutMobile: {
      method: "POST" as const,
      path: "/api/auth/logout-mobile",
      responses: {
        200: z.object({
          message: z.string(),
        }),
        400: errorSchemas.validation,
      },
    },
  },
  driver: {
    profile: {
      method: "GET" as const,
      path: "/api/driver/profile",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    users: {
      list: {
        method: "GET" as const,
        path: "/api/admin/users",
        responses: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              username: z.string(),
              fullName: z.string(),
              role: z.enum(["ADMIN", "DRIVER"]),
              isActive: z.boolean(),
              mustChangePassword: z.boolean(),
              emailVerified: z.boolean(),
              lastLoginAt: z.coerce.date().nullable(),
              createdAt: z.coerce.date(),
            })
          ),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
        },
      },
      listPaginated: {
        method: "GET" as const,
        path: "/api/admin/users/paginated",
        responses: {
          200: createPaginatedResponseSchema(
            z.object({
              id: z.string().uuid(),
              username: z.string(),
              fullName: z.string(),
              role: z.enum(["ADMIN", "DRIVER"]),
              isActive: z.boolean(),
              mustChangePassword: z.boolean(),
              emailVerified: z.boolean(),
              lastLoginAt: z.coerce.date().nullable(),
              createdAt: z.coerce.date(),
            })
          ),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/users",
        input: z.object({
          email: z.string().email(),
          fullName: z.string().min(2),
          role: z.enum(["ADMIN", "DRIVER"]).default("DRIVER"),
          isActive: z.boolean().default(true),
        }),
        responses: {
          201: z.object({
            id: z.string().uuid(),
            username: z.string(),
            fullName: z.string(),
            role: z.enum(["ADMIN", "DRIVER"]),
            isActive: z.boolean(),
            mustChangePassword: z.boolean(),
            emailVerified: z.boolean(),
            lastLoginAt: z.coerce.date().nullable(),
            createdAt: z.coerce.date(),
            tempPassword: z.string(),
          }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          409: z.object({ message: z.string() }),
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/admin/users/:id",
        input: z.object({
          fullName: z.string().min(2).optional(),
          role: z.enum(["ADMIN", "DRIVER"]).optional(),
          isActive: z.boolean().optional(),
          email: z.string().email().optional(),
        }),
        responses: {
          200: z.object({
            id: z.string().uuid(),
            username: z.string(),
            fullName: z.string(),
            role: z.enum(["ADMIN", "DRIVER"]),
            isActive: z.boolean(),
              mustChangePassword: z.boolean(),
              emailVerified: z.boolean(),
              lastLoginAt: z.coerce.date().nullable(),
              createdAt: z.coerce.date(),
            }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
      resetPassword: {
        method: "POST" as const,
        path: "/api/admin/users/:id/reset-password",
        responses: {
          200: z.object({
            userId: z.string().uuid(),
            tempPassword: z.string(),
          }),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
    },
    partners: {
      list: {
        method: "GET" as const,
        path: "/api/admin/partners",
        responses: {
          200: z.array(z.custom<typeof organizations.$inferSelect>()),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
        },
      },
      listPaginated: {
        method: "GET" as const,
        path: "/api/admin/partners/paginated",
        responses: {
          200: createPaginatedResponseSchema(
            z.custom<typeof organizations.$inferSelect>()
          ),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
        },
      },
      get: {
        method: "GET" as const,
        path: "/api/admin/partners/:id",
        responses: {
          200: z.custom<typeof organizations.$inferSelect>(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/partners",
        input: z.object({
          nameEn: z.string().min(1),
          nameAr: z.string().min(1),
          taxId: z.string().optional(),
          registrationNumber: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional().or(z.literal("")),
          notes: z.string().optional(),
        }),
        responses: {
          201: z.custom<typeof organizations.$inferSelect>(),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/admin/partners/:id",
        input: z.object({
          nameEn: z.string().min(1).optional(),
          nameAr: z.string().min(1).optional(),
          taxId: z.string().optional(),
          registrationNumber: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional().or(z.literal("")),
          notes: z.string().optional(),
        }),
        responses: {
          200: z.custom<typeof organizations.$inferSelect>(),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
      activate: {
        method: "PATCH" as const,
        path: "/api/admin/partners/:id/activate",
        responses: {
          200: z.custom<typeof organizations.$inferSelect>(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
      deactivate: {
        method: "PATCH" as const,
        path: "/api/admin/partners/:id/deactivate",
        responses: {
          200: z.custom<typeof organizations.$inferSelect>(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/admin/partners/:id",
        responses: {
          200: z.object({ message: z.string() }),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
    },
    company: {
      get: {
        method: "GET" as const,
        path: "/api/admin/company",
        responses: {
          200: z.custom<typeof organizations.$inferSelect>(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/company",
        input: z.object({
          nameEn: z.string().min(1),
          nameAr: z.string().min(1),
          taxId: z.string().optional(),
          registrationNumber: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional().or(z.literal("")),
          notes: z.string().optional(),
        }),
        responses: {
          201: z.custom<typeof organizations.$inferSelect>(),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          409: errorSchemas.conflict,
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/admin/company",
        input: z.object({
          nameEn: z.string().min(1).optional(),
          nameAr: z.string().min(1).optional(),
          taxId: z.string().optional(),
          registrationNumber: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional().or(z.literal("")),
          notes: z.string().optional(),
        }),
        responses: {
          200: z.custom<typeof organizations.$inferSelect>(),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
    },
    contacts: {
      listPaginated: {
        method: "GET" as const,
        path: "/api/admin/contacts/paginated",
        responses: {
          200: createPaginatedResponseSchema(
            z.custom<typeof contacts.$inferSelect>()
          ),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
        },
      },
      get: {
        method: "GET" as const,
        path: "/api/admin/contacts/:id",
        responses: {
          200: z.custom<typeof contacts.$inferSelect>(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/contacts",
        input: z.object({
          organizationId: z.string().uuid(),
          userId: z.string().uuid().optional(),
          nameEn: z.string().min(1),
          nameAr: z.string().min(1),
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
          email: z.string().email().optional().or(z.literal("")),
          nationality: z.string().optional(),
          notes: z.string().optional(),
        }),
        responses: {
          201: z.custom<typeof contacts.$inferSelect>(),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/admin/contacts/:id",
        input: z.object({
          organizationId: z.string().uuid().optional(),
          userId: z.string().uuid().optional().nullable(),
          nameEn: z.string().min(1).optional(),
          nameAr: z.string().min(1).optional(),
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
          email: z.string().email().optional().or(z.literal("")),
          nationality: z.string().optional(),
          notes: z.string().optional(),
        }),
        responses: {
          200: z.custom<typeof contacts.$inferSelect>(),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
      activate: {
        method: "PATCH" as const,
        path: "/api/admin/contacts/:id/activate",
        responses: {
          200: z.custom<typeof contacts.$inferSelect>(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
      deactivate: {
        method: "PATCH" as const,
        path: "/api/admin/contacts/:id/deactivate",
        responses: {
          200: z.custom<typeof contacts.$inferSelect>(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
    },
    notifications: {
      sendWelcome: {
        method: "POST" as const,
        path: "/api/admin/notifications/send-welcome",
        input: z.object({
          userId: z.string().uuid(),
          tempPassword: z.string().min(1),
        }),
        responses: {
          200: z.object({
            ok: z.boolean(),
          }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
          500: errorSchemas.internal,
        },
      },
    },
  },
};

// Required helper
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
