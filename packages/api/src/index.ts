import type {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  User,
} from "@syncstuff/shared";
import {
  hashPassword,
  signJWT,
  verifyJWT,
  verifyPassword,
} from "./utils/crypto";

export interface Env {
  syncstuff_db: D1Database;
  syncstuff_storage: R2Bucket;
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
    preferences = result.preferences
      ? JSON.parse(result.preferences)
      : undefined;
  } catch {
    preferences = undefined;
  }

  // Validate status to ensure it matches the expected type
  const validStatuses = ["active", "suspended", "pending"] as const;
  const status = validStatuses.includes(
    result.status as (typeof validStatuses)[number],
  )
    ? (result.status as "active" | "suspended" | "pending")
    : ("pending" as const);

  return {
    id: result.id,
    email: result.email,
    username: result.username,
    full_name: result.full_name,
    role: result.role as "user" | "admin" | "moderator",
    status,
    preferences,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
}

function handleDatabaseError(
  error: unknown,
  path: string,
  method: string,
): Response {
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

  console.error("[DB-ERROR]", errorMsg, {
    path,
    method,
    details: errorDetails,
  });

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
    (errorMsg.includes("1042") &&
      (errorMsg.includes("error") || errorMsg.includes("SQLITE")))
  ) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          "Database schema mismatch. The password_hash column may not exist. Please contact support.",
        code: "DB_SCHEMA_ERROR",
      }),
      { status: 500, headers },
    );
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
    const codeMatch =
      errorMsg.match(/error\s*code\s*:?\s*(\d+)/i) ||
      errorMsg.match(/SQLITE_ERROR\s*:?\s*(\d+)/i) ||
      errorMsg.match(/(\d{4})/); // Try to find 4-digit codes
    const errorCode = codeMatch ? codeMatch[1] : "UNKNOWN";

    return new Response(
      JSON.stringify({
        success: false,
        error: "Database error occurred. Please try again later.",
        code: `DB_ERROR_${errorCode}`,
      }),
      { status: 500, headers },
    );
  }

  // Generic database error
  return new Response(
    JSON.stringify({
      success: false,
      error: "Database error occurred. Please try again.",
      code: "DB_ERROR",
    }),
    { status: 500, headers },
  );
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
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request URL",
          code: "INVALID_URL",
        }),
        { status: 400, headers },
      );
    }

    const secret = env.JWT_SECRET || "dev-secret-key-change-me";

    // Wrap everything in try-catch to ensure all errors return JSON
    try {
      if (path === "/api/ping") {
        return new Response(
          JSON.stringify({ ok: true, v: "0.2.3", method: request.method }),
          { headers },
        );
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

          if (
            !user ||
            !user.password_hash ||
            !(await verifyPassword(body.password, user.password_hash))
          ) {
            return new Response(
              JSON.stringify({ success: false, error: "Invalid credentials" }),
              { status: 401, headers },
            );
          }

          const token = await signJWT(
            {
              sub: user.id,
              role: user.role,
              iat: Math.floor(Date.now() / 1000),
            },
            secret,
          );
          const mappedUser = mapUser(user);

          return new Response(
            JSON.stringify({
              success: true,
              data: { token, user: mappedUser },
            }),
            { headers },
          );
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          if (
            errorMsg.includes("JSON") ||
            errorMsg.includes("Unexpected token")
          ) {
            console.error("Login JSON parse error:", error);
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

      // CHANGE PASSWORD
      if (path === "/api/auth/change-password" && request.method === "POST") {
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
              console.error(
                "[DB-ERROR] SELECT prepare/bind/first failed:",
                prepareError,
              );
              return handleDatabaseError(prepareError, path, request.method);
            }
          } catch (__dbError) {
            console.error("[DB-ERROR] SELECT outer catch:", __dbError);
            return handleDatabaseError(__dbError, path, request.method);
          }

          if (!user)
            return new Response(
              JSON.stringify({ success: false, error: "User not found" }),
              { status: 404, headers },
            );

          if (user.password_hash) {
            if (
              !body.currentPassword ||
              !(await verifyPassword(body.currentPassword, user.password_hash))
            ) {
              return new Response(
                JSON.stringify({
                  success: false,
                  error: "Wrong current password",
                }),
                { status: 401, headers },
              );
            }
          }

          const newHash = await hashPassword(body.newPassword);
          try {
            let result;
            try {
              result = await env.syncstuff_db
                .prepare(
                  "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
                )
                .bind(newHash, Date.now(), userId)
                .run();
            } catch (prepareError) {
              console.error(
                "[DB-ERROR] Prepare/bind/run failed:",
                prepareError,
              );
              return handleDatabaseError(prepareError, path, request.method);
            }

            // Check if result has an error property (D1 sometimes returns errors in result)
            if (result && typeof result === "object" && "error" in result) {
              console.error("[DB-ERROR] Result contains error:", result);
              return handleDatabaseError(
                (result as { error: unknown }).error,
                path,
                request.method,
              );
            }

            // Check if the update actually affected a row
            if (!result || !result.success) {
              console.error("[DB-ERROR] Update failed:", result);
              // Check if result has error message
              const errorMsg =
                result && typeof result === "object" && "error" in result
                  ? String((result as { error: unknown }).error)
                  : "Failed to update password";

              if (
                errorMsg.includes("error code:") ||
                errorMsg.includes("1042")
              ) {
                return handleDatabaseError(errorMsg, path, request.method);
              }

              return new Response(
                JSON.stringify({
                  success: false,
                  error: "Failed to update password. Please try again.",
                  code: "DB_UPDATE_ERROR",
                }),
                { status: 500, headers },
              );
            }

            // Verify the update affected at least one row
            if (result.meta?.changes === 0) {
              console.warn(
                "[DB-WARN] Update affected 0 rows for user:",
                userId,
              );
              return new Response(
                JSON.stringify({
                  success: false,
                  error: "User not found or password could not be updated.",
                  code: "USER_NOT_FOUND",
                }),
                { status: 404, headers },
              );
            }
          } catch (__dbError) {
            console.error("[DB-ERROR] Exception during update:", __dbError);
            // Ensure we convert the error to a format handleDatabaseError can process
            const errorToHandle =
              __dbError instanceof Error
                ? __dbError
                : typeof __dbError === "string"
                  ? new Error(__dbError)
                  : new Error(String(__dbError));
            return handleDatabaseError(errorToHandle, path, request.method);
          }

          return new Response(JSON.stringify({ success: true }), { headers });
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          if (
            errorMsg.includes("JSON") ||
            errorMsg.includes("Unexpected token")
          ) {
            console.error("Change password JSON parse error:", error);
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

      // REGISTER
      if (path === "/api/auth/register" && request.method === "POST") {
        try {
          const body = await request.json<RegisterRequest>();
          const passwordHash = await hashPassword(body.password);
          const id = crypto.randomUUID();
          const now = Date.now();

          await env.syncstuff_db
            .prepare(
              "INSERT INTO users (id, email, password_hash, username, full_name, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'user', 'active', ?, ?)",
            )
            .bind(
              id,
              body.email,
              passwordHash,
              body.username,
              body.full_name || body.username,
              now,
              now,
            )
            .run();

          const token = await signJWT(
            { sub: id, role: "user", iat: Math.floor(now / 1000) },
            secret,
          );
          return new Response(
            JSON.stringify({
              success: true,
              data: { token, user: { id, email: body.email } },
            }),
            { status: 201, headers },
          );
        } catch (error) {
          console.error("Register error:", error);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Invalid JSON in request body",
            }),
            { status: 400, headers },
          );
        }
      }

      // USER PROFILE GET
      if (path === "/api/user/profile" && request.method === "GET") {
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
        let user: D1User | null = null;
        try {
          user = await env.syncstuff_db
            .prepare(
              "SELECT id, username, email, full_name, role, status, preferences FROM users WHERE id = ?",
            )
            .bind(userId)
            .first<D1User>();
        } catch (__dbError) {
          return handleDatabaseError(__dbError, path, request.method);
        }

        if (!user)
          return new Response(
            JSON.stringify({ success: false, error: "User not found" }),
            { status: 404, headers },
          );

        const mappedUser = mapUser(user);
        return new Response(
          JSON.stringify({ success: true, data: mappedUser }),
          { headers },
        );
      }

      // USER SETTINGS UPDATE
      if (path === "/api/user/settings" && request.method === "POST") {
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
          const userId = payload.sub as string;
          const body = await request.json<UpdateSettingsRequest>();

          if (body.preferences) {
            try {
              JSON.stringify(body.preferences); // Validate JSON
            } catch {
              return new Response(
                JSON.stringify({
                  success: false,
                  error: "Invalid preferences JSON",
                }),
                { status: 400, headers },
              );
            }

            try {
              await env.syncstuff_db
                .prepare(
                  "UPDATE users SET preferences = ?, updated_at = ? WHERE id = ?",
                )
                .bind(JSON.stringify(body.preferences), Date.now(), userId)
                .run();
            } catch (__dbError) {
              return handleDatabaseError(__dbError, path, request.method);
            }
          }

          if (body.full_name) {
            try {
              await env.syncstuff_db
                .prepare(
                  "UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?",
                )
                .bind(body.full_name, Date.now(), userId)
                .run();
            } catch (__dbError) {
              return handleDatabaseError(__dbError, path, request.method);
            }
          }

          return new Response(JSON.stringify({ success: true }), { headers });
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          if (
            errorMsg.includes("JSON") ||
            errorMsg.includes("Unexpected token")
          ) {
            console.error("Update settings JSON parse error:", error);
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

      // USER ACCOUNT DELETE
      if (path === "/api/user/account" && request.method === "DELETE") {
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
          const userId = payload.sub as string;
          await env.syncstuff_db
            .prepare("DELETE FROM users WHERE id = ?")
            .bind(userId)
            .run();

          return new Response(JSON.stringify({ success: true }), { headers });
        } catch (__dbError) {
          return handleDatabaseError(__dbError, path, request.method);
        }
      }

      // ADMIN - GET all users
      if (path === "/api/admin/users" && request.method === "GET") {
        const auth = request.headers.get("Authorization");
        if (!auth?.startsWith("Bearer "))
          return new Response(
            JSON.stringify({ success: false, error: "Missing token" }),
            { status: 401, headers },
          );

        const token = auth.split(" ")[1];
        const payload = await verifyJWT(token, secret);
        if (!payload || !payload.sub || payload.role !== "admin")
          return new Response(
            JSON.stringify({ success: false, error: "Forbidden" }),
            { status: 403, headers },
          );

        try {
          const result = await env.syncstuff_db
            .prepare(
              "SELECT id, email, username, full_name, role, status, created_at, updated_at FROM users ORDER BY created_at DESC",
            )
            .all<D1User>();

          const users = (result.results || []).map(mapUser);
          return new Response(JSON.stringify({ success: true, data: users }), {
            headers,
          });
        } catch (__dbError) {
          return handleDatabaseError(__dbError, path, request.method);
        }
      }

      // ADMIN - POST toggle user status
      if (
        path.startsWith("/api/admin/user/") &&
        path.endsWith("/status") &&
        request.method === "POST"
      ) {
        const auth = request.headers.get("Authorization");
        if (!auth?.startsWith("Bearer "))
          return new Response(
            JSON.stringify({ success: false, error: "Missing token" }),
            { status: 401, headers },
          );

        const token = auth.split(" ")[1];
        const payload = await verifyJWT(token, secret);
        if (!payload || !payload.sub || payload.role !== "admin")
          return new Response(
            JSON.stringify({ success: false, error: "Forbidden" }),
            { status: 403, headers },
          );

        const parts = path.split("/");
        const userId = parts[parts.length - 2];

        try {
          const user = await env.syncstuff_db
            .prepare("SELECT status FROM users WHERE id = ?")
            .bind(userId)
            .first<{ status: string }>();

          if (!user) {
            return new Response(
              JSON.stringify({ success: false, error: "User not found" }),
              { status: 404, headers },
            );
          }

          const newStatus = user.status === "active" ? "suspended" : "active";
          await env.syncstuff_db
            .prepare("UPDATE users SET status = ?, updated_at = ? WHERE id = ?")
            .bind(newStatus, Date.now(), userId)
            .run();

          return new Response(
            JSON.stringify({ success: true, data: { status: newStatus } }),
            { headers },
          );
        } catch (__dbError) {
          return handleDatabaseError(__dbError, path, request.method);
        }
      }

      // FORGOT PASSWORD
      if (path === "/api/auth/forgot-password" && request.method === "POST") {
        try {
          const body = await request.json<{ email: string }>();

          if (!body.email) {
            return new Response(
              JSON.stringify({ success: false, error: "Email is required" }),
              { status: 400, headers },
            );
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
          return new Response(
            JSON.stringify({
              success: true,
              message:
                "If an account with that email exists, a password reset link has been sent.",
            }),
            { headers },
          );
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          if (
            errorMsg.includes("JSON") ||
            errorMsg.includes("Unexpected token")
          ) {
            console.error("Forgot password JSON parse error:", error);
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

      // RESET PASSWORD
      if (path === "/api/auth/reset-password" && request.method === "POST") {
        try {
          const body = await request.json<{
            token: string;
            email: string;
            newPassword: string;
          }>();

          if (!body.token || !body.email || !body.newPassword) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Token, email, and new password are required",
              }),
              { status: 400, headers },
            );
          }

          if (body.newPassword.length < 8) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Password must be at least 8 characters long",
              }),
              { status: 400, headers },
            );
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
            return new Response(
              JSON.stringify({
                success: false,
                error: "Invalid reset token or email",
              }),
              { status: 400, headers },
            );
          }

          // Hash new password and update
          const newHash = await hashPassword(body.newPassword);
          try {
            const result = await env.syncstuff_db
              .prepare(
                "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
              )
              .bind(newHash, Date.now(), user.id)
              .run();

            if (!result.success || result.meta?.changes === 0) {
              return new Response(
                JSON.stringify({
                  success: false,
                  error: "Failed to reset password",
                }),
                { status: 500, headers },
              );
            }

            return new Response(
              JSON.stringify({
                success: true,
                message: "Password reset successfully",
              }),
              { headers },
            );
          } catch (__dbError) {
            return handleDatabaseError(__dbError, path, request.method);
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          if (
            errorMsg.includes("JSON") ||
            errorMsg.includes("Unexpected token")
          ) {
            console.error("Reset password JSON parse error:", error);
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

      // DEVICES - POST register or update device
      if (path === "/api/devices/register" && request.method === "POST") {
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
          const body: {
            deviceId?: string;
            name?: string;
            platform?: string;
            model?: string;
            manufacturer?: string;
            osVersion?: string;
            appVersion?: string;
          } = await request.json();

          const {
            deviceId,
            name,
            platform,
            model,
            manufacturer,
            osVersion,
            appVersion,
          } = body;

          // Validate required fields
          if (!deviceId || !name || !platform) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Missing required fields",
                required: ["deviceId", "name", "platform"],
              }),
              { status: 400, headers },
            );
          }

          // Build metadata JSON
          const metadata = JSON.stringify({
            model: model || null,
            manufacturer: manufacturer || null,
            osVersion: osVersion || null,
            appVersion: appVersion || null,
          });

          // Determine device type based on platform
          let type = "mobile";
          if (platform === "web") type = "web";
          else if (["windows", "macos", "linux"].includes(platform))
            type = "desktop";

          const now = Date.now(); // Unix timestamp in milliseconds

          // Check if device already exists
          const existingDevice = await env.syncstuff_db
            .prepare(
              "SELECT id FROM devices WHERE user_id = ? AND device_id = ?",
            )
            .bind(userId, deviceId)
            .first<{ id: string }>();

          if (existingDevice) {
            // Update existing device
            await env.syncstuff_db
              .prepare(
                `UPDATE devices
                 SET name = ?, platform = ?, metadata = ?, is_online = 1,
                     last_seen = ?, updated_at = ?
                 WHERE id = ?`,
              )
              .bind(name, platform, metadata, now, now, existingDevice.id)
              .run();

            return new Response(
              JSON.stringify({
                success: true,
                message: "Device updated",
                deviceId: existingDevice.id,
              }),
              { status: 200, headers },
            );
          }
          // Insert new device - generate UUID for id
          const newId = crypto.randomUUID();

          await env.syncstuff_db
            .prepare(
              `INSERT INTO devices
                 (id, user_id, device_id, name, type, platform, metadata, is_online, last_seen, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
            )
            .bind(
              newId,
              userId,
              deviceId,
              name,
              type,
              platform,
              metadata,
              now,
              now,
              now,
            )
            .run();

          return new Response(
            JSON.stringify({
              success: true,
              message: "Device registered",
              deviceId: newId,
            }),
            { status: 201, headers },
          );
        } catch (error) {
          console.error("Device registration error:", error);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Internal server error",
              message: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500, headers },
          );
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
          if (
            errorMsg.includes("JSON") ||
            errorMsg.includes("Unexpected token")
          ) {
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

      // ============================================================================
      // ANALYTICS ENDPOINTS
      // ============================================================================

      if (path === "/api/analytics/events" && request.method === "POST") {
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
            events: Array<{
              event_type: string;
              event_data?: unknown;
              device_id?: string;
              device_name?: string;
            }>;
          }>();

          if (!body.events || !Array.isArray(body.events)) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "events array is required",
              }),
              { status: 400, headers },
            );
          }

          // Batch insert analytics events
          for (const event of body.events) {
            const eventId = crypto.randomUUID();
            await env.syncstuff_db
              .prepare(
                "INSERT INTO analytics_events (id, user_id, event_type, event_data, device_id, device_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
              )
              .bind(
                eventId,
                payload.sub,
                event.event_type,
                event.event_data ? JSON.stringify(event.event_data) : null,
                event.device_id || null,
                event.device_name || null,
                Date.now(),
              )
              .run();
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: { recorded: body.events.length },
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      if (path === "/api/analytics/dashboard" && request.method === "GET") {
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
          // Get analytics summary for the user
          const [
            totalEvents,
            totalTransfers,
            avgPerformance,
            recentErrors,
          ] = await Promise.all([
            env.syncstuff_db
              .prepare(
                "SELECT COUNT(*) as count FROM analytics_events WHERE user_id = ?",
              )
              .bind(payload.sub)
              .first<{ count: number }>(),
            env.syncstuff_db
              .prepare(
                "SELECT COUNT(*) as count FROM transfer_history WHERE user_id = ? AND status = 'completed'",
              )
              .bind(payload.sub)
              .first<{ count: number }>(),
            env.syncstuff_db
              .prepare(
                "SELECT AVG(value) as avg FROM performance_metrics WHERE user_id = ? AND metric_type = 'transfer_speed'",
              )
              .bind(payload.sub)
              .first<{ avg: number | null }>(),
            env.syncstuff_db
              .prepare(
                "SELECT * FROM error_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
              )
              .bind(payload.sub)
              .all(),
          ]);

          return new Response(
            JSON.stringify({
              success: true,
              data: {
                totalEvents: totalEvents?.count || 0,
                totalTransfers: totalTransfers?.count || 0,
                avgTransferSpeed: avgPerformance?.avg || 0,
                recentErrors: recentErrors.results || [],
              },
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      if (path === "/api/analytics/performance" && request.method === "POST") {
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
            metric_type: string;
            value: number;
            unit?: string;
            device_id?: string;
            device_name?: string;
          }>();

          if (!body.metric_type || body.value === undefined) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "metric_type and value are required",
              }),
              { status: 400, headers },
            );
          }

          const metricId = crypto.randomUUID();
          await env.syncstuff_db
            .prepare(
              "INSERT INTO performance_metrics (id, user_id, metric_type, value, unit, device_id, device_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            )
            .bind(
              metricId,
              payload.sub,
              body.metric_type,
              body.value,
              body.unit || null,
              body.device_id || null,
              body.device_name || null,
              Date.now(),
            )
            .run();

          return new Response(
            JSON.stringify({
              success: true,
              data: { id: metricId },
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      if (path === "/api/analytics/errors" && request.method === "POST") {
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
            error_type: string;
            error_message?: string;
            error_code?: string;
            stack_trace?: string;
            device_id?: string;
            device_name?: string;
            platform?: string;
            app_version?: string;
          }>();

          if (!body.error_type) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "error_type is required",
              }),
              { status: 400, headers },
            );
          }

          const errorId = crypto.randomUUID();
          await env.syncstuff_db
            .prepare(
              "INSERT INTO error_logs (id, user_id, error_type, error_message, error_code, stack_trace, device_id, device_name, platform, app_version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            )
            .bind(
              errorId,
              payload.sub,
              body.error_type,
              body.error_message || null,
              body.error_code || null,
              body.stack_trace || null,
              body.device_id || null,
              body.device_name || null,
              body.platform || null,
              body.app_version || null,
              Date.now(),
            )
            .run();

          return new Response(
            JSON.stringify({
              success: true,
              data: { id: errorId },
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      // ============================================================================
      // PRESENCE ENDPOINTS
      // ============================================================================

      if (path === "/api/presence/heartbeat" && request.method === "POST") {
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
            device_id: string;
            device_name?: string;
            platform?: string;
            current_action?: string;
            status?: string;
          }>();

          if (!body.device_id) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "device_id is required",
              }),
              { status: 400, headers },
            );
          }

          // Upsert device presence
          const presenceId = crypto.randomUUID();
          const now = Date.now();

          // Try to update first
          const updateResult = await env.syncstuff_db
            .prepare(
              "UPDATE device_presence SET status = ?, last_seen = ?, current_action = ?, updated_at = ? WHERE device_id = ?",
            )
            .bind(
              body.status || "online",
              now,
              body.current_action || null,
              now,
              body.device_id,
            )
            .run();

          // If no rows updated, insert new record
          if (updateResult.meta.changes === 0) {
            await env.syncstuff_db
              .prepare(
                "INSERT INTO device_presence (id, device_id, user_id, device_name, platform, status, last_seen, current_action, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              )
              .bind(
                presenceId,
                body.device_id,
                payload.sub,
                body.device_name || null,
                body.platform || null,
                body.status || "online",
                now,
                body.current_action || null,
                now,
                now,
              )
              .run();
          }

          // Also update devices table if exists
          try {
            await env.syncstuff_db
              .prepare(
                "UPDATE devices SET is_online = 1, last_seen = ? WHERE id = ?",
              )
              .bind(now, body.device_id)
              .run();
          } catch {
            // Devices table might not have device yet
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: { message: "Heartbeat recorded" },
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      if (
        path.startsWith("/api/presence/devices/") &&
        request.method === "GET"
      ) {
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

        const userId = path.split("/").pop();
        if (userId !== payload.sub) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Unauthorized",
            }),
            { status: 403, headers },
          );
        }

        try {
          const devices = await env.syncstuff_db
            .prepare(
              "SELECT * FROM device_presence WHERE user_id = ? ORDER BY last_seen DESC",
            )
            .bind(payload.sub)
            .all();

          return new Response(
            JSON.stringify({
              success: true,
              data: devices.results || [],
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      if (path === "/api/presence/online" && request.method === "GET") {
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
          // Devices are considered online if last_seen within 60 seconds
          const cutoffTime = Date.now() - 60000;
          const devices = await env.syncstuff_db
            .prepare(
              "SELECT * FROM device_presence WHERE user_id = ? AND last_seen > ? ORDER BY last_seen DESC",
            )
            .bind(payload.sub, cutoffTime)
            .all();

          return new Response(
            JSON.stringify({
              success: true,
              data: devices.results || [],
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      // ============================================================================
      // FILE VERSIONING ENDPOINTS
      // ============================================================================

      if (path === "/api/files/version" && request.method === "POST") {
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
            file_id: string;
            file_name: string;
            file_hash: string;
            file_size: number;
            file_path?: string;
            mime_type?: string;
            storage_provider?: string;
            storage_path?: string;
            device_id?: string;
            device_name?: string;
            notes?: string;
          }>();

          if (!body.file_id || !body.file_name || !body.file_hash || !body.file_size) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "file_id, file_name, file_hash, and file_size are required",
              }),
              { status: 400, headers },
            );
          }

          // Get current version number
          const currentVersion = await env.syncstuff_db
            .prepare(
              "SELECT MAX(version_number) as max_version FROM file_versions WHERE file_id = ?",
            )
            .bind(body.file_id)
            .first<{ max_version: number | null }>();

          const versionNumber = (currentVersion?.max_version || 0) + 1;

          // Mark all previous versions as not current
          await env.syncstuff_db
            .prepare(
              "UPDATE file_versions SET is_current = 0 WHERE file_id = ?",
            )
            .bind(body.file_id)
            .run();

          // Create new version
          const versionId = crypto.randomUUID();
          await env.syncstuff_db
            .prepare(
              "INSERT INTO file_versions (id, file_id, user_id, version_number, file_name, file_path, file_hash, file_size, mime_type, storage_provider, storage_path, device_id, device_name, is_current, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
            )
            .bind(
              versionId,
              body.file_id,
              payload.sub,
              versionNumber,
              body.file_name,
              body.file_path || null,
              body.file_hash,
              body.file_size,
              body.mime_type || null,
              body.storage_provider || "local",
              body.storage_path || null,
              body.device_id || null,
              body.device_name || null,
              body.notes || null,
              Date.now(),
            )
            .run();

          return new Response(
            JSON.stringify({
              success: true,
              data: {
                id: versionId,
                version_number: versionNumber,
              },
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      if (path.startsWith("/api/files/") && path.endsWith("/versions") && request.method === "GET") {
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

        const fileId = path.split("/")[3]; // Extract file ID from /api/files/{fileId}/versions

        try {
          const versions = await env.syncstuff_db
            .prepare(
              "SELECT * FROM file_versions WHERE file_id = ? AND user_id = ? ORDER BY version_number DESC",
            )
            .bind(fileId, payload.sub)
            .all();

          return new Response(
            JSON.stringify({
              success: true,
              data: versions.results || [],
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      if (path.startsWith("/api/files/version/") && path.endsWith("/restore") && request.method === "POST") {
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

        const versionId = path.split("/")[4]; // Extract version ID from /api/files/version/{versionId}/restore

        try {
          // Get the version to restore
          const version = await env.syncstuff_db
            .prepare(
              "SELECT * FROM file_versions WHERE id = ? AND user_id = ?",
            )
            .bind(versionId, payload.sub)
            .first();

          if (!version) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Version not found",
              }),
              { status: 404, headers },
            );
          }

          // Mark all versions as not current
          await env.syncstuff_db
            .prepare(
              "UPDATE file_versions SET is_current = 0 WHERE file_id = ?",
            )
            .bind((version as { file_id: string }).file_id)
            .run();

          // Mark this version as current
          await env.syncstuff_db
            .prepare(
              "UPDATE file_versions SET is_current = 1 WHERE id = ?",
            )
            .bind(versionId)
            .run();

          return new Response(
            JSON.stringify({
              success: true,
              data: { message: "Version restored", version },
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      // ============================================================================
      // CONFLICT RESOLUTION ENDPOINTS
      // ============================================================================

      if (path === "/api/conflicts" && request.method === "GET") {
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
          const conflicts = await env.syncstuff_db
            .prepare(
              "SELECT c.*, va.file_name as version_a_name, vb.file_name as version_b_name FROM file_conflicts c LEFT JOIN file_versions va ON c.version_a_id = va.id LEFT JOIN file_versions vb ON c.version_b_id = vb.id WHERE c.user_id = ? AND c.resolved = 0 ORDER BY c.created_at DESC",
            )
            .bind(payload.sub)
            .all();

          return new Response(
            JSON.stringify({
              success: true,
              data: conflicts.results || [],
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      if (path.startsWith("/api/conflicts/") && path.endsWith("/resolve") && request.method === "POST") {
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

        const conflictId = path.split("/")[3]; // Extract conflict ID from /api/conflicts/{conflictId}/resolve

        try {
          const body = await request.json<{
            resolution_strategy: string;
            resolved_version_id: string;
          }>();

          if (!body.resolution_strategy || !body.resolved_version_id) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "resolution_strategy and resolved_version_id are required",
              }),
              { status: 400, headers },
            );
          }

          // Update conflict as resolved
          await env.syncstuff_db
            .prepare(
              "UPDATE file_conflicts SET resolved = 1, resolution_strategy = ?, resolved_version_id = ?, resolved_at = ?, resolved_by = ? WHERE id = ? AND user_id = ?",
            )
            .bind(
              body.resolution_strategy,
              body.resolved_version_id,
              Date.now(),
              payload.sub,
              conflictId,
              payload.sub,
            )
            .run();

          return new Response(
            JSON.stringify({
              success: true,
              data: { message: "Conflict resolved" },
            }),
            { headers },
          );
        } catch (error) {
          return handleDatabaseError(error, path, request.method);
        }
      }

      return new Response(
        JSON.stringify({
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
            "GET /api/devices",
            "POST /api/devices/register",
            "/api/transfer",
            "POST /api/analytics/events",
            "GET /api/analytics/dashboard",
            "POST /api/analytics/performance",
            "POST /api/analytics/errors",
            "POST /api/presence/heartbeat",
            "GET /api/presence/devices/:userId",
            "GET /api/presence/online",
            "POST /api/files/version",
            "GET /api/files/:fileId/versions",
            "POST /api/files/version/:versionId/restore",
            "GET /api/conflicts",
            "POST /api/conflicts/:id/resolve",
          ],
        }),
        { status: 404, headers },
      );
    } catch (error) {
      // Catch any unhandled errors and ensure they're returned as JSON
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorString = String(error);

      // eslint-disable-next-line no-console
      console.error("[API-ERROR]", errorMsg, {
        error,
        path,
        method,
        errorString,
      });

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
        return handleDatabaseError(
          error,
          path || "unknown",
          method || "UNKNOWN",
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: "An unexpected error occurred. Please try again.",
          code: "INTERNAL_ERROR",
        }),
        { status: 500, headers },
      );
    }
  },
};
