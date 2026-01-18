/**
 * Novu Email Service
 * Handles Novu Cloud integration for sending email notifications
 * Uses lazy subscriber identification (identify right before sending)
 */

import { Novu } from "@novu/node";
import { env } from "../config/env";
import type { User } from "@shared/schema";

let novuClient: Novu | null = null;

/**
 * Get or initialize Novu client (singleton)
 * Throws error if NOVU_API_KEY is not configured
 */
export function getNovuClient(): Novu {
  if (!env.novuApiKey) {
    throw new Error(
      "NOVU_API_KEY is not configured. " +
      "Please set NOVU_API_KEY environment variable."
    );
  }

  if (!novuClient) {
    novuClient = new Novu(env.novuApiKey);
  }

  return novuClient;
}

/**
 * Identify or update subscriber in Novu (lazy subscriber creation)
 * Must be called before every trigger
 * 
 * @param user - User object with id, username (email), and fullName
 */
export async function identifySubscriber(user: User): Promise<void> {
  const novu = getNovuClient();
  
  // Split fullName into firstName and lastName
  const nameParts = user.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || user.fullName;
  const lastName = nameParts.slice(1).join(" ") || "";

  try {
    await novu.subscribers.identify(user.id, {
      email: user.username,
      firstName,
      lastName,
    });
  } catch (error) {
    console.error("[NovuEmailService] Error identifying subscriber:", error);
    throw error;
  }
}

/**
 * Trigger a Novu workflow
 * Automatically identifies subscriber before triggering
 * 
 * @param workflowId - Novu workflow identifier (e.g., "welcome-user")
 * @param user - User object to send notification to
 * @param payload - Payload data for the workflow template
 * @param transactionId - Optional transaction ID for idempotency
 */
export async function triggerWorkflow(
  workflowId: string,
  user: User,
  payload: Record<string, any>,
  transactionId?: string
): Promise<void> {
  const novu = getNovuClient();

  // Always identify subscriber first (lazy subscriber creation)
  await identifySubscriber(user);

  try {
    const triggerPayload: any = {
      to: { subscriberId: user.id },
      payload,
    };

    if (transactionId) {
      triggerPayload.transactionId = transactionId;
    }

    await novu.trigger(workflowId, triggerPayload);
  } catch (error) {
    console.error(
      `[NovuEmailService] Error triggering workflow "${workflowId}":`,
      error
    );
    throw error;
  }
}

