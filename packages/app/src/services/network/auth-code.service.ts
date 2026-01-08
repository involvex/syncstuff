interface AuthCode {
  code: string;
  deviceId: string;
  expiresAt: Date;
  used: boolean;
}

class AuthCodeService {
  private activeCodes: Map<string, AuthCode> = new Map();
  private readonly CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval when service is initialized
    this.startCleanupInterval();
  }

  /**
   * Generate a secure 6-digit pairing code
   */
  generateCode(deviceId: string): { code: string; expiresAt: Date } {
    // Generate cryptographically secure 6-digit code
    const code = this.generateSecureCode();
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MS);

    const authCode: AuthCode = {
      code,
      deviceId,
      expiresAt,
      used: false,
    };

    this.activeCodes.set(code, authCode);

    console.log(
      `Auth code generated: ${code} for device ${deviceId}, expires at ${expiresAt.toISOString()}`,
    );
    return { code, expiresAt };
  }

  /**
   * Validate a pairing code and mark it as used
   */
  async validateCode(
    code: string,
    pairingDeviceId: string,
  ): Promise<{ valid: boolean; deviceId?: string; reason?: string }> {
    const authCode = this.activeCodes.get(code);

    if (!authCode) {
      return { valid: false, reason: "Code not found" };
    }

    if (authCode.used) {
      return { valid: false, reason: "Code already used" };
    }

    if (new Date() > authCode.expiresAt) {
      this.activeCodes.delete(code);
      return { valid: false, reason: "Code expired" };
    }

    // Mark as used
    authCode.used = true;

    console.log(
      `Auth code ${code} validated for device ${pairingDeviceId} to pair with ${authCode.deviceId}`,
    );

    return { valid: true, deviceId: authCode.deviceId };
  }

  /**
   * Get time remaining for a code in seconds
   */
  getTimeRemaining(code: string): number {
    const authCode = this.activeCodes.get(code);
    if (!authCode) return 0;

    const remaining = authCode.expiresAt.getTime() - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * Clean up expired codes
   */
  cleanupExpiredCodes(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [code, authCode] of this.activeCodes.entries()) {
      if (now > authCode.expiresAt || authCode.used) {
        this.activeCodes.delete(code);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired/used auth codes`);
    }
  }

  /**
   * Start periodic cleanup of expired codes
   */
  private startCleanupInterval(): void {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCodes();
    }, 60 * 1000);
  }

  /**
   * Stop cleanup interval (for cleanup when service is destroyed)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.activeCodes.clear();
  }

  /**
   * Generate a cryptographically secure 6-digit code
   */
  private generateSecureCode(): string {
    // Use crypto API for secure random numbers
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);

    // Generate 6-digit number (100000-999999)
    const code = (randomValues[0] % 900000) + 100000;
    return code.toString();
  }
}

// Export singleton instance
export const authCodeService = new AuthCodeService();
