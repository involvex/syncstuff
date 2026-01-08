/**
 * Ultra-fast native crypto utilities for Cloudflare Workers
 */

function toHex(arr: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < arr.length; i++) {
    const h = arr[i].toString(16);
    hex += h.length === 1 ? "0" + h : h;
  }
  return hex;
}

function fromHex(hex: string): Uint8Array {
  const len = hex.length / 2;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

function toBase64Url(buf: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < buf.length; i++) {
    bin += String.fromCharCode(buf[i]);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    buf[i] = bin.charCodeAt(i);
  }
  return buf;
}

const KEY_CACHE = new Map<string, CryptoKey>();

async function getHmacKey(secret: string): Promise<CryptoKey> {
  let key = KEY_CACHE.get(secret);
  if (!key) {
    key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
    KEY_CACHE.set(secret, key);
  }
  return key;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const derivedKey = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 1, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return `pbk2:1:${toHex(salt)}:${toHex(new Uint8Array(derivedKey))}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    if (!storedHash) return false;
    const parts = storedHash.split(":");
    if (parts.length !== 4) return false;
    const iterations = parseInt(parts[1], 10);
    const salt = fromHex(parts[2]);
    const hashHex = parts[3];
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );
    const derivedKey = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      keyMaterial,
      256,
    );
    return toHex(new Uint8Array(derivedKey)) === hashHex;
  } catch {
    return false;
  }
}

export async function signJWT(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const header = toBase64Url(
    encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })),
  );
  const b64Payload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const data = encoder.encode(`${header}.${b64Payload}`);
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  return `${header}.${b64Payload}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyJWT(
  token: string,
  secret: string,
): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const encoder = new TextEncoder();
    const data = encoder.encode(`${parts[0]}.${parts[1]}`);
    const key = await getHmacKey(secret);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(parts[2]),
      data,
    );
    if (!isValid) return null;
    return JSON.parse(new TextDecoder().decode(fromBase64Url(parts[1])));
  } catch {
    return null;
  }
}
