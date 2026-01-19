import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { SafeUser } from "../utils/safeUser";
import { tokenBlacklist } from "./tokenBlacklist.service";

/**
 * JWT Service
 * Handles JWT token generation and verification for mobile authentication
 */

export interface JWTPayload {
  id: string;
  username: string;
  role: "ADMIN" | "DRIVER";
}

/**
 * Generate JWT token for user
 * @param user - SafeUser object (no password hash)
 * @returns JWT token string
 * @throws Error if JWT_SECRET is not configured
 */
export function generateToken(user: SafeUser): string {
  if (!env.jwtSecret) {
    throw new Error(
      "JWT_SECRET is not configured. Please set JWT_SECRET environment variable."
    );
  }

  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  // TypeScript narrowing: secret is guaranteed to be string after check above
  const secret: string = env.jwtSecret!;
  const expiresIn: string = env.jwtExpiresIn!;

  return jwt.sign(payload, secret, {
    expiresIn,
  } as jwt.SignOptions);
}

/**
 * Verify JWT token and extract payload
 * @param token - JWT token string
 * @returns Decoded JWT payload (user data)
 * @throws Error if token is invalid, expired, or JWT_SECRET is not configured
 */
export function verifyToken(token: string): JWTPayload {
  if (!env.jwtSecret) {
    throw new Error(
      "JWT_SECRET is not configured. Please set JWT_SECRET environment variable."
    );
  }

  // Check if token is blacklisted (logout/invalidated)
  if (tokenBlacklist.isBlacklisted(token)) {
    throw new Error("Token has been revoked");
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    throw new Error("Token verification failed");
  }
}

/**
 * Revoke/invalidate a JWT token (add to blacklist)
 * Used when user logs out
 */
export function revokeToken(token: string): void {
  tokenBlacklist.addToken(token);
}

