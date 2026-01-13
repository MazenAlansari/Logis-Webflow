/**
 * Environment configuration
 * Centralized access to environment variables with defaults
 */

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  adminEmail: process.env.ADMIN_EMAIL || "admin@logistics.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  adminName: process.env.ADMIN_NAME || "System Admin",
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv() {
  if (!env.databaseUrl) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  if (env.nodeEnv === "production" && !env.sessionSecret) {
    throw new Error(
      "SESSION_SECRET must be set in production environment. " +
      "Please set SESSION_SECRET environment variable."
    );
  }
}
