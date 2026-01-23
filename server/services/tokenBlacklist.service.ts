/**
 * Token Blacklist Service
 * Tracks invalidated JWT tokens until they expire
 * Simple in-memory implementation (for production, use Redis)
 */

class TokenBlacklist {
  private blacklistedTokens: Set<string> = new Set();

  /**
   * Add token to blacklist
   * Token remains blacklisted until its expiration time
   * (For production, store with expiration time and use Redis)
   */
  addToken(token: string) {
    this.blacklistedTokens.add(token);
  }

  /**
   * Check if token is blacklisted
   */
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Remove token from blacklist (if implementing TTL cleanup)
   * For production, use Redis with automatic expiration
   */
  removeToken(token: string) {
    this.blacklistedTokens.delete(token);
  }

  /**
   * Clear all blacklisted tokens (for testing/reset)
   */
  clear() {
    this.blacklistedTokens.clear();
  }
}

// Singleton instance
export const tokenBlacklist = new TokenBlacklist();

