import { z } from "zod";
import { insertUserSchema, users, loginSchema, changePasswordSchema } from "./schema";
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
