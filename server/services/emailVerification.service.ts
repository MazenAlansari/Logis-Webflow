/**
 * Email Verification Service
 * Handles email verification token generation, validation, and email sending
 */

import { db } from "../config/database";
import { emailVerificationTokens, users, type User } from "@shared/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { generateVerificationToken, getTokenExpiration } from "../utils/tokenGenerator";
import { triggerWorkflow } from "./novuEmail.service";
import { env } from "../config/env";

/**
 * Generate and store email verification token for a user
 * Sends verification email via Novu
 */
export async function generateAndSendVerificationToken(user: User): Promise<void> {
  // Delete any existing unverified tokens for this user
  await db
    .delete(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.userId, user.id),
        isNull(emailVerificationTokens.verifiedAt) // unverified tokens have null verifiedAt
      )
    );

  // Generate new token
  const token = generateVerificationToken();
  const expiresAt = getTokenExpiration(24); // 24 hours expiration

  // Store token in database
  await db.insert(emailVerificationTokens).values({
    userId: user.id,
    token,
    expiresAt,
  });

  // Send verification email via Novu
  const verificationUrl = `${env.appLoginUrl.replace("/login", "")}/verify-email?token=${token}`;
  
  const payload = {
    fullName: user.fullName,
    email: user.username,
    verificationUrl,
    token, // Also include token for manual entry fallback
    expiresInHours: 24,
  };

  try {
    await triggerWorkflow(
      "verify-email",
      user,
      payload,
      `email-verification-${user.id}-${Date.now()}`
    );
  } catch (error) {
    // Log error but don't fail token generation
    // Token is still stored, admin can resend email later
    console.error(
      `[EmailVerification] Failed to send verification email for user ${user.id}:`,
      error
    );
  }
}

/**
 * Verify email using token
 * Returns true if verification successful, false otherwise
 */
export async function verifyEmailToken(token: string): Promise<{
  success: boolean;
  userId?: string;
  message: string;
}> {
  // Find token that is not yet verified and not expired
  const [tokenRecord] = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.token, token),
        isNull(emailVerificationTokens.verifiedAt),
        gt(emailVerificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!tokenRecord) {
    return {
      success: false,
      message: "Invalid or expired verification token",
    };
  }

  // Mark token as verified
  await db
    .update(emailVerificationTokens)
    .set({ verifiedAt: new Date() })
    .where(eq(emailVerificationTokens.id, tokenRecord.id));

  // Update user emailVerified status
  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, tokenRecord.userId));

  return {
    success: true,
    userId: tokenRecord.userId,
    message: "Email verified successfully",
  };
}

/**
 * Check if user can request resend (rate limit: max 3 per hour)
 */
export async function canResendVerificationEmail(userId: string): Promise<{
  allowed: boolean;
  message?: string;
}> {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  // Count tokens created in the last hour
  const recentTokens = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.userId, userId),
        gt(emailVerificationTokens.createdAt, oneHourAgo)
      )
    );

  if (recentTokens.length >= 3) {
    return {
      allowed: false,
      message: "Too many verification emails sent. Please wait before requesting another.",
    };
  }

  return { allowed: true };
}

/**
 * Resend verification email (with rate limiting)
 */
export async function resendVerificationEmail(userId: string): Promise<{
  success: boolean;
  message: string;
}> {
  // Check rate limit
  const rateLimitCheck = await canResendVerificationEmail(userId);
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      message: rateLimitCheck.message!,
    };
  }

  // Get user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  if (user.emailVerified) {
    return {
      success: false,
      message: "Email is already verified",
    };
  }

  // Generate and send new token
  await generateAndSendVerificationToken(user);

  return {
    success: true,
    message: "Verification email sent successfully",
  };
}

