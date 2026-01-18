/**
 * Token Generator Utility
 * Generates secure random tokens for email verification
 */

import crypto from "crypto";

/**
 * Generate a secure random token for email verification
 * Returns a URL-safe base64 encoded token (32 bytes = 256 bits)
 */
export function generateVerificationToken(): string {
  // Generate 32 random bytes (256 bits)
  const randomBytes = crypto.randomBytes(32);
  // Convert to URL-safe base64 string (removes padding)
  return randomBytes.toString("base64url");
}

/**
 * Calculate expiration timestamp
 * @param hours - Number of hours until expiration (default: 24)
 */
export function getTokenExpiration(hours: number = 24): Date {
  const now = new Date();
  now.setHours(now.getHours() + hours);
  return now;
}

