import { z } from "zod";
import { insertUserSchema, users, loginSchema, changePasswordSchema } from "./schema";

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
              lastLoginAt: z.date().nullable(),
              createdAt: z.date(),
            })
          ),
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
            lastLoginAt: z.date().nullable(),
            createdAt: z.date(),
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
        }),
        responses: {
          200: z.object({
            id: z.string().uuid(),
            username: z.string(),
            fullName: z.string(),
            role: z.enum(["ADMIN", "DRIVER"]),
            isActive: z.boolean(),
            mustChangePassword: z.boolean(),
            lastLoginAt: z.date().nullable(),
            createdAt: z.date(),
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
