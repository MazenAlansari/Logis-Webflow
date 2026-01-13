import session from "express-session";
import { Express } from "express";
import { storage } from "../storage";

/**
 * Get session configuration
 * Validates SESSION_SECRET in production and returns secure session settings
 */
export function getSessionConfig(app: Express): session.SessionOptions {
  // SECURITY HARDENING: Session secret validation
  // In production, SESSION_SECRET must be explicitly set
  const sessionSecret = process.env.SESSION_SECRET;
  if (app.get("env") === "production" && !sessionSecret) {
    throw new Error(
      "SESSION_SECRET must be set in production environment. " +
      "Please set SESSION_SECRET environment variable."
    );
  }

  // SECURITY HARDENING: Strengthened session cookie settings
  // - httpOnly: true - Prevents XSS attacks by preventing JavaScript access to cookies
  // - sameSite: 'lax' - Provides CSRF protection while allowing normal navigation
  // - secure: true in production - Ensures cookies only sent over HTTPS
  return {
    secret: sessionSecret || "replit_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // SECURITY: Prevent XSS access to cookie
      sameSite: "lax", // SECURITY: CSRF protection
      secure: app.get("env") === "production", // SECURITY: HTTPS only in production
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
    store: storage.sessionStore,
  };
}
