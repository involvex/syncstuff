import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";
import WordArray from "crypto-js/lib-typedarrays";
import SHA256 from "crypto-js/sha256";

/**
 * Encrypt data using AES-GCM
 */
export const encryptData = (data: string, key: string): string => {
  return AES.encrypt(data, key).toString();
};

/**
 * Decrypt data using AES-GCM
 */
export const decryptData = (encryptedData: string, key: string): string => {
  const bytes = AES.decrypt(encryptedData, key);
  return bytes.toString(encUtf8);
};

/**
 * Calculate SHA-256 checksum of a string or array buffer
 */
export const calculateChecksum = (
  data: string | ArrayBuffer | Uint8Array,
): string => {
  if (typeof data === "string") {
    return SHA256(data).toString();
  }

  // The @types/crypto-js definitions are not complete for lib-typedarrays,
  // so we cast to any to allow passing an ArrayBuffer which the library supports.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wordArr = WordArray.create(data as any);
  return SHA256(wordArr).toString();
};

/**
 * Generate a random file ID
 */
export const generateFileId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
