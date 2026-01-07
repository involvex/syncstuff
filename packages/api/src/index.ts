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
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error("[DB-ERROR]", errorMsg, { path, method });
  
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
  
  // Check for D1-specific errors
  if (errorMsg.includes("error code: 1042")) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Database schema mismatch. Please contact support.",
      code: "DB_SCHEMA_ERROR"
    }), { status: 500, headers });
  }
  
  if (errorMsg.includes("error code:") || errorMsg.includes("SQLITE_")) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Database error occurred. Please try again later.",
      code: "DB_ERROR"
    }), { status: 500, headers });
  }
  
  return new Response(JSON.stringify({ 
    success: false, 
    error: "Database error occurred",
    code: "DB_ERROR"
  }), { status: 500, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    
    // eslint-disable-next-line no-console
    console.log(`[API-RAW] ${request.method} ${path} (original: ${url.pathname})`);

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });

    const secret = env.JWT_SECRET || "dev-secret-key-change-me";

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
          } catch (dbError) {
            return handleDatabaseError(dbError, path, request.method);
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
            user = await env.syncstuff_db
              .prepare("SELECT password_hash FROM users WHERE id = ?")
              .bind(userId)
              .first<{ password_hash: string | null }>();
          } catch (dbError) {
            return handleDatabaseError(dbError, path, request.method);
          }

          if (!user) return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404, headers });

          if (user.password_hash) {
            if (!body.currentPassword || !(await verifyPassword(body.currentPassword, user.password_hash))) {
              return new Response(JSON.stringify({ success: false, error: "Wrong current password" }), { status: 401, headers });
            }
          }

          const newHash = await hashPassword(body.newPassword);
          try {
            await env.syncstuff_db
              .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
              .bind(newHash, Date.now(), userId)
              .run();
          } catch (dbError) {
            return handleDatabaseError(dbError, path, request.method);
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
        } catch (dbError) {
          return handleDatabaseError(dbError, path, request.method);
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
            } catch (dbError) {
              return handleDatabaseError(dbError, path, request.method);
            }
          }

          if (body.full_name) {
            try {
              await env.syncstuff_db
                .prepare("UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?")
                .bind(body.full_name, Date.now(), userId)
                .run();
            } catch (dbError) {
              return handleDatabaseError(dbError, path, request.method);
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

      return new Response(JSON.stringify({ 
        error: "Not found", 
        path, 
        method: request.method,
        availableEndpoints: [
          "/api/ping",
          "/api/auth/nop", 
          "/api/auth/login",
          "/api/auth/change-password", 
          "/api/auth/register",
          "/api/user/profile",
          "/api/user/settings"
        ]
      }), { status: 404, headers });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.error("[API-ERROR]", msg);
      return new Response(JSON.stringify({ success: false, error: "API Error", m: msg }), { status: 500, headers });
    }
  },
};