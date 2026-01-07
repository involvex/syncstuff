import {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  User,
} from "@syncstuff/shared";
import { hashPassword, signJWT, verifyJWT, verifyPassword } from "./utils/crypto";

export interface Env {
  syncstuff_db: D1Database;
  JWT_SECRET?: string;
}

interface D1User {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
  status: string;
  password_hash: string | null;
  preferences?: string;
  created_at: number;
  updated_at: number;
  full_name?: string;
}

interface UpdateSettingsRequest {
  preferences?: unknown;
  full_name?: string;
}

function mapUser(result: D1User): User {
  let preferences;
  try {
    preferences = result.preferences ? JSON.parse(result.preferences) : undefined;
  } catch {
    preferences = undefined;
  }

  // Validate status to ensure it matches the expected type
  const validStatuses = ['active', 'suspended', 'pending'] as const;
  const status = validStatuses.includes(result.status as typeof validStatuses[number])
    ? (result.status as 'active' | 'suspended' | 'pending')
    : 'pending' as const;

  return {
    id: result.id,
    email: result.email,
    username: result.username,
    full_name: result.full_name,
    role: result.role as 'user' | 'admin' | 'moderator',
    status,
    preferences,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
}

function handleDatabaseError(error: unknown, path: string, method: string): Response {
  // Convert error to string, handling various error types
  let errorMsg = "";
  let errorDetails: unknown = null;
  
  if (error instanceof Error) {
    errorMsg = error.message;
    errorDetails = { name: error.name, stack: error.stack };
  } else if (typeof error === "string") {
    errorMsg = error;
  } else if (error && typeof error === "object") {
    // Handle D1 result objects or other error-like objects
    errorMsg = JSON.stringify(error);
    errorDetails = error;
  } else {
    errorMsg = String(error);
  }
  
  console.error("[DB-ERROR]", errorMsg, { path, method, details: errorDetails });
  
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
  
  // Check for D1-specific errors - SQLite error codes (multiple patterns)
  // Pattern 1: "error code: 1042"
  // Pattern 2: "error code:1042" (no space)
  // Pattern 3: "SQLITE_ERROR: 1042"
  // Pattern 4: Just "1042" in error message
  if (
    errorMsg.includes("error code: 1042") || 
    errorMsg.includes("error code:1042") ||
    errorMsg.includes("SQLITE_ERROR: 1042") ||
    errorMsg.includes("SQLITE_ERROR:1042") ||
    /error\s*code\s*:?\s*1042/i.test(errorMsg) ||
    (errorMsg.includes("1042") && (errorMsg.includes("error") || errorMsg.includes("SQLITE")))
  ) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Database schema mismatch. The password_hash column may not exist. Please contact support.",
      code: "DB_SCHEMA_ERROR"
    }), { status: 500, headers });
  }
  
  // Check for other SQLite error codes (more flexible pattern matching)
  if (
    errorMsg.includes("error code:") || 
    errorMsg.includes("error code") ||
    errorMsg.includes("SQLITE_") || 
    errorMsg.includes("SQLITE_ERROR") ||
    /error\s*code\s*:?\s*\d+/i.test(errorMsg)
  ) {
    // Extract error code if possible (multiple patterns)
    const codeMatch = errorMsg.match(/error\s*code\s*:?\s*(\d+)/i) || 
                     errorMsg.match(/SQLITE_ERROR\s*:?\s*(\d+)/i) ||
                     errorMsg.match(/(\d{4})/); // Try to find 4-digit codes
    const errorCode = codeMatch ? codeMatch[1] : "UNKNOWN";
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Database error occurred. Please try again later.",
      code: `DB_ERROR_${errorCode}`
    }), { status: 500, headers });
  }
  
  // Generic database error
  return new Response(JSON.stringify({ 
    success: false, 
    error: "Database error occurred. Please try again.",
    code: "DB_ERROR"
  }), { status: 500, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Define headers early so they're always available
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });

    let path = "";
    let method = "";
    
    try {
      const url = new URL(request.url);
      path = url.pathname.replace(/\/$/, "");
      method = request.method;
      
      // eslint-disable-next-line no-console
      console.log(`[API-RAW] ${method} ${path} (original: ${url.pathname})`);
    } catch (urlError) {
      console.error("[API-ERROR] URL parsing failed:", urlError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid request URL",
        code: "INVALID_URL"
      }), { status: 400, headers });
    }

    const secret = env.JWT_SECRET || "dev-secret-key-change-me";

    // Wrap everything in try-catch to ensure all errors return JSON
    try {
      if (path === "/api/ping") {
        return new Response(JSON.stringify({ ok: true, v: "0.2.3", method: request.method }), { headers });
      }

      if (path === "/api/auth/nop" && request.method === "POST") {
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      // LOGIN
      if (path === "/api/auth/login" && request.method === "POST") {
        try {
          const body = await request.json<LoginRequest>();
          
          let user: D1User | null = null;
          try {
            user = await env.syncstuff_db
              .prepare("SELECT * FROM users WHERE email = ?")
              .bind(body.email)
              .first<D1User>();
          } catch (__dbError) {
            return handleDatabaseError(__dbError, path, request.method);
          }

          if (!user || !user.password_hash || !(await verifyPassword(body.password, user.password_hash))) {
            return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), { status: 401, headers });
          }

          const token = await signJWT({ sub: user.id, role: user.role, iat: Math.floor(Date.now() / 1000) }, secret);
          const mappedUser = mapUser(user);
          
          return new Response(JSON.stringify({ success: true, data: { token, user: mappedUser } }), { headers });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          if (errorMsg.includes("JSON") || errorMsg.includes("Unexpected token")) {
            console.error("Login JSON parse error:", error);
            return new Response(JSON.stringify({ success: false, error: "Invalid JSON in request body" }), { status: 400, headers });
          }
          return handleDatabaseError(error, path, request.method);
        }
      }

      // CHANGE PASSWORD
      if (path === "/api/auth/change-password" && request.method === "POST") {
        const auth = request.headers.get("Authorization");
        if (!auth?.startsWith("Bearer ")) return new Response(JSON.stringify({ success: false, error: "Missing token" }), { status: 401, headers });

        const token = auth.split(" ")[1];
        const payload = await verifyJWT(token, secret);
        if (!payload || !payload.sub) return new Response(JSON.stringify({ success: false, error: "Invalid token" }), { status: 401, headers });

        try {
          const body = await request.json<ChangePasswordRequest>();
          const userId = payload.sub as string;
          
          let user: { password_hash: string | null } | null = null;
          try {
            try {
              user = await env.syncstuff_db
                .prepare("SELECT password_hash FROM users WHERE id = ?")
                .bind(userId)
                .first<{ password_hash: string | null }>();
            } catch (prepareError) {
              console.error("[DB-ERROR] SELECT prepare/bind/first failed:", prepareError);
              return handleDatabaseError(prepareError, path, request.method);
            }
          } catch (__dbError) {
            console.error("[DB-ERROR] SELECT outer catch:", __dbError);
            return handleDatabaseError(__dbError, path, request.method);
          }

          if (!user) return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404, headers });

          if (user.password_hash) {
            if (!body.currentPassword || !(await verifyPassword(body.currentPassword, user.password_hash))) {
              return new Response(JSON.stringify({ success: false, error: "Wrong current password" }), { status: 401, headers });
            }
          }

          const newHash = await hashPassword(body.newPassword);
          try {
            let result;
            try {
              result = await env.syncstuff_db
                .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
                .bind(newHash, Date.now(), userId)
                .run();
            } catch (prepareError) {
              console.error("[DB-ERROR] Prepare/bind/run failed:", prepareError);
              return handleDatabaseError(prepareError, path, request.method);
            }
            
            // Check if result has an error property (D1 sometimes returns errors in result)
            if (result && typeof result === "object" && "error" in result) {
              console.error("[DB-ERROR] Result contains error:", result);
              return handleDatabaseError((result as { error: unknown }).error, path, request.method);
            }
            
            // Check if the update actually affected a row
            if (!result || !result.success) {
              console.error("[DB-ERROR] Update failed:", result);
              // Check if result has error message
              const errorMsg = result && typeof result === "object" && "error" in result 
                ? String((result as { error: unknown }).error)
                : "Failed to update password";
              
              if (errorMsg.includes("error code:") || errorMsg.includes("1042")) {
                return handleDatabaseError(errorMsg, path, request.method);
              }
              
              return new Response(JSON.stringify({ 
                success: false, 
                error: "Failed to update password. Please try again.",
                code: "DB_UPDATE_ERROR"
              }), { status: 500, headers });
            }
            
            // Verify the update affected at least one row
            if (result.meta?.changes === 0) {
              console.warn("[DB-WARN] Update affected 0 rows for user:", userId);
              return new Response(JSON.stringify({ 
                success: false, 
                error: "User not found or password could not be updated.",
                code: "USER_NOT_FOUND"
              }), { status: 404, headers });
            }
          } catch (__dbError) {
            console.error("[DB-ERROR] Exception during update:", __dbError);
            // Ensure we convert the error to a format handleDatabaseError can process
            const errorToHandle = __dbError instanceof Error 
              ? __dbError 
              : typeof __dbError === "string" 
                ? new Error(__dbError)
                : new Error(String(__dbError));
            return handleDatabaseError(errorToHandle, path, request.method);
          }

          return new Response(JSON.stringify({ success: true }), { headers });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          if (errorMsg.includes("JSON") || errorMsg.includes("Unexpected token")) {
            console.error("Change password JSON parse error:", error);
            return new Response(JSON.stringify({ success: false, error: "Invalid JSON in request body" }), { status: 400, headers });
          }
          return handleDatabaseError(error, path, request.method);
        }
      }

      // REGISTER
      if (path === "/api/auth/register" && request.method === "POST") {
        try {
          const body = await request.json<RegisterRequest>();
          const passwordHash = await hashPassword(body.password);
          const id = crypto.randomUUID();
          const now = Date.now();

          await env.syncstuff_db
            .prepare("INSERT INTO users (id, email, password_hash, username, full_name, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'user', 'active', ?, ?)")
            .bind(id, body.email, passwordHash, body.username, body.full_name || body.username, now, now)
            .run();

          const token = await signJWT({ sub: id, role: "user", iat: Math.floor(now / 1000) }, secret);
          return new Response(JSON.stringify({ success: true, data: { token, user: { id, email: body.email } } }), { status: 201, headers });
        } catch (error) {
          console.error("Register error:", error)
          return new Response(JSON.stringify({ success: false, error: "Invalid JSON in request body" }), { status: 400, headers });
        }
      }

      // USER PROFILE GET
      if (path === "/api/user/profile" && request.method === "GET") {
        const auth = request.headers.get("Authorization");
        if (!auth?.startsWith("Bearer ")) return new Response(JSON.stringify({ success: false, error: "Missing token" }), { status: 401, headers });

        const token = auth.split(" ")[1];
        const payload = await verifyJWT(token, secret);
        if (!payload || !payload.sub) return new Response(JSON.stringify({ success: false, error: "Invalid token" }), { status: 401, headers });

        const userId = payload.sub as string;
        let user: D1User | null = null;
        try {
          user = await env.syncstuff_db
            .prepare("SELECT id, username, email, full_name, role, status, preferences FROM users WHERE id = ?")
            .bind(userId)
            .first<D1User>();
        } catch (__dbError) {
          return handleDatabaseError(__dbError, path, request.method);
        }

        if (!user) return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404, headers });

        const mappedUser = mapUser(user);
        return new Response(JSON.stringify({ success: true, data: mappedUser }), { headers });
      }

      // USER SETTINGS UPDATE
      if (path === "/api/user/settings" && request.method === "POST") {
        const auth = request.headers.get("Authorization");
        if (!auth?.startsWith("Bearer ")) return new Response(JSON.stringify({ success: false, error: "Missing token" }), { status: 401, headers });

        const token = auth.split(" ")[1];
        const payload = await verifyJWT(token, secret);
        if (!payload || !payload.sub) return new Response(JSON.stringify({ success: false, error: "Invalid token" }), { status: 401, headers });

        try {
          const userId = payload.sub as string;
          const body = await request.json<UpdateSettingsRequest>();
          
          if (body.preferences) {
            try {
              JSON.stringify(body.preferences); // Validate JSON
            } catch {
              return new Response(JSON.stringify({ success: false, error: "Invalid preferences JSON" }), { status: 400, headers });
            }
            
            try {
              await env.syncstuff_db
                .prepare("UPDATE users SET preferences = ?, updated_at = ? WHERE id = ?")
                .bind(JSON.stringify(body.preferences), Date.now(), userId)
                .run();
            } catch (__dbError) {
              return handleDatabaseError(__dbError, path, request.method);
            }
          }

          if (body.full_name) {
            try {
              await env.syncstuff_db
                .prepare("UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?")
                .bind(body.full_name, Date.now(), userId)
                .run();
            } catch (__dbError) {
              return handleDatabaseError(__dbError, path, request.method);
            }
          }

          return new Response(JSON.stringify({ success: true }), { headers });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          if (errorMsg.includes("JSON") || errorMsg.includes("Unexpected token")) {
            console.error("Update settings JSON parse error:", error);
            return new Response(JSON.stringify({ success: false, error: "Invalid JSON in request body" }), { status: 400, headers });
          }
          return handleDatabaseError(error, path, request.method);
        }
      }

      // FORGOT PASSWORD
      if (path === "/api/auth/forgot-password" && request.method === "POST") {
        try {
          const body = await request.json<{ email: string }>();
          
          if (!body.email) {
            return new Response(JSON.stringify({ success: false, error: "Email is required" }), { status: 400, headers });
          }

          let _user: D1User | null = null;
          try {
            _user = await env.syncstuff_db
              .prepare("SELECT id, email FROM users WHERE email = ?")
              .bind(body.email)
              .first<D1User>();
          } catch (__dbError) {
            return handleDatabaseError(__dbError, path, request.method);
          }

          // Always return success to prevent email enumeration
          // In production, send reset email if user exists
          // For now, we'll just return success
          return new Response(JSON.stringify({ 
            success: true, 
            message: "If an account with that email exists, a password reset link has been sent."
          }), { headers });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          if (errorMsg.includes("JSON") || errorMsg.includes("Unexpected token")) {
            console.error("Forgot password JSON parse error:", error);
            return new Response(JSON.stringify({ success: false, error: "Invalid JSON in request body" }), { status: 400, headers });
          }
          return handleDatabaseError(error, path, request.method);
        }
      }

      // RESET PASSWORD
      if (path === "/api/auth/reset-password" && request.method === "POST") {
        try {
          const body = await request.json<{ token: string; email: string; newPassword: string }>();
          
          if (!body.token || !body.email || !body.newPassword) {
            return new Response(JSON.stringify({ success: false, error: "Token, email, and new password are required" }), { status: 400, headers });
          }

          if (body.newPassword.length < 8) {
            return new Response(JSON.stringify({ success: false, error: "Password must be at least 8 characters long" }), { status: 400, headers });
          }

          // TODO: Verify reset token (in production, store tokens in database with expiry)
          // For now, we'll verify the user exists and update password
          let user: D1User | null = null;
          try {
            user = await env.syncstuff_db
              .prepare("SELECT id, email FROM users WHERE email = ?")
              .bind(body.email)
              .first<D1User>();
          } catch (__dbError) {
            return handleDatabaseError(__dbError, path, request.method);
          }

          if (!user) {
            return new Response(JSON.stringify({ success: false, error: "Invalid reset token or email" }), { status: 400, headers });
          }

          // Hash new password and update
          const newHash = await hashPassword(body.newPassword);
          try {
            const result = await env.syncstuff_db
              .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
              .bind(newHash, Date.now(), user.id)
              .run();

            if (!result.success || result.meta?.changes === 0) {
              return new Response(JSON.stringify({ success: false, error: "Failed to reset password" }), { status: 500, headers });
            }

            return new Response(JSON.stringify({ success: true, message: "Password reset successfully" }), { headers });
          } catch (__dbError) {
            return handleDatabaseError(__dbError, path, request.method);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          if (errorMsg.includes("JSON") || errorMsg.includes("Unexpected token")) {
            console.error("Reset password JSON parse error:", error);
            return new Response(JSON.stringify({ success: false, error: "Invalid JSON in request body" }), { status: 400, headers });
          }
          return handleDatabaseError(error, path, request.method);
        }
      }

      // DEVICES - GET list of user's devices
      if (path === "/api/devices" && request.method === "GET") {
        const auth = request.headers.get("Authorization");
        if (!auth?.startsWith("Bearer "))
          return new Response(
            JSON.stringify({ success: false, error: "Missing token" }),
            { status: 401, headers },
          );

        const token = auth.split(" ")[1];
        const payload = await verifyJWT(token, secret);
        if (!payload || !payload.sub)
          return new Response(
            JSON.stringify({ success: false, error: "Invalid token" }),
            { status: 401, headers },
          );

        const userId = payload.sub as string;

        try {
          // Query devices table (if it exists, otherwise return empty array)
          let devices: Array<{
  id: string;
  name: string;
  type: string;
  platform: string;
  last_seen: number;
  is_online: boolean;
}> = [];
          try {
            const result = await env.syncstuff_db
              .prepare(
                "SELECT id, name, type, platform, last_seen, is_online FROM devices WHERE user_id = ? ORDER BY last_seen DESC",
              )
              .bind(userId)
              .all<{
                id: string;
                name: string;
                type: string;
                platform: string;
                last_seen: number;
                is_online: number;
              }>();

            devices = (result.results || []).map(device => ({
              id: device.id,
              name: device.name,
              type: device.type,
              platform: device.platform,
              last_seen: device.last_seen,
              is_online: Boolean(device.is_online),
            }));
          } catch (__dbError) {
            // Devices table might not exist yet
            console.warn("Devices table not found, returning empty array");
            devices = [];
          }

          return new Response(
            JSON.stringify({ success: true, data: devices }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      // TRANSFER - POST initiate file transfer
      if (path === "/api/transfer" && request.method === "POST") {
        const auth = request.headers.get("Authorization");
        if (!auth?.startsWith("Bearer "))
          return new Response(
            JSON.stringify({ success: false, error: "Missing token" }),
            { status: 401, headers },
          );

        const token = auth.split(" ")[1];
        const payload = await verifyJWT(token, secret);
        if (!payload || !payload.sub)
          return new Response(
            JSON.stringify({ success: false, error: "Invalid token" }),
            { status: 401, headers },
          );

        try {
          const body = await request.json<{
            deviceId: string;
            filePath: string;
          }>();

          if (!body.deviceId || !body.filePath) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "deviceId and filePath are required",
              }),
              { status: 400, headers },
            );
          }

          // Generate transfer ID
          const transferId = crypto.randomUUID();

          // Store transfer request (if transfers table exists)
          try {
            await env.syncstuff_db
              .prepare(
                "INSERT INTO transfers (id, user_id, device_id, file_path, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)",
              )
              .bind(
                transferId,
                payload.sub,
                body.deviceId,
                body.filePath,
                Date.now(),
              )
              .run();
          } catch (__dbError) {
            // Transfers table might not exist yet
            console.warn("Transfers table not found, transfer not persisted");
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: { transferId, message: "Transfer initiated" },
            }),
            { headers },
          );
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          if (errorMsg.includes("JSON") || errorMsg.includes("Unexpected token")) {
            console.error("Transfer JSON parse error:", error);
            return new Response(
              JSON.stringify({
                success: false,
                error: "Invalid JSON in request body",
              }),
              { status: 400, headers },
            );
          }
          return handleDatabaseError(error, path, request.method);
        }
      }

      return new Response(JSON.stringify({ 
        error: "Not found", 
        path, 
        method: request.method,
        availableEndpoints: [
          "/api/ping",
          "/api/auth/nop", 
          "/api/auth/login",
          "/api/auth/change-password",
          "/api/auth/forgot-password",
          "/api/auth/reset-password",
          "/api/auth/register",
          "/api/user/profile",
          "/api/user/settings",
          "/api/devices",
          "/api/transfer"
        ]
      }), { status: 404, headers });
    } catch (error) {
      // Catch any unhandled errors and ensure they're returned as JSON
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorString = String(error);
      
      // eslint-disable-next-line no-console
      console.error("[API-ERROR]", errorMsg, { error, path, method, errorString });
      
      // Check if this is a database error that wasn't caught (multiple patterns)
      if (
        errorMsg.includes("error code:") || 
        errorMsg.includes("error code") ||
        errorMsg.includes("SQLITE_") || 
        errorMsg.includes("1042") ||
        errorString.includes("error code:") ||
        errorString.includes("error code") ||
        errorString.includes("SQLITE_") ||
        errorString.includes("1042") ||
        /error\s*code\s*:?\s*\d+/i.test(errorMsg) ||
        /error\s*code\s*:?\s*\d+/i.test(errorString)
      ) {
        return handleDatabaseError(error, path || "unknown", method || "UNKNOWN");
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "An unexpected error occurred. Please try again.",
        code: "INTERNAL_ERROR"
      }), { status: 500, headers });
    }
  },
};