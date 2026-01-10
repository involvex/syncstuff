import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authCodeService } from "./auth-code.service";

describe("AuthCodeService", () => {
  beforeEach(() => {
    // Reset the service state before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    authCodeService.destroy();
  });

  describe("generateCode", () => {
    it("should generate a 6-digit code", () => {
      const { code, expiresAt } = authCodeService.generateCode("device-123");

      expect(code).toMatch(/^\d{6}$/);
      expect(expiresAt).toBeInstanceOf(Date);
    });

    it("should generate different codes for different calls", () => {
      const result1 = authCodeService.generateCode("device-1");
      const result2 = authCodeService.generateCode("device-2");

      expect(result1.code).not.toBe(result2.code);
    });

    it("should set expiration to 5 minutes in the future", () => {
      const now = new Date();
      vi.setSystemTime(now);

      const { expiresAt } = authCodeService.generateCode("device-123");

      const expectedExpiry = new Date(now.getTime() + 5 * 60 * 1000);
      expect(expiresAt.getTime()).toBe(expectedExpiry.getTime());
    });
  });

  describe("validateCode", () => {
    it("should validate a valid unused code", async () => {
      const { code } = authCodeService.generateCode("device-123");

      const result = await authCodeService.validateCode(code, "device-456");

      expect(result.valid).toBe(true);
      expect(result.deviceId).toBe("device-123");
    });

    it("should reject an invalid code", async () => {
      const result = await authCodeService.validateCode("999999", "device-456");

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Code not found");
    });

    it("should reject a code that has already been used", async () => {
      const { code } = authCodeService.generateCode("device-123");

      // First validation should succeed
      await authCodeService.validateCode(code, "device-456");

      // Second validation should fail
      const result = await authCodeService.validateCode(code, "device-789");

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Code already used");
    });

    it("should reject an expired code", async () => {
      const now = new Date();
      vi.setSystemTime(now);

      const { code } = authCodeService.generateCode("device-123");

      // Advance time by 6 minutes (past expiration)
      vi.setSystemTime(new Date(now.getTime() + 6 * 60 * 1000));

      const result = await authCodeService.validateCode(code, "device-456");

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Code expired");
    });
  });

  describe("getTimeRemaining", () => {
    it("should return correct time remaining for a valid code", () => {
      const now = new Date();
      vi.setSystemTime(now);

      const { code } = authCodeService.generateCode("device-123");

      // Advance time by 2 minutes
      vi.setSystemTime(new Date(now.getTime() + 2 * 60 * 1000));

      const remaining = authCodeService.getTimeRemaining(code);

      expect(remaining).toBe(3 * 60); // 3 minutes remaining
    });

    it("should return 0 for an expired code", () => {
      const now = new Date();
      vi.setSystemTime(now);

      const { code } = authCodeService.generateCode("device-123");

      // Advance time past expiration
      vi.setSystemTime(new Date(now.getTime() + 6 * 60 * 1000));

      const remaining = authCodeService.getTimeRemaining(code);

      expect(remaining).toBe(0);
    });

    it("should return 0 for a non-existent code", () => {
      const remaining = authCodeService.getTimeRemaining("999999");

      expect(remaining).toBe(0);
    });
  });

  describe("cleanupExpiredCodes", () => {
    it("should remove expired codes", () => {
      const now = new Date();
      vi.setSystemTime(now);

      // Generate two codes
      const { code: code1 } = authCodeService.generateCode("device-1");
      const { code: code2 } = authCodeService.generateCode("device-2");

      // Advance time past expiration
      vi.setSystemTime(new Date(now.getTime() + 6 * 60 * 1000));

      // Cleanup should remove both codes
      authCodeService.cleanupExpiredCodes();

      // Both codes should now be invalid
      const remaining1 = authCodeService.getTimeRemaining(code1);
      const remaining2 = authCodeService.getTimeRemaining(code2);

      expect(remaining1).toBe(0);
      expect(remaining2).toBe(0);
    });

    it("should remove used codes", async () => {
      const { code } = authCodeService.generateCode("device-123");

      // Use the code
      await authCodeService.validateCode(code, "device-456");

      // Cleanup should remove the used code
      authCodeService.cleanupExpiredCodes();

      // Code should no longer exist
      const remaining = authCodeService.getTimeRemaining(code);
      expect(remaining).toBe(0);
    });

    it("should not remove  valid unused codes", () => {
      const now = new Date();
      vi.setSystemTime(now);

      const { code } = authCodeService.generateCode("device-123");

      // Advance time by 2 minutes (still valid)
      vi.setSystemTime(new Date(now.getTime() + 2 * 60 * 1000));

      authCodeService.cleanupExpiredCodes();

      // Code should still exist
      const remaining = authCodeService.getTimeRemaining(code);
      expect(remaining).toBeGreaterThan(0);
    });
  });

  describe("cryptographic security", () => {
    it("should generate random 6-digit codes", () => {
      const codes = new Set();

      // Generate 100 codes
      for (let i = 0; i < 100; i++) {
        const { code } = authCodeService.generateCode(`device-${i}`);
        codes.add(code);
      }

      // Should have generated 100 unique codes (highly likely with crypto random)
      expect(codes.size).toBe(100);
    });

    it("should generate codes within valid range", () => {
      for (let i = 0; i < 50; i++) {
        const { code } = authCodeService.generateCode(`device-${i}`);
        const codeNum = parseInt(code, 10);

        expect(codeNum).toBeGreaterThanOrEqual(100000);
        expect(codeNum).toBeLessThanOrEqual(999999);
      }
    });
  });
});
