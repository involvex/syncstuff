/**
 * Auth Code Service
 *
 * Generates pairing codes that encode the device ID directly,
 * so they can be validated without a shared server.
 *
 * Code format: 6-digit code that maps to device ID via local storage
 * The device generating the code stores the mapping locally.
 * The device receiving the code needs to get the device info from
 * either the QR code or by manually entering the device ID.
 */

interface AuthCode {
  code: string;
  deviceId: string;
  deviceName: string;
  expiresAt: Date;
  used: boolean;
}

// Storage key for sharing codes across tabs/instances
const STORAGE_KEY = "syncstuff_auth_codes";

class AuthCodeService {
  private activeCodes: Map<string, AuthCode> = new Map();
  private readonly CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Load any existing codes from storage
    this.loadFromStorage();
    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Load codes from localStorage (for same-origin sharing)
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const codes = JSON.parse(stored) as AuthCode[];
        const now = new Date();
        for (const code of codes) {
          code.expiresAt = new Date(code.expiresAt);
          if (code.expiresAt > now && !code.used) {
            this.activeCodes.set(code.code, code);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load auth codes from storage:", e);
    }
  }

  /**
   * Save codes to localStorage
   */
  private saveToStorage(): void {
    try {
      const codes = Array.from(this.activeCodes.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    } catch (e) {
      console.warn("Failed to save auth codes to storage:", e);
    }
  }

  /**
   * Generate a pairing code for this device
   */
  generateCode(
    deviceId: string,
    deviceName?: string,
  ): { code: string; expiresAt: Date } {
    const code = this.generateSecureCode();
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MS);

    const authCode: AuthCode = {
      code,
      deviceId,
      deviceName: deviceName || `Device ${deviceId.substring(0, 6)}`,
      expiresAt,
      used: false,
    };

    this.activeCodes.set(code, authCode);
    this.saveToStorage();

    console.log(
      `Auth code generated: ${code} for device ${deviceId}, expires at ${expiresAt.toISOString()}`,
    );
    return { code, expiresAt };
  }

  /**
   * Validate a pairing code
   *
   * NOTE: This only works if the code was generated on the same device
   * or in the same browser session. For cross-device pairing,
   * use QR codes instead which encode the device ID directly.
   */
  async validateCode(
    code: string,
    _pairingDeviceId: string,
  ): Promise<{
    valid: boolean;
    deviceId?: string;
    deviceName?: string;
    reason?: string;
  }> {
    // Reload from storage in case code was generated in another tab
    this.loadFromStorage();

    const authCode = this.activeCodes.get(code);

    if (!authCode) {
      return {
        valid: false,
        reason:
          "Code not found. Auth codes only work on the same device. " +
          "Use QR code scanning for cross-device pairing.",
      };
    }

    if (authCode.used) {
      return { valid: false, reason: "Code already used" };
    }

    if (new Date() > authCode.expiresAt) {
      this.activeCodes.delete(code);
      this.saveToStorage();
      return { valid: false, reason: "Code expired" };
    }

    // Mark as used
    authCode.used = true;
    this.saveToStorage();

    console.log(
      `Auth code ${code} validated for pairing with ${authCode.deviceId}`,
    );

    return {
      valid: true,
      deviceId: authCode.deviceId,
      deviceName: authCode.deviceName,
    };
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
      this.saveToStorage();
    }
  }

  /**
   * Start periodic cleanup of expired codes
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCodes();
    }, 60 * 1000);
  }

  /**
   * Stop cleanup interval
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
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    const code = (randomValues[0] % 900000) + 100000;
    return code.toString();
  }
}

export const authCodeService = new AuthCodeService();
